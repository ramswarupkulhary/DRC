import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendEmail, drcEmailTemplate } from "@/lib/email";

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
      ride: { select: { title: true } },
      training: { select: { title: true } },
    },
  });

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
          `,
          ctaText: "My Registrations",
          ctaUrl: "https://www.dirtridecamp.com/my-registrations",
        }),
      });
    }
  } catch (err) {
    console.error("[EMAIL] Failed to send status email:", err);
  }

  return NextResponse.json(registration);
}
