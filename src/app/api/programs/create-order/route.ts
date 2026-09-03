import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getRazorpay } from "@/lib/razorpay";
import { computeProgramBreakdown } from "@/lib/programs";
import { applyCouponToBase } from "@/lib/pricing";
import { getProgramBySlug, getRentalBike } from "@/lib/programsDb";

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
        return NextResponse.json({ error: "Please log in to book a program." }, { status: 401 });
    }

    const rz = await getRazorpay();
    if (!rz) {
        return NextResponse.json(
            { error: "Online payment is not configured yet. Please contact us on WhatsApp to book." },
            { status: 500 }
        );
    }

    const { programSlug, persons, kids, lunch, couponCode, bikeId } = await req.json();

    const program = await getProgramBySlug(programSlug);
    if (!program) {
        return NextResponse.json({ error: "Invalid program." }, { status: 400 });
    }

    const supports = !!program.supportsCompanions;
    const normalizedPersons = supports ? Math.max(0, Math.floor(Number(persons) || 0)) : 0;
    const normalizedKids = supports ? Math.max(0, Math.floor(Number(kids) || 0)) : 0;

    // Bike rental price is resolved server-side and is NOT coupon-discountable.
    const bike = await getRentalBike(bikeId);

    // Price is always computed server-side — never trust the client.
    const breakdown = computeProgramBreakdown(program, {
        persons: normalizedPersons,
        kids: normalizedKids,
        lunch: !!lunch,
        bikePrice: bike.price,
    });

    // Coupon discounts only the rider's base fare, subtracted from the total.
    const quote = await applyCouponToBase(breakdown.riderBase, breakdown.total, couponCode);
    if (quote.error) {
        return NextResponse.json({ error: quote.error }, { status: 400 });
    }
    const amount = quote.finalAmount;

    if (amount < 1) {
        return NextResponse.json({ error: "Invalid amount." }, { status: 400 });
    }

    try {
        const order = await rz.instance.orders.create({
            amount: amount * 100,
            currency: "INR",
            receipt: `program_${program.slug}_${Date.now()}`.slice(0, 40),
            notes: {
                type: "program",
                programSlug: program.slug,
                userId: (session.user as { id: string }).id,
            },
        });

        return NextResponse.json({ orderId: order.id, amount, currency: "INR", key: rz.keyId });
    } catch {
        return NextResponse.json({ error: "Failed to create payment order." }, { status: 500 });
    }
}
