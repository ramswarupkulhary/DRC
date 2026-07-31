import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, type, itemId, couponCode } = await req.json();

  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || "placeholder_secret")
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest("hex");

  if (expectedSignature !== razorpay_signature) {
    return NextResponse.json({ error: "Invalid payment signature" }, { status: 400 });
  }

  const userId = (session.user as { id: string }).id;

  try {
    if (type === "ride" || type === "training") {
      await prisma.registration.create({
        data: {
          userId,
          ...(type === "ride" ? { rideId: itemId } : { trainingId: itemId }),
          status: "confirmed",
          paymentStatus: "paid",
          paymentId: razorpay_payment_id,
          amount: 0,
        },
      });
    } else if (type === "membership") {
      const plan = await prisma.membershipPlan.findUnique({ where: { id: itemId } });
      if (plan) {
        const startDate = new Date();
        const endDate = new Date();
        endDate.setMonth(endDate.getMonth() + plan.durationMonths);

        await prisma.membership.create({
          data: {
            userId,
            planId: itemId,
            startDate,
            endDate,
            status: "active",
          },
        });
      }
    } else if (type === "order") {
      await prisma.order.update({
        where: { id: itemId },
        data: { status: "confirmed", paymentId: razorpay_payment_id },
      });
    }

    if (couponCode) {
      await prisma.coupon.update({
        where: { code: couponCode },
        data: { usedCount: { increment: 1 } },
      });
    }

    await prisma.notification.create({
      data: {
        userId,
        title: "Payment Successful",
        message: `Your payment for ${type} has been confirmed. Payment ID: ${razorpay_payment_id}`,
        type: "payment",
      },
    });

    return NextResponse.json({ success: true, paymentId: razorpay_payment_id });
  } catch {
    return NextResponse.json({ error: "Failed to process payment" }, { status: 500 });
  }
}
