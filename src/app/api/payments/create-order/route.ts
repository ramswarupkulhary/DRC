import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { computeQuote, type PurchaseType } from "@/lib/pricing";
import Razorpay from "razorpay";

async function getRazorpayInstance() {
  const settings = await prisma.siteSetting.findMany({
    where: { key: { in: ["razorpay_key_id", "razorpay_key_secret"] } },
  });
  const map: Record<string, string> = {};
  settings.forEach((s) => { map[s.key] = s.value; });

  const keyId = map.razorpay_key_id || process.env.RAZORPAY_KEY_ID || "";
  const keySecret = map.razorpay_key_secret || process.env.RAZORPAY_KEY_SECRET || "";

  if (!keyId || !keySecret) return null;

  return { instance: new Razorpay({ key_id: keyId, key_secret: keySecret }), keyId };
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rz = await getRazorpayInstance();
  if (!rz) {
    return NextResponse.json({ error: "Razorpay is not configured. Ask admin to add keys in Settings." }, { status: 500 });
  }

  const { type, itemId, couponCode } = await req.json();

  if (!type || !itemId) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const userId = (session.user as { id: string }).id;

  // Price is computed server-side from the database (early-bird + member
  // discount + coupon). The client-supplied amount is never trusted.
  const quote = await computeQuote(type as PurchaseType, itemId, userId, couponCode);
  if (!quote) {
    return NextResponse.json({ error: "Item not found" }, { status: 404 });
  }
  if (quote.error) {
    return NextResponse.json({ error: quote.error }, { status: 400 });
  }

  const finalAmount = quote.finalAmount;
  if (finalAmount < 1) {
    return NextResponse.json({ error: "Invalid payment amount" }, { status: 400 });
  }

  try {
    const order = await rz.instance.orders.create({
      amount: finalAmount * 100,
      currency: "INR",
      receipt: `${type}_${itemId}_${Date.now()}`,
      notes: {
        type,
        itemId,
        userId,
        couponCode: couponCode || "",
      },
    });

    return NextResponse.json({
      orderId: order.id,
      amount: finalAmount,
      currency: "INR",
      key: rz.keyId,
    });
  } catch {
    return NextResponse.json({ error: "Failed to create payment order" }, { status: 500 });
  }
}
