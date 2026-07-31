import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { randomBytes } from "crypto";

export async function POST(req: Request) {
  const { code } = await req.json();

  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  const userId = (session.user as { id: string }).id;

  const referrer = await prisma.user.findFirst({ where: { referralCode: code } });
  if (!referrer) return NextResponse.json({ error: "Invalid referral code" }, { status: 404 });
  if (referrer.id === userId) return NextResponse.json({ error: "Cannot refer yourself" }, { status: 400 });

  const existing = await prisma.referral.findFirst({
    where: { referredId: userId },
  });
  if (existing) return NextResponse.json({ error: "Referral already applied" }, { status: 400 });

  await prisma.referral.create({
    data: {
      referrerId: referrer.id,
      referredId: userId,
      code,
      status: "completed",
      reward: 200,
    },
  });

  await prisma.user.update({
    where: { id: referrer.id },
    data: { referralCredits: { increment: 200 } },
  });

  return NextResponse.json({ ok: true, message: "Referral applied! Your friend earned ₹200 credit." });
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  const userId = (session.user as { id: string }).id;

  let user = await prisma.user.findUnique({
    where: { id: userId },
    select: { referralCode: true, referralCredits: true },
  });

  if (!user?.referralCode) {
    const code = `DRC-${randomBytes(3).toString("hex").toUpperCase()}`;
    user = await prisma.user.update({
      where: { id: userId },
      data: { referralCode: code },
      select: { referralCode: true, referralCredits: true },
    });
  }

  const referrals = await prisma.referral.findMany({
    where: { referrerId: userId },
    include: { referred: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ ...user, referrals });
}
