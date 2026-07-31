import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const images = await prisma.galleryImage.findMany({
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(images);
}

export async function POST(req: Request) {
  const body = await req.json();

  const image = await prisma.galleryImage.create({
    data: {
      url: body.url,
      caption: body.caption || null,
      rideId: body.rideId || null,
      featured: body.featured ?? false,
    },
  });

  return NextResponse.json(image, { status: 201 });
}
