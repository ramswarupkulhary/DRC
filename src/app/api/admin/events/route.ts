import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as { role?: string }).role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const events = await prisma.event.findMany({ orderBy: { date: "desc" } });
  return NextResponse.json(events);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as { role?: string }).role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const body = await req.json();
  const event = await prisma.event.create({
    data: {
      title: body.title,
      slug: body.slug,
      description: body.description,
      type: body.type,
      date: new Date(body.date),
      location: body.location,
      price: body.price || 0,
      totalSlots: body.totalSlots || 0,
      status: body.status || "upcoming",
      featured: body.featured || false,
      prizes: body.prizes || null,
      rules: body.rules || null,
    },
  });
  return NextResponse.json(event, { status: 201 });
}
