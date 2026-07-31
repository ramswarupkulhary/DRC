import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const training = await prisma.training.findUnique({ where: { id } });
  if (!training) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(training);
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();

  const training = await prisma.training.update({
    where: { id },
    data: {
      title: body.title,
      slug: slugify(body.title),
      description: body.description,
      shortDesc: body.shortDesc,
      level: body.level,
      duration: body.duration,
      price: body.price,
      totalSlots: body.totalSlots,
      location: body.location,
      status: body.status,
      featured: body.featured,
      curriculum: body.curriculum,
    },
  });

  return NextResponse.json(training);
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await prisma.training.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
