import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { sendEmail, drcEmailTemplate } from "@/lib/email";
import crypto from "crypto";
import { escapePassText } from "@/lib/spectatorPass";

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get("x-razorpay-signature") || "";

  const settings = await prisma.siteSetting.findMany({
    where: { key: { in: ["razorpay_key_secret", "razorpay_webhook_secret"] } },
  });
  const map: Record<string, string> = {};
  settings.forEach((s) => { map[s.key] = s.value; });

  const webhookSecret = map.razorpay_webhook_secret || process.env.RAZORPAY_WEBHOOK_SECRET || map.razorpay_key_secret || process.env.RAZORPAY_KEY_SECRET || "";

  if (!webhookSecret || !/^[a-f0-9]{64}$/.test(signature)) return NextResponse.json({ error: "Webhook signature is required" }, { status: 401 });
  const expected = crypto.createHmac("sha256", webhookSecret).update(body).digest("hex");
  if (!crypto.timingSafeEqual(Buffer.from(expected, "hex"), Buffer.from(signature, "hex"))) return NextResponse.json({ error: "Invalid signature" }, { status: 400 });

  let event;
  try { event = JSON.parse(body); } catch { return NextResponse.json({ error: "Invalid webhook payload" }, { status: 400 }); }

  if (["refund.processed", "refund.failed"].includes(event.event)) {
    const refund = event.payload?.refund?.entity;
    if (!refund || typeof refund.id !== "string" || typeof refund.payment_id !== "string") return NextResponse.json({ error: "Missing refund details" }, { status: 400 });
    const notedId = typeof refund.notes?.eventRegistrationId === "string" ? refund.notes.eventRegistrationId : null;
    const registration = await prisma.eventRegistration.findFirst({ where: {
      razorpayPaymentId: refund.payment_id,
      OR: [{ refundId: refund.id }, ...(notedId ? [{ id: notedId, refundStatus: { in: ["processing", "unknown"] } }] : [])],
    } });
    if (registration) {
      const processed = event.event === "refund.processed";
      if (Number(refund.amount) !== registration.amount * 100 || refund.currency !== registration.currency || refund.status !== (processed ? "processed" : "failed")) return NextResponse.json({ error: "Refund does not match registration" }, { status: 400 });
      const changed = await prisma.eventRegistration.updateMany({
        where: { id: registration.id, refundStatus: { in: ["processing", "unknown", "pending"] } },
        data: { status: "cancelled", cancelledAt: registration.cancelledAt || new Date(), cancelledById: registration.cancelledById || registration.refundRequestedById, reservationExpiresAt: null, refundId: refund.id, refundStatus: processed ? "processed" : "failed", paymentStatus: processed ? "refunded" : "paid" },
      });
      if (changed.count) {
        try {
          const title = processed ? "Event refund processed" : "Event refund failed";
          const message = processed
            ? `Your refund of ${registration.currency} ${registration.amount} has been processed. Reference: ${refund.id}.`
            : `The payment provider reports your refund failed. Your booking remains cancelled; please contact the event team. Reference: ${refund.id}.`;
          if (registration.userId) await prisma.notification.create({ data: { userId: registration.userId, type: "payment", title, message, link: "/my-registrations" } });
          await sendEmail({ to: registration.email, subject: title, html: drcEmailTemplate({ title, body: `<p>${escapePassText(message)}</p>`, ctaText: "My Registrations", ctaUrl: `${process.env.NEXT_PUBLIC_BASE_URL || "https://www.dirtridecamp.com"}/my-registrations` }) });
        } catch (error) { console.error("[event refund webhook notification]", error); }
      }
      return NextResponse.json({ ok: true });
    }
  }

  if (event.event === "refund.processed") {
    const refund = event.payload?.refund?.entity;
    if (!refund) return NextResponse.json({ ok: true });

    const paymentId = refund.payment_id;
    const refundAmount = (refund.amount / 100).toLocaleString("en-IN");

    const registration = await prisma.registration.findFirst({
      where: { paymentId },
      include: {
        user: { select: { id: true, name: true, email: true } },
        ride: { select: { title: true } },
        training: { select: { title: true } },
      },
    });

    if (registration) {
      const itemTitle = registration.ride?.title || registration.training?.title || "your booking";

      await prisma.notification.create({
        data: {
          userId: registration.user.id,
          type: "payment",
          title: "Refund Credited",
          message: `₹${refundAmount} has been credited to your account for "${itemTitle}".`,
          link: "/my-registrations",
        },
      });

      try {
        await sendEmail({
          to: registration.user.email,
          subject: `Refund Credited — ₹${refundAmount}`,
          html: drcEmailTemplate({
            title: "Refund Credited!",
            body: `
              <p style="color: #F1E9DD; font-size: 15px;">Hi ${registration.user.name || "Rider"},</p>
              <p style="color: #B9A886; font-size: 14px;">Great news! Your refund of <strong style="color: #E8622C;">₹${refundAmount}</strong> for <strong style="color: #F1E9DD;">${itemTitle}</strong> has been successfully credited to your account.</p>
              <p style="color: #B9A886; font-size: 14px;">If you don't see it yet, please allow a few hours for your bank to process it.</p>
              <p style="color: #B9A886; font-size: 14px;">We hope to see you on another ride soon!</p>
            `,
            ctaText: "Browse Rides",
            ctaUrl: "https://www.dirtridecamp.com/rides",
          }),
        });
      } catch (err) {
        console.error("[EMAIL] Refund credited email failed:", err);
      }
    }
  }

  return NextResponse.json({ ok: true });
}
