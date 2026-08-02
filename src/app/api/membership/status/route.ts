import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as { id: string }).id;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      membership: { include: { plan: true } },
    },
  });

  const membership = user?.membership && (user.membership.status === "active" || user.membership.status === "pending")
    ? {
        id: user.membership.id,
        planName: user.membership.plan.name,
        tshirtSize: user.membership.tshirtSize,
        startDate: user.membership.startDate,
        endDate: user.membership.endDate,
        status: user.membership.status,
      }
    : null;

  const plan = await prisma.membershipPlan.findFirst({
    where: { active: true },
  });

  return NextResponse.json({
    membership,
    plan: plan
      ? {
          id: plan.id,
          name: plan.name,
          price: plan.price,
          duration: plan.duration,
          benefits: JSON.parse(plan.benefits) as string[],
          upiId: plan.upiId,
        }
      : null,
  });
}
