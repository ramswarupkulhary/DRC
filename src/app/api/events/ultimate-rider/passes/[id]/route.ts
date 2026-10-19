import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isValidSpectatorPassSignature, renderSpectatorPass } from "@/lib/spectatorPass";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const signature = new URL(req.url).searchParams.get("signature") || "";
        if (!isValidSpectatorPassSignature(id, signature)) {
            return NextResponse.json({ error: "Pass not found." }, { status: 404 });
        }
        const registration = await prisma.eventRegistration.findUnique({
            where: { id },
            select: { id: true, name: true, eventSlug: true, registrationType: true, paymentStatus: true, status: true },
        });
        if (!registration || registration.status !== "active" || registration.eventSlug !== "drc-ultimate-rider" || registration.registrationType !== "spectator" || registration.paymentStatus !== "paid") {
            return NextResponse.json({ error: "Pass not found." }, { status: 404 });
        }
        const image = await renderSpectatorPass(registration);
        return new NextResponse(new Uint8Array(image), {
            headers: {
                "Content-Type": "image/png",
                "Content-Disposition": 'attachment; filename="drc-ultimate-rider-spectator-pass.png"',
                "Cache-Control": "private, no-store",
                "X-Robots-Tag": "noindex, nofollow",
                "Referrer-Policy": "no-referrer",
            },
        });
    } catch (error) {
        console.error("[ultimate-rider spectator pass download]", error);
        return NextResponse.json({ error: "Could not download the pass. Please try again." }, { status: 500 });
    }
}