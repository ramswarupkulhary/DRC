import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { REWARDS } from "@/lib/rewards";

export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = (session.user as { id: string }).id;

    const user = await prisma.user.findUnique({ where: { id: userId }, select: { loyaltyPoints: true } });

    // Coupons this rider redeemed (code prefixed with their id fragment).
    const coupons = await prisma.coupon.findMany({
        where: { code: { startsWith: `DRC${userId.slice(0, 6).toUpperCase()}` } },
        orderBy: { createdAt: "desc" },
        select: { code: true, value: true, minAmount: true, validUntil: true, usedCount: true, maxUses: true },
    });

    return NextResponse.json({ points: user?.loyaltyPoints ?? 0, rewards: REWARDS, coupons });
}
