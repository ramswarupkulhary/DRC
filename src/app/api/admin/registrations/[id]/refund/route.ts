import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { sendEmail, drcEmailTemplate } from "@/lib/email";
import Razorpay from "razorpay";

type Props = { params: Promise<{ id: string }> };

async function getRazorpayInstance() {
  const settings = await prisma.siteSetting.findMany({
    where: { key: { in: ["razorpay_key_id", "razorpay_key_secret"] } },
  });
  const map: Record<string, string> = {};
  settings.forEach((s) => { map[s.key] = s.value; });
  const keyId = map.razorpay_key_id || process.env.RAZORPAY_KEY_ID || "";
  const keySecret = map.razorpay_key_secret || process.env.RAZORPAY_KEY_SECRET || "";
  if (!keyId || !keySecret) return null;
  return new Razorpay({ key_id: keyId, key_secret: keySecret });
}

export async function POST(_req: Request, { params }: Props) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const role = (session.user as { role?: string }).role;
  if (role !== "admin" && role !== "coordinator") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const registration = await prisma.registration.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, name: true, email: true } },
      ride: { select: { title: true, startDate: true } },
      training: { select: { title: true } },
    },
  });

  if (!registration) {
    return NextResponse.json({ error: "Registration not found" }, { status: 404 });
  }

  if (!registration.paymentId) {
    return NextResponse.json({ error: "No Razorpay payment ID found. Cannot process refund for manual payments." }, { status: 400 });
  }

  const razorpay = await getRazorpayInstance();
  if (!razorpay) {
    return NextResponse.json({ error: "Razorpay not configured" }, { status: 500 });
  }

  try {
    const refund = await razorpay.payments.refund(registration.paymentId, {
      speed: "normal",
      notes: { registrationId: id, reason: "Admin initiated refund" },
    });

    await prisma.registration.update({
      where: { id },
      data: {
        status: "cancelled",
        paymentStatus: "refunded",
        notes: `Refund initiated. Refund ID: ${refund.id}`,
      },
    });

    const itemTitle = registration.ride?.title || registration.training?.title || "Unknown";

    await prisma.notification.create({
      data: {
        userId: registration.user.id,
        type: "payment",
        title: "Refund Initiated",
        message: `Your refund for "${itemTitle}" has been initiated. Refund ID: ${refund.id}. It will be credited within 5-7 business days.`,
        link: "/my-registrations",
      },
    });

    try {
      await sendEmail({
        to: registration.user.email,
        subject: `Refund Initiated — ${itemTitle}`,
        html: drcEmailTemplate({
          title: "Refund Initiated",
          body: `
            <p style="color: #F1E9DD; font-size: 15px;">Hi ${registration.user.name || "Rider"},</p>
            <p style="color: #B9A886; font-size: 14px;">Your refund for <strong style="color: #E8622C;">${itemTitle}</strong> has been initiated.</p>
            <p style="color: #B9A886; font-size: 14px;"><strong style="color: #F1E9DD;">Refund ID:</strong> ${refund.id}</p>
            <p style="color: #B9A886; font-size: 14px;">The amount will be credited back to your original payment method within <strong style="color: #F1E9DD;">5-7 business days</strong>.</p>
            <p style="color: #B9A886; font-size: 14px;">If you have any questions, feel free to reach out to us on WhatsApp.</p>
          `,
          ctaText: "View Registrations",
          ctaUrl: "https://www.dirtridecamp.com/my-registrations",
        }),
      });
    } catch (err) {
      console.error("[EMAIL] Refund notification email failed:", err);
    }

    return NextResponse.json({ success: true, refundId: refund.id });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Refund failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
