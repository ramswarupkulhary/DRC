import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  const userId = (session.user as { id: string }).id;
  const body = await req.json();

  if (!body.rideId && !body.trainingId) {
    return NextResponse.json({ error: "Must specify a ride or training" }, { status: 400 });
  }

  const existing = await prisma.waitlist.findFirst({
    where: {
      userId,
      ...(body.rideId ? { rideId: body.rideId } : { trainingId: body.trainingId }),
    },
  });

  if (existing) return NextResponse.json({ error: "Already on waitlist" }, { status: 400 });

  const entry = await prisma.waitlist.create({
    data: {
      userId,
      rideId: body.rideId || null,
      trainingId: body.trainingId || null,
    },
  });

  return NextResponse.json(entry, { status: 201 });
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  const userId = (session.user as { id: string }).id;

  const entries = await prisma.waitlist.findMany({
    where: { userId },
    include: {
      ride: { select: { title: true, startDate: true } },
      training: { select: { title: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(entries);
}
