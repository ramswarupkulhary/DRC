import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as { role?: string }).role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();
  const { title, shortDesc, description, coverImage, images, date, location, state } = body;

  const ride = await prisma.ride.update({
    where: { id },
    data: {
      title,
      shortDesc: shortDesc || null,
      description: description || "",
      coverImage: coverImage || null,
      images: images || null,
      startDate: date ? new Date(date) : undefined,
      endDate: date ? new Date(date) : undefined,
      location,
      state: state || null,
    },
  });

  return NextResponse.json(ride);
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as { role?: string }).role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  await prisma.ride.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
