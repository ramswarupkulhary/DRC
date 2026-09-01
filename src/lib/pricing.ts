import { prisma } from "@/lib/prisma";

export type PurchaseType = "ride" | "training" | "membership" | "order";

/** A user is a member only with an active, non-expired membership. */
export async function isActiveMember(userId: string): Promise<boolean> {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { membership: true },
    });
    const m = user?.membership;
    return !!(m && m.status === "active" && m.endDate > new Date());
}

/**
 * Authoritative base price (in rupees) for an item, before coupons.
 * Applies early-bird pricing and member discount server-side so the
 * charged amount can never be tampered with by the client.
 */
export async function computeBaseAmount(
    type: PurchaseType,
    itemId: string,
    userId: string
): Promise<number | null> {
    if (type === "ride") {
        const ride = await prisma.ride.findUnique({ where: { id: itemId } });
        if (!ride) return null;
        const earlyBirdActive = !!(
            ride.earlyBirdPrice &&
            ride.earlyBirdDeadline &&
            ride.earlyBirdDeadline > new Date()
        );
        let amount = earlyBirdActive ? ride.earlyBirdPrice! : ride.price;
        if (ride.memberDiscount > 0 && (await isActiveMember(userId))) {
            amount = Math.round(amount * (1 - ride.memberDiscount / 100));
        }
        return amount;
    }

    if (type === "training") {
        const training = await prisma.training.findUnique({ where: { id: itemId } });
        if (!training) return null;
        return training.price;
    }

    if (type === "membership") {
        const plan = await prisma.membershipPlan.findUnique({ where: { id: itemId } });
        if (!plan) return null;
        return plan.price;
    }

    if (type === "order") {
        const order = await prisma.order.findUnique({ where: { id: itemId } });
        if (!order) return null;
        return order.total;
    }

    return null;
}

export interface Quote {
    baseAmount: number;
    finalAmount: number;
    discount: number;
    coupon: { id: string; code: string } | null;
    error?: string;
}

/** Validate and apply a coupon to a base amount. */
export async function applyCoupon(amount: number, couponCode?: string | null): Promise<Quote> {
    if (!couponCode) return { baseAmount: amount, finalAmount: amount, discount: 0, coupon: null };

    const coupon = await prisma.coupon.findUnique({ where: { code: couponCode } });
    if (!coupon || !coupon.active || (coupon.validUntil && coupon.validUntil < new Date())) {
        return { baseAmount: amount, finalAmount: amount, discount: 0, coupon: null, error: "Invalid or expired coupon" };
    }
    if (coupon.minAmount && amount < coupon.minAmount) {
        return { baseAmount: amount, finalAmount: amount, discount: 0, coupon: null, error: `Minimum amount ₹${coupon.minAmount} required` };
    }
    if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
        return { baseAmount: amount, finalAmount: amount, discount: 0, coupon: null, error: "Coupon usage limit reached" };
    }

    const finalAmount =
        coupon.type === "percentage"
            ? Math.round(amount * (1 - coupon.value / 100))
            : Math.max(0, amount - coupon.value);

    return { baseAmount: amount, finalAmount, discount: amount - finalAmount, coupon: { id: coupon.id, code: coupon.code } };
}

/** Full authoritative quote for a purchase: base price + coupon. */
export async function computeQuote(
    type: PurchaseType,
    itemId: string,
    userId: string,
    couponCode?: string | null
): Promise<Quote | null> {
    const base = await computeBaseAmount(type, itemId, userId);
    if (base == null) return null;
    return applyCoupon(base, couponCode);
}
