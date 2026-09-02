import { prisma } from "@/lib/prisma";

/** The active membership plan's price (falls back to 999 only if none exists yet). */
export async function getActiveMembershipPrice(): Promise<number> {
    const plan = await prisma.membershipPlan.findFirst({
        where: { active: true },
        orderBy: { price: "asc" },
        select: { price: true },
    });
    return plan?.price ?? 999;
}
