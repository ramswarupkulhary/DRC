import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Idempotently ensure the flagship Ultimate Rider event + its 4 categories exist.
async function ensureUltimateRider() {
  const event = await prisma.event.upsert({
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
      registrationUrl: "/events/drc-ultimate-rider/register",
      price: 4999,
      totalSlots: 200,
      status: "upcoming",
      featured: true,
      stayEnabled: true,
      stayPrice: 1599,
      stayTotalTents: 50,
      stayConfigured: true,
      spectatorSaturdayFee: 499,
      spectatorSundayFee: 499,
      spectatorWeekendFee: 999,
      spectatorFullMealName: "Two-day meal package",
      spectatorFullMealDetails: "2 breakfasts, 2 lunches and 1 dinner",
      spectatorFullMealFee: 1999,
      spectatorDayMealName: "Day meal package",
      spectatorDayMealDetails: "1 breakfast and 1 lunch",
      spectatorDayMealFee: 599,
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

  await prisma.event.updateMany({
    where: { id: event.id, stayConfigured: false },
    data: {
      stayEnabled: true,
      stayPrice: 1599,
      stayTotalTents: 50,
      stayConfigured: true,
      spectatorSaturdayFee: 499,
      spectatorSundayFee: 499,
      spectatorWeekendFee: 999,
      spectatorFullMealName: "Two-day meal package",
      spectatorFullMealDetails: "2 breakfasts, 2 lunches and 1 dinner",
      spectatorFullMealFee: 1999,
      spectatorDayMealName: "Day meal package",
      spectatorDayMealDetails: "1 breakfast and 1 lunch",
      spectatorDayMealFee: 599,
    },
  });

  const defaultCategories = [
    { slug: "amateurs-upto-260cc", name: "Amateurs — Up to 260cc", description: "Amateur class · up to 260cc engine capacity.", fee: 4999, sortOrder: 1 },
    { slug: "amateurs-upto-460cc", name: "Amateurs — Up to 460cc", description: "Amateur class · up to 460cc engine capacity.", fee: 4999, sortOrder: 2 },
    { slug: "pro-upto-260cc", name: "Professionals — Up to 260cc", description: "Championship / podium-level · up to 260cc.", fee: 7999, sortOrder: 3 },
    { slug: "pro-upto-460cc", name: "Professionals — Up to 460cc", description: "Championship / podium-level · up to 460cc.", fee: 7999, sortOrder: 4 },
    { slug: "women", name: "Women Category", description: "Open to all women riders — any engine capacity.", fee: 4999, sortOrder: 5 },
    { slug: "big-bikes", name: "Big Bikes", description: "Above 460cc engine capacity.", fee: 7999, sortOrder: 6 },
    { slug: "foreign-bikes", name: "Foreign Bikes", description: "Imported motorcycles · up to 500cc.", fee: 7999, sortOrder: 7 },
  ];

  const defaultSlugs = defaultCategories.map((c) => c.slug);

  for (const cat of defaultCategories) {
    await prisma.eventCategory.upsert({
      where: { eventId_slug: { eventId: event.id, slug: cat.slug } },
      create: { ...cat, eventId: event.id, active: true },
      update: {},
    });
  }

  // Deactivate any legacy categories that aren't in the new structure (e.g. the old
  // "amateurs" and "professionals" slugs). Keeps rows for history so prior
  // registrations stay traceable; admin can delete them from the manager if desired.
  await prisma.eventCategory.updateMany({
    where: { eventId: event.id, slug: { notIn: defaultSlugs }, active: true },
    data: { active: false },
  });
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as { role?: string }).role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  await ensureUltimateRider();
  const events = await prisma.event.findMany({ orderBy: { date: "desc" } });
  const eventsWithStayAvailability = await Promise.all(events.map(async (event) => {
    const reservedTents = await prisma.eventRegistration.count({
      where: {
        eventSlug: event.slug,
        stayBooked: true,
        OR: [
          { paymentStatus: "paid" },
          { paymentStatus: "pending", reservationExpiresAt: { gt: new Date() } },
        ],
      },
    });
    return { ...event, stayBookedTents: reservedTents, stayAvailableTents: Math.max(0, event.stayTotalTents - reservedTents) };
  }));
  return NextResponse.json(eventsWithStayAvailability);
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
      endDate: body.endDate ? new Date(body.endDate) : null,
      location: body.location,
      coverImage: body.coverImage || null,
      registrationUrl: body.registrationUrl || "/contact",
      price: body.price || 0,
      totalSlots: body.totalSlots || 0,
      status: body.status || "upcoming",
      featured: body.featured || false,
      prizes: body.prizes || null,
      rules: body.rules || null,
      stayEnabled: body.stayEnabled === true,
      stayPrice: Number.isInteger(body.stayPrice) && body.stayPrice >= 0 ? body.stayPrice : 1599,
      stayTotalTents: Number.isInteger(body.stayTotalTents) && body.stayTotalTents >= 0 ? body.stayTotalTents : 50,
      stayConfigured: true,
      spectatorSaturdayFee: Number.isInteger(body.spectatorSaturdayFee) && body.spectatorSaturdayFee >= 0 ? body.spectatorSaturdayFee : 499,
      spectatorSundayFee: Number.isInteger(body.spectatorSundayFee) && body.spectatorSundayFee >= 0 ? body.spectatorSundayFee : 499,
      spectatorWeekendFee: Number.isInteger(body.spectatorWeekendFee) && body.spectatorWeekendFee >= 0 ? body.spectatorWeekendFee : 999,
      spectatorFullMealName: body.spectatorFullMealName || "Two-day meal package",
      spectatorFullMealDetails: body.spectatorFullMealDetails || "2 breakfasts, 2 lunches and 1 dinner",
      spectatorFullMealFee: Number.isInteger(body.spectatorFullMealFee) && body.spectatorFullMealFee >= 0 ? body.spectatorFullMealFee : 1999,
      spectatorDayMealName: body.spectatorDayMealName || "Day meal package",
      spectatorDayMealDetails: body.spectatorDayMealDetails || "1 breakfast and 1 lunch",
      spectatorDayMealFee: Number.isInteger(body.spectatorDayMealFee) && body.spectatorDayMealFee >= 0 ? body.spectatorDayMealFee : 599,
    },
  });
  return NextResponse.json(event, { status: 201 });
}
