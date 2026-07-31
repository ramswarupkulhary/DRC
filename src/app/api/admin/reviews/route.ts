import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const reviews = await prisma.review.findMany({
    orderBy: { createdAt: "desc" },
    include: { user: { select: { name: true, email: true } } },
  });
  return NextResponse.json(reviews);
}

export async function POST(req: Request) {
  const body = await req.json();

  const review = await prisma.review.create({
    data: {
      userId: body.userId,
      rideId: body.rideId || null,
      trainingId: body.trainingId || null,
      rating: body.rating,
      comment: body.comment,
      approved: body.approved ?? false,
    },
  });

  return NextResponse.json(review, { status: 201 });
}
