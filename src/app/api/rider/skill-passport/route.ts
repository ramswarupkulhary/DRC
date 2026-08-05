import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  const userId = (session.user as { id: string }).id;

  const [user, badges, rideHistory, trainingsCompleted, certificateCount] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: {
        name: true, image: true, skillLevel: true, skillPoints: true,
        totalRides: true, totalKm: true, totalHours: true, createdAt: true,
      },
    }),
    prisma.userBadge.findMany({
      where: { userId },
      include: { badge: true },
      orderBy: { earnedAt: "desc" },
    }),
    prisma.registration.findMany({
      where: { userId, status: { in: ["confirmed", "checked_in"] }, rideId: { not: null } },
      include: { ride: { select: { title: true, startDate: true, difficulty: true, location: true } } },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
    prisma.registration.count({
      where: { userId, status: { in: ["confirmed", "checked_in"] }, trainingId: { not: null } },
    }),
    prisma.certificate.count({ where: { userId } }),
  ]);

  return NextResponse.json({
    user,
    badges: badges.map((ub) => ({
      id: ub.badge.id, name: ub.badge.name, icon: ub.badge.icon,
      description: ub.badge.description, earnedAt: ub.earnedAt.toISOString(),
    })),
    rideHistory: rideHistory
      .filter((r) => r.ride)
      .map((r) => ({
        id: r.id, title: r.ride!.title,
        date: r.ride!.startDate?.toISOString() || "",
        difficulty: r.ride!.difficulty, location: r.ride!.location,
      })),
    trainingsCompleted,
    certificateCount,
  });
}
