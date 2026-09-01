import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as { id: string }).id;
    const bookings = await prisma.programBooking.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        include: { companions: true },
    });

    return NextResponse.json({ bookings });
}
