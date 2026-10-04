import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    let event = await prisma.event.findUnique({ where: { slug } });
    if (!event) return NextResponse.json({ error: "Event not found." }, { status: 404 });

    if (slug === "drc-ultimate-rider" && !event.stayConfigured) {
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
            },
        });
        event = await prisma.event.findUniqueOrThrow({ where: { id: event.id } });
    }

    const categories = await prisma.eventCategory.findMany({
        where: { eventId: event.id, active: true },
        orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
        select: { id: true, slug: true, name: true, description: true, fee: true, totalSlots: true },
    });
    const reservedTents = event.stayEnabled
        ? await prisma.eventRegistration.count({
            where: {
                eventSlug: event.slug,
                stayBooked: true,
                OR: [
                    { paymentStatus: "paid" },
                    { paymentStatus: "pending", reservationExpiresAt: { gt: new Date() } },
                ],
            },
        })
        : 0;
    return NextResponse.json(
        {
            event: { id: event.id, slug: event.slug, title: event.title },
            categories,
            stay: event.stayEnabled ? {
                enabled: true,
                price: event.stayPrice,
                totalTents: event.stayTotalTents,
                availableTents: Math.max(0, event.stayTotalTents - reservedTents),
            } : { enabled: false, price: event.stayPrice, totalTents: event.stayTotalTents, availableTents: 0 },
            spectator: {
                saturdayFee: event.spectatorSaturdayFee,
                sundayFee: event.spectatorSundayFee,
                weekendFee: event.spectatorWeekendFee,
                fullMeal: {
                    name: event.spectatorFullMealName,
                    details: event.spectatorFullMealDetails,
                    fee: event.spectatorFullMealFee,
                },
                dayMeal: {
                    name: event.spectatorDayMealName,
                    details: event.spectatorDayMealDetails,
                    fee: event.spectatorDayMealFee,
                },
            },
        },
        { headers: { "Cache-Control": "no-store, must-revalidate" } },
    );
}
