import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";

export async function POST(req: Request) {
  const body = await req.json();
  const slug = slugify(body.title);

  const training = await prisma.training.create({
    data: {
      title: body.title,
      slug,
      description: body.description,
      shortDesc: body.shortDesc,
      level: body.level || "beginner",
      category: body.category || "special_trail",
      duration: body.duration,
      price: body.price,
      totalSlots: body.totalSlots ?? null,
      location: body.location,
      status: body.status || "draft",
      featured: body.featured || false,
      curriculum: body.curriculum,
      coverImage: body.coverImage || null,
      images: body.images || null,
    },
  });

  return NextResponse.json(training, { status: 201 });
}
