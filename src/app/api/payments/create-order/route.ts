import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Razorpay from "razorpay";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || "rzp_test_placeholder",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "placeholder_secret",
});

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { type, itemId, amount, couponCode } = await req.json();

  if (!type || !itemId || !amount) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  let finalAmount = amount;

  if (couponCode) {
    const coupon = await prisma.coupon.findUnique({ where: { code: couponCode } });
    if (coupon && coupon.active && (!coupon.validUntil || coupon.validUntil > new Date())) {
      if (coupon.minAmount && amount < coupon.minAmount) {
        return NextResponse.json({ error: `Minimum amount ₹${coupon.minAmount} required` }, { status: 400 });
      }
      if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
        return NextResponse.json({ error: "Coupon usage limit reached" }, { status: 400 });
      }
      if (coupon.type === "percentage") {
        finalAmount = Math.round(amount * (1 - coupon.value / 100));
      } else {
        finalAmount = Math.max(0, amount - coupon.value);
      }
    }
  }

  try {
    const order = await razorpay.orders.create({
      amount: finalAmount * 100,
      currency: "INR",
      receipt: `${type}_${itemId}_${Date.now()}`,
      notes: {
        type,
        itemId,
        userId: (session.user as { id: string }).id,
        couponCode: couponCode || "",
      },
    });

    return NextResponse.json({
      orderId: order.id,
      amount: finalAmount,
      currency: "INR",
      key: process.env.RAZORPAY_KEY_ID || "rzp_test_placeholder",
    });
  } catch {
    return NextResponse.json({ error: "Failed to create payment order" }, { status: 500 });
  }
}
