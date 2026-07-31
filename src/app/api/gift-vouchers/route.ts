import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { randomBytes } from "crypto";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  const userId = (session.user as { id: string }).id;
  const body = await req.json();

  if (!body.amount || body.amount < 500) {
    return NextResponse.json({ error: "Minimum voucher amount is ₹500" }, { status: 400 });
  }

  const code = `DRC-${randomBytes(3).toString("hex").toUpperCase()}`;
  const expiresAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);

  const voucher = await prisma.giftVoucher.create({
    data: {
      code,
      amount: body.amount,
      balance: body.amount,
      purchaserId: userId,
      recipientName: body.recipientName,
      recipientEmail: body.recipientEmail,
      message: body.message,
      expiresAt,
    },
  });

  return NextResponse.json(voucher, { status: 201 });
}
