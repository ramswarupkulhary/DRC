import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendEmail, drcEmailTemplate } from "@/lib/email";
import { refundPayment } from "@/lib/razorpay";
import { promoteWaitlist } from "@/lib/waitlist";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();

  const data: Record<string, unknown> = {};
  if (body.status) data.status = body.status;
  if (body.paymentStatus) data.paymentStatus = body.paymentStatus;
  if (body.notes !== undefined) data.notes = body.notes;

  const registration = await prisma.registration.update({
    where: { id },
    data,
    include: {
      user: { select: { email: true, name: true } },
      ride: { select: { title: true, whatsappGroupLink: true } },
      training: { select: { title: true } },
    },
  });

  // Auto-refund only when an admin rejects a paid registration.
  // Rider-initiated cancellations are non-refundable.
  if (body.status === "rejected" && registration.paymentStatus === "paid" && registration.paymentId) {
    const refunded = await refundPayment(registration.paymentId, registration.amount);
    if (refunded) {
      await prisma.registration.update({ where: { id }, data: { paymentStatus: "refunded" } });
    }
  }

  const eventTitle = registration.ride?.title || registration.training?.title || "event";
  const riderEmail = registration.user.email;
  const riderName = registration.user.name || "Rider";

  try {
    if (body.status === "rejected") {
      const reason = body.notes || "No reason provided";
      await prisma.notification.create({
        data: {
          userId: registration.userId,
          type: "registration",
          title: "Registration Rejected",
          message: `Your registration for ${eventTitle} was rejected. Reason: ${reason}`,
          link: "/my-registrations",
        },
      });
      await sendEmail({
        to: riderEmail,
        subject: `Registration Rejected — ${eventTitle}`,
        html: drcEmailTemplate({
          title: "Registration Rejected",
          body: `
            <p style="color: #F1E9DD; font-size: 15px;">Hi ${riderName},</p>
            <p style="color: #B9A886; font-size: 14px;">Unfortunately, your registration for <strong style="color: #E8622C;">${eventTitle}</strong> has been rejected.</p>
            <div style="background: #0D0D0D; border: 1px solid #E8622C; border-radius: 4px; padding: 12px; margin: 16px 0;">
              <p style="color: #F1E9DD; font-size: 13px; margin: 0;"><strong>Reason:</strong> ${reason}</p>
            </div>
            <p style="color: #B9A886; font-size: 14px;">You can register again if the issue is resolved.</p>
          `,
          ctaText: "View Rides",
          ctaUrl: "https://www.dirtridecamp.com/rides",
        }),
      });
    } else if (body.status === "confirmed") {
      const whatsappLink = registration.ride?.whatsappGroupLink;
      await prisma.notification.create({
        data: {
          userId: registration.userId,
          type: "registration",
          title: "Registration Confirmed!",
          message: `Your registration for ${eventTitle} has been confirmed. See you on the trail!`,
          link: "/my-registrations",
        },
      });
      await sendEmail({
        to: riderEmail,
        subject: `Registration Confirmed — ${eventTitle}`,
        html: drcEmailTemplate({
          title: "You're In! Registration Confirmed",
          body: `
            <p style="color: #F1E9DD; font-size: 15px;">Hi ${riderName},</p>
            <p style="color: #B9A886; font-size: 14px;">Your registration for <strong style="color: #E8622C;">${eventTitle}</strong> has been confirmed!</p>
            <p style="color: #B9A886; font-size: 14px;">Get your bike ready and gear up. See you on the trail!</p>
            ${whatsappLink ? `
            <div style="background: #0D0D0D; border: 1px solid #25D366; border-radius: 4px; padding: 16px; margin: 16px 0; text-align: center;">
              <p style="color: #F1E9DD; font-size: 14px; margin: 0 0 12px 0;"><strong>Join the WhatsApp Group</strong></p>
              <a href="${whatsappLink}" style="display: inline-block; background: #25D366; color: #ffffff; padding: 10px 24px; border-radius: 4px; text-decoration: none; font-size: 14px; font-weight: bold;">Join WhatsApp Group</a>
            </div>
            ` : ""}
          `,
          ctaText: "My Registrations",
          ctaUrl: "https://www.dirtridecamp.com/my-registrations",
        }),
      });
    } else if (body.status === "cancelled") {
      const reason = body.notes || "No specific reason provided";
      await prisma.notification.create({
        data: {
          userId: registration.userId,
          type: "registration",
          title: "Registration Cancelled",
          message: `Your registration for ${eventTitle} has been cancelled. Reason: ${reason}`,
          link: "/my-registrations",
        },
      });
      await sendEmail({
        to: riderEmail,
        subject: `Registration Cancelled — ${eventTitle}`,
        html: drcEmailTemplate({
          title: "Registration Cancelled",
          body: `
            <p style="color: #F1E9DD; font-size: 15px;">Hi ${riderName},</p>
            <p style="color: #B9A886; font-size: 14px;">Your registration for <strong style="color: #E8622C;">${eventTitle}</strong> has been cancelled.</p>
            ${reason !== "No specific reason provided" ? `
            <div style="background: #0D0D0D; border: 1px solid #E8622C; border-radius: 4px; padding: 12px; margin: 16px 0;">
              <p style="color: #F1E9DD; font-size: 13px; margin: 0;"><strong>Reason:</strong> ${reason}</p>
            </div>
            ` : ""}
            <p style="color: #B9A886; font-size: 14px;">If you believe this is an error or have questions, please reach out to us.</p>
          `,
          ctaText: "View Rides",
          ctaUrl: "https://www.dirtridecamp.com/rides",
        }),
      });
    }
  } catch (err) {
    console.error("[EMAIL] Failed to send status email:", err);
  }

  // Waitlist auto-promotion: when a slot opens, notify next waitlisted rider
  if (body.status === "cancelled" && registration.rideId) {
    try {
      const nextWaitlisted = await prisma.waitlist.findFirst({
        where: { rideId: registration.rideId, status: "waiting", notified: false },
        orderBy: { createdAt: "asc" },
        include: { user: { select: { id: true, email: true, name: true } }, ride: { select: { title: true, slug: true } } },
      });
      if (nextWaitlisted && nextWaitlisted.ride) {
        await prisma.waitlist.update({ where: { id: nextWaitlisted.id }, data: { notified: true, status: "notified" } });
        await prisma.notification.create({
          data: {
            userId: nextWaitlisted.user.id,
            type: "waitlist",
            title: "Spot Available!",
            message: `A spot just opened for ${nextWaitlisted.ride.title}! Register now before it's taken.`,
            link: `/rides/${nextWaitlisted.ride.slug}`,
          },
        });
        await sendEmail({
          to: nextWaitlisted.user.email,
          subject: `Spot Available — ${nextWaitlisted.ride.title}!`,
          html: drcEmailTemplate({
            title: "A Spot Just Opened Up!",
            body: `
              <p style="color: #F1E9DD; font-size: 15px;">Hi ${nextWaitlisted.user.name || "Rider"},</p>
              <p style="color: #B9A886; font-size: 14px;">Great news! A spot just opened for <strong style="color: #E8622C;">${nextWaitlisted.ride.title}</strong>.</p>
              <p style="color: #B9A886; font-size: 14px;">You were on the waitlist — now's your chance! Register quickly before someone else takes it.</p>
            `,
            ctaText: "Register Now",
            ctaUrl: `https://www.dirtridecamp.com/rides/${nextWaitlisted.ride.slug}`,
          }),
        });
      }
    } catch (err) {
      console.error("[WAITLIST] Auto-promotion failed:", err);
    }
  }

  // Training waitlist promotion (rides handled above) — also pushes web-push/WhatsApp.
  if (body.status === "cancelled" && registration.trainingId) {
    try {
      await promoteWaitlist({ trainingId: registration.trainingId });
    } catch (err) {
      console.error("[WAITLIST] Training auto-promotion failed:", err);
    }
  }

  return NextResponse.json(registration);
}
