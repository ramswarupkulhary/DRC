import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as { id: string }).id;
  const { planId, tshirtSize, paymentProof } = await req.json();

  if (!planId || !paymentProof) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({
    where: { id: userId },
    include: { membership: true },
  });

  if (existing?.membership && (existing.membership.status === "active" || existing.membership.status === "pending")) {
    return NextResponse.json({ error: "You already have an active or pending membership" }, { status: 400 });
  }

  const plan = await prisma.membershipPlan.findUnique({ where: { id: planId } });
  if (!plan) {
    return NextResponse.json({ error: "Plan not found" }, { status: 404 });
  }

  const endDate = new Date();
  endDate.setDate(endDate.getDate() + plan.duration);

  await prisma.membership.create({
    data: {
      planId,
      tshirtSize: tshirtSize || null,
      paymentProof,
      status: "pending",
      endDate,
      users: { connect: { id: userId } },
    },
  });

  return NextResponse.json({ success: true });
}
