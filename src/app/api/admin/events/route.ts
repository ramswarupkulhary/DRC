import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Idempotently ensure the flagship Ultimate Rider event exists in the Event table
// so the admin panel and public /events listing always show it, even though the
// rich detail page at /events/drc-ultimate-rider is a hardcoded route.
async function ensureUltimateRider() {
  await prisma.event.upsert({
    where: { slug: "drc-ultimate-rider" },
    create: {
      title: "DRC Ultimate Rider",
      slug: "drc-ultimate-rider",
      description:
        "The first official DRC race. Two days, every surface — enduro, rock garden, hill climb, slush, mud and technical. Saturday: qualification, elimination and challenges. Sunday: the Final. Overall prize pool ₹5,00,000. Held in partnership with Dev Venkat (3× National Champion) and Tribal Adventure.",
      type: "race",
      date: new Date("2026-12-12T00:00:00.000Z"),
      endDate: new Date("2026-12-13T23:59:59.000Z"),
      location: "Bengaluru, India",
      price: 4999,
      totalSlots: 200,
      status: "upcoming",
      featured: true,
      prizes: JSON.stringify([
        "Overall prize pool ₹5,00,000",
        "Amateurs — ₹4,999 entry",
        "Professionals — ₹7,999 entry",
        "Women Category — ₹4,999 entry",
        "Big Bikes — ₹7,999 entry",
      ]),
      rules: JSON.stringify([
        "Surfaces: enduro, rock garden, hill climb, slush, mud, technical",
        "Saturday: qualification, elimination, challenges",
        "Sunday: the Final",
        "In partnership with Dev Venkat (3× National Champion) and Tribal Adventure",
      ]),
    },
    update: {},
  });
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as { role?: string }).role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  await ensureUltimateRider();
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
