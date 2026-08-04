import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { slugify } from "@/lib/utils";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const ride = await prisma.ride.findUnique({ where: { id } });
  if (!ride) return NextResponse.json({ error: "Ride not found" }, { status: 404 });

  const newTitle = `${ride.title} (Copy)`;
  let slug = slugify(newTitle);
  const existing = await prisma.ride.findUnique({ where: { slug } });
  if (existing) slug = `${slug}-${Date.now()}`;

  const duplicate = await prisma.ride.create({
    data: {
      title: newTitle,
      slug,
      description: ride.description,
      shortDesc: ride.shortDesc,
      location: ride.location,
      state: ride.state,
      startDate: new Date(),
      endDate: new Date(),
      startPoint: ride.startPoint,
      startTime: ride.startTime,
      price: ride.price,
      totalSlots: ride.totalSlots,
      coverImage: ride.coverImage,
      images: ride.images,
      inclusions: ride.inclusions,
      itinerary: ride.itinerary,
      difficulty: ride.difficulty,
      type: ride.type,
      status: "draft",
      featured: false,
      memberDiscount: ride.memberDiscount,
      earlyBirdPrice: ride.earlyBirdPrice,
      earlyBirdDeadline: null,
      routeData: ride.routeData,
      elevationData: ride.elevationData,
      terrainTypes: ride.terrainTypes,
      distance: ride.distance,
      elevationGain: ride.elevationGain,
      instructorId: ride.instructorId,
    },
  });

  return NextResponse.json({ ride: duplicate });
}
