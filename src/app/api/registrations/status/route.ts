import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ status: null });
  }

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return NextResponse.json({ status: null });

  const url = new URL(req.url);
  const rideId = url.searchParams.get("rideId");
  const trainingId = url.searchParams.get("trainingId");

  if (!rideId && !trainingId) {
    return NextResponse.json({ status: null });
  }

  const registration = await prisma.registration.findFirst({
    where: {
      userId: user.id,
      ...(rideId ? { rideId } : { trainingId }),
      status: { notIn: ["cancelled"] },
    },
    orderBy: { createdAt: "desc" },
    select: { status: true, notes: true, ride: { select: { whatsappGroupLink: true } } },
  });

  if (!registration) {
    return NextResponse.json({ status: null });
  }

  return NextResponse.json({
    status: registration.status,
    notes: registration.notes,
    whatsappGroupLink: registration.ride?.whatsappGroupLink || null,
  });
}
