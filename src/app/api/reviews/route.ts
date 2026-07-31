import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const userId = (session.user as { id: string }).id;
  const body = await req.json();

  if (!body.rating || body.rating < 1 || body.rating > 5) {
    return NextResponse.json({ error: "Rating must be between 1 and 5" }, { status: 400 });
  }

  const review = await prisma.review.create({
    data: {
      userId,
      rideId: body.rideId || null,
      trainingId: body.trainingId || null,
      rating: body.rating,
      comment: body.comment || "",
      approved: false,
    },
  });

  return NextResponse.json(review, { status: 201 });
}
