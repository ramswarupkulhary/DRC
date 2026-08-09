import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { slugify } from "@/lib/utils";

export async function POST(req: Request) {
  const body = await req.json();

  const slug = slugify(body.title);
  const inclusions = body.inclusions
    ? JSON.stringify(body.inclusions.split("\n").map((s: string) => s.trim()).filter(Boolean))
    : null;

  const ride = await prisma.ride.create({
    data: {
      title: body.title,
      slug,
      description: body.description,
      shortDesc: body.shortDesc,
      location: body.location,
      state: body.state,
      startDate: new Date(body.startDate),
      endDate: new Date(body.endDate),
      startPoint: body.startPoint,
      startTime: body.startTime,
      price: body.price,
      totalSlots: body.totalSlots,
      difficulty: body.difficulty,
      type: body.type,
      status: body.status,
      featured: body.featured || false,
      inclusions,
      coverImage: body.coverImage || null,
      images: body.images || null,
      earlyBirdPrice: body.earlyBirdPrice ? parseInt(body.earlyBirdPrice) : null,
      earlyBirdDeadline: body.earlyBirdDeadline ? new Date(body.earlyBirdDeadline) : null,
      whatsappGroupLink: body.whatsappGroupLink || null,
      photosLink: body.photosLink || null,
    },
  });

  return NextResponse.json({ ride }, { status: 201 });
}
