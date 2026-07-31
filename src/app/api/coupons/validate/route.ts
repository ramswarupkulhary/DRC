import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const { code } = await req.json();

  const coupon = await prisma.coupon.findUnique({ where: { code } });

  if (!coupon) return NextResponse.json({ error: "Invalid coupon code" }, { status: 404 });
  if (!coupon.active) return NextResponse.json({ error: "This coupon is no longer active" }, { status: 400 });
  if (coupon.validUntil < new Date()) return NextResponse.json({ error: "This coupon has expired" }, { status: 400 });
  if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) return NextResponse.json({ error: "This coupon has reached its usage limit" }, { status: 400 });

  return NextResponse.json({
    code: coupon.code,
    type: coupon.type,
    value: coupon.value,
    minAmount: coupon.minAmount,
  });
}
