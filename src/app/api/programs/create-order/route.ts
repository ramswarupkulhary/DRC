import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getRazorpay } from "@/lib/razorpay";
import { computeProgramPrice, FAMILY_PACKAGES, type FamilyOption } from "@/lib/programs";
import { getProgramBySlug } from "@/lib/programsDb";

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

    const { programSlug, friends, familyOption, lunch } = await req.json();

    const program = await getProgramBySlug(programSlug);
    if (!program) {
        return NextResponse.json({ error: "Invalid program." }, { status: 400 });
    }

    const normalizedFamily: FamilyOption | null =
        familyOption && FAMILY_PACKAGES[familyOption as FamilyOption] ? (familyOption as FamilyOption) : null;
    const normalizedFriends = program.supportsCompanions ? Math.max(0, Math.floor(Number(friends) || 0)) : 0;

    // Price is always computed server-side — never trust the client.
    const amount = computeProgramPrice(program, {
        friends: normalizedFriends,
        familyOption: normalizedFamily,
        lunch: !!lunch,
    });

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
