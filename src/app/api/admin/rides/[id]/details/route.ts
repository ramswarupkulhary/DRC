import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const ride = await prisma.ride.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      startDate: true,
      endDate: true,
      location: true,
      totalSlots: true,
      price: true,
      memberDiscount: true,
      type: true,
      status: true,
      whatsappGroupLink: true,
      photosLink: true,
      photosPublished: true,
    },
  });

  if (!ride) {
    return NextResponse.json({ error: "Ride not found" }, { status: 404 });
  }

  return NextResponse.json(ride);
}
