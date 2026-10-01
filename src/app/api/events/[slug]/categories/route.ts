import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const event = await prisma.event.findUnique({ where: { slug } });
    if (!event) return NextResponse.json({ error: "Event not found." }, { status: 404 });

    const categories = await prisma.eventCategory.findMany({
        where: { eventId: event.id, active: true },
        orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
        select: { id: true, slug: true, name: true, description: true, fee: true, totalSlots: true },
    });
    return NextResponse.json(
        { event: { id: event.id, slug: event.slug, title: event.title }, categories },
        { headers: { "Cache-Control": "no-store, must-revalidate" } },
    );
}
