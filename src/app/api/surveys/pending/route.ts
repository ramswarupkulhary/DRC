import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json([]);
  const userId = (session.user as { id: string }).id;

  const completedRegs = await prisma.registration.findMany({
    where: {
      userId,
      status: { in: ["confirmed", "checked_in"] },
      ride: { status: "completed" },
    },
    include: {
      ride: { select: { id: true, title: true, startDate: true, surveys: { select: { id: true } } } },
    },
  });

  const answered = await prisma.surveyResponse.findMany({
    where: { userId },
    select: { surveyId: true },
  });
  const answeredIds = new Set(answered.map((a) => a.surveyId));

  const pending = completedRegs
    .filter((r) => r.ride && r.ride.surveys.length > 0)
    .flatMap((r) =>
      r.ride!.surveys
        .filter((s) => !answeredIds.has(s.id))
        .map((s) => ({
          surveyId: s.id,
          rideTitle: r.ride!.title,
          rideDate: r.ride!.startDate,
        }))
    );

  return NextResponse.json(pending);
}
