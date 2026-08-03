import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { slugify } from "@/lib/utils";

type Props = { params: Promise<{ id: string }> };

export async function PUT(req: Request, { params }: Props) {
  const { id } = await params;
  const body = await req.json();

  const inclusions = body.inclusions
    ? JSON.stringify(body.inclusions.split("\n").map((s: string) => s.trim()).filter(Boolean))
    : null;

  const ride = await prisma.ride.update({
    where: { id },
    data: {
      title: body.title,
      slug: slugify(body.title),
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
      memberDiscount: body.memberDiscount ?? 0,
      whatsappGroupLink: body.whatsappGroupLink || null,
      photosLink: body.photosLink || null,
    },
  });

  return NextResponse.json({ ride });
}

export async function PATCH(req: Request, { params }: Props) {
  const { id } = await params;
  const body = await req.json();

  const data: Record<string, unknown> = {};
  if (body.whatsappGroupLink !== undefined) data.whatsappGroupLink = body.whatsappGroupLink || null;
  if (body.photosLink !== undefined) data.photosLink = body.photosLink || null;
  if (body.status !== undefined) data.status = body.status;
  if (body.memberDiscount !== undefined) data.memberDiscount = body.memberDiscount;

  const ride = await prisma.ride.update({ where: { id }, data });
  return NextResponse.json({ ride });
}

export async function DELETE(_req: Request, { params }: Props) {
  const { id } = await params;
  await prisma.ride.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
