import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getReward } from "@/lib/rewards";
import { notifyRider } from "@/lib/notify";

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = (session.user as { id: string }).id;

    const { rewardId } = await req.json();
    const reward = getReward(rewardId);
    if (!reward) {
        return NextResponse.json({ error: "Invalid reward" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { id: userId }, select: { loyaltyPoints: true } });
    if (!user || user.loyaltyPoints < reward.points) {
        return NextResponse.json({ error: "Not enough points" }, { status: 400 });
    }

    const code = `DRC${userId.slice(0, 6).toUpperCase()}${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
    const validUntil = new Date();
    validUntil.setDate(validUntil.getDate() + 90);

    // Deduct points and mint a single-use personal coupon atomically.
    await prisma.$transaction([
        prisma.user.update({ where: { id: userId }, data: { loyaltyPoints: { decrement: reward.points } } }),
        prisma.coupon.create({
            data: {
                code,
                type: "fixed",
                value: reward.value,
                minAmount: reward.minAmount,
                maxUses: 1,
                validUntil,
                active: true,
            },
        }),
    ]);

    await notifyRider({
        userId,
        type: "reward",
        title: "Reward Redeemed!",
        message: `You redeemed ${reward.label}. Use code ${code} at checkout (valid 90 days).`,
        link: "/rewards",
        email: true,
    });

    return NextResponse.json({ success: true, code, value: reward.value });
}
