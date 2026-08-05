import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "") + "-" + Date.now().toString(36);
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as { role?: string }).role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rides = await prisma.ride.findMany({
    where: { status: "past" },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      shortDesc: true,
      description: true,
      coverImage: true,
      images: true,
      startDate: true,
      location: true,
      state: true,
      createdAt: true,
    },
  });

  return NextResponse.json(rides);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as { role?: string }).role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { title, shortDesc, description, coverImage, images, date, location, state } = body;

  if (!title || !location) {
    return NextResponse.json({ error: "Title and location are required" }, { status: 400 });
  }

  const ride = await prisma.ride.create({
    data: {
      title,
      slug: generateSlug(title),
      shortDesc: shortDesc || null,
      description: description || "",
      coverImage: coverImage || null,
      images: images || null,
      startDate: date ? new Date(date) : null,
      endDate: date ? new Date(date) : null,
      location,
      state: state || null,
      price: 0,
      totalSlots: 0,
      status: "past",
      type: "ride",
    },
  });

  return NextResponse.json(ride, { status: 201 });
}
