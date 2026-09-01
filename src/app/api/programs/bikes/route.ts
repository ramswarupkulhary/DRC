import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/** Active rental bikes for the booking bike selector. */
export async function GET() {
    const bikes = await prisma.rentalBike.findMany({
        where: { active: true },
        orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
        select: { id: true, name: true, price: true },
    });
    return NextResponse.json({ bikes });
}
