import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { computeQuote, type PurchaseType } from "@/lib/pricing";

/** Returns the authoritative price the current user will be charged. */
export async function GET(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");
    const itemId = searchParams.get("itemId");
    const couponCode = searchParams.get("couponCode");

    if (!type || !itemId) {
        return NextResponse.json({ error: "Missing type or itemId" }, { status: 400 });
    }

    const userId = (session.user as { id: string }).id;
    const quote = await computeQuote(type as PurchaseType, itemId, userId, couponCode);
    if (!quote) {
        return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    return NextResponse.json({
        baseAmount: quote.baseAmount,
        finalAmount: quote.finalAmount,
        discount: quote.discount,
        couponApplied: quote.coupon?.code || null,
        couponError: quote.error || null,
    });
}
