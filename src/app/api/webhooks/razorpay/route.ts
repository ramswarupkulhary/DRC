import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { sendEmail, drcEmailTemplate } from "@/lib/email";
import crypto from "crypto";

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get("x-razorpay-signature") || "";

  const settings = await prisma.siteSetting.findMany({
    where: { key: { in: ["razorpay_key_secret", "razorpay_webhook_secret"] } },
  });
  const map: Record<string, string> = {};
  settings.forEach((s) => { map[s.key] = s.value; });

  const webhookSecret = map.razorpay_webhook_secret || map.razorpay_key_secret || process.env.RAZORPAY_KEY_SECRET || "";

  if (webhookSecret && signature) {
    const expected = crypto.createHmac("sha256", webhookSecret).update(body).digest("hex");
    if (expected !== signature) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }
  }

  const event = JSON.parse(body);

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
