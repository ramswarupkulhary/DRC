import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getProgram, familyCompanionCount, type FamilyOption } from "@/lib/programs";

interface CompanionInput {
    firstName?: string;
    lastName?: string;
    phone?: string;
    type?: string;
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const userId = (session.user as { id: string }).id;

    const booking = await prisma.programBooking.findUnique({ where: { id } });
    if (!booking || booking.userId !== userId) {
        return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    const { companions } = (await req.json()) as { companions: CompanionInput[] };
    if (!Array.isArray(companions)) {
        return NextResponse.json({ error: "Invalid companions" }, { status: 400 });
    }

    const program = getProgram(booking.programSlug);
    const maxCompanions =
        booking.friends + familyCompanionCount(booking.familyOption as FamilyOption | null);
    if (!program || maxCompanions === 0) {
        return NextResponse.json({ error: "This booking has no companions to add." }, { status: 400 });
    }

    const cleaned = companions
        .filter((c) => c.firstName && c.firstName.trim())
        .slice(0, maxCompanions)
        .map((c) => ({
            bookingId: id,
            firstName: c.firstName!.trim(),
            lastName: c.lastName?.trim() || null,
            phone: c.phone?.trim() || null,
            type: c.type === "family" ? "family" : "friend",
        }));

    // Replace existing companion records for this booking.
    await prisma.programCompanion.deleteMany({ where: { bookingId: id } });
    if (cleaned.length > 0) {
        await prisma.programCompanion.createMany({ data: cleaned });
    }

    return NextResponse.json({ success: true, count: cleaned.length });
}
