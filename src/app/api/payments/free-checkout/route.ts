import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { computeQuote, type PurchaseType } from "@/lib/pricing";
import { notifyRider } from "@/lib/notify";

/**
 * Completes a booking with no payment when a coupon brings the total to ₹0.
 * Price is recomputed server-side; it only proceeds if the final amount is exactly 0.
 */
export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as { id: string }).id;
    const { type, itemId, couponCode, metadata } = await req.json();

    if (!type || !itemId) {
        return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const quote = await computeQuote(type as PurchaseType, itemId, userId, couponCode);
    if (!quote) return NextResponse.json({ error: "Item not found" }, { status: 404 });
    if (quote.error) return NextResponse.json({ error: quote.error }, { status: 400 });

    // Guard: only free bookings go through this route.
    if (quote.finalAmount !== 0) {
        return NextResponse.json({ error: "Payment is required for this booking." }, { status: 400 });
    }

    const paymentRef = `coupon:${quote.coupon?.code || "FREE"}`;

    try {
        if (type === "ride" || type === "training") {
            const existing = await prisma.registration.findFirst({
                where: { userId, ...(type === "ride" ? { rideId: itemId } : { trainingId: itemId }), status: { notIn: ["cancelled", "rejected"] } },
            });
            if (existing) return NextResponse.json({ error: "You are already registered." }, { status: 409 });

            await prisma.registration.create({
                data: {
                    userId,
                    ...(type === "ride" ? { rideId: itemId } : { trainingId: itemId }),
                    status: "confirmed",
                    paymentStatus: "paid",
                    paymentId: paymentRef,
                    amount: 0,
                    discount: quote.discount,
                    couponId: quote.coupon?.id ?? null,
                },
            });
        } else if (type === "membership") {
            const plan = await prisma.membershipPlan.findUnique({ where: { id: itemId } });
            if (!plan) return NextResponse.json({ error: "Plan not found" }, { status: 404 });
            const endDate = new Date();
            endDate.setDate(endDate.getDate() + plan.duration);
            await prisma.membership.create({
                data: {
                    planId: itemId,
                    startDate: new Date(),
                    endDate,
                    status: "active",
                    tshirtSize: metadata?.tshirtSize || null,
                    paymentProof: paymentRef,
                    users: { connect: { id: userId } },
                },
            });
        } else {
            return NextResponse.json({ error: "Unsupported type" }, { status: 400 });
        }

        if (quote.coupon) {
            await prisma.coupon.update({ where: { id: quote.coupon.id }, data: { usedCount: { increment: 1 } } }).catch(() => { });
        }

        await notifyRider({
            userId,
            type: "booking",
            title: "Booking Confirmed",
            message: "Your booking is confirmed with a 100% discount coupon. See you soon!",
            link: type === "membership" ? "/membership" : "/my-registrations",
            email: true,
            push: true,
        });

        return NextResponse.json({ success: true, free: true });
    } catch {
        return NextResponse.json({ error: "Failed to complete booking" }, { status: 500 });
    }
}
