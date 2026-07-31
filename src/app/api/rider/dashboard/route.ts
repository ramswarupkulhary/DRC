import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  const userId = (session.user as { id: string }).id;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      skillLevel: true, skillPoints: true, totalRides: true,
      totalKm: true, totalHours: true, referralCode: true, referralCredits: true,
    },
  });

  const badges = await prisma.userBadge.findMany({
    where: { userId },
    include: { badge: true },
    orderBy: { earnedAt: "desc" },
  });

  const recentLogs = await prisma.rideLog.findMany({
    where: { userId },
    include: { ride: { select: { title: true } } },
    orderBy: { date: "desc" },
    take: 5,
  });

  return NextResponse.json({
    user,
    badges: badges.map((ub) => ({
      id: ub.badge.id,
      name: ub.badge.name,
      icon: ub.badge.icon,
      description: ub.badge.description,
      earnedAt: ub.earnedAt.toISOString(),
    })),
    recentLogs,
  });
}
