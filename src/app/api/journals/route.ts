import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const journals = await prisma.rideJournal.findMany({
    where: { published: true },
    include: {
      user: { select: { name: true } },
      ride: { select: { title: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  return NextResponse.json(journals);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  const userId = (session.user as { id: string }).id;
  const body = await req.json();

  const journal = await prisma.rideJournal.create({
    data: {
      userId,
      title: body.title,
      content: body.content,
      terrain: body.terrain,
      rideId: body.rideId || null,
      published: true,
      approved: true,
    },
    include: {
      user: { select: { name: true } },
      ride: { select: { title: true } },
    },
  });

  return NextResponse.json(journal, { status: 201 });
}
