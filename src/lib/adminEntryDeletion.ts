import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type EntryKind = "event" | "registration" | "program";

export async function deleteAdminEntry(req: Request, id: string, kind: EntryKind) {
    const session = await getServerSession(authOptions);
    const admin = session?.user as { id?: string; role?: string } | undefined;
    const roles = kind === "program" ? ["admin"] : ["admin", "coordinator"];
    if (!admin?.id || !roles.includes(admin.role || "")) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    let body;
    try { body = await req.json(); } catch { return NextResponse.json({ error: "Confirm deletion before continuing." }, { status: 400 }); }
    if (body?.confirmDelete !== true) return NextResponse.json({ error: "Confirm deletion before continuing." }, { status: 400 });
    const deletion = { deletedAt: new Date(), deletedById: admin.id, status: "cancelled" };
    if (kind === "event") {
        if (typeof body.eventSlug !== "string" || !body.eventSlug) return NextResponse.json({ error: "Select the entry's event." }, { status: 400 });
        const registration = await prisma.eventRegistration.findFirst({ where: { id, eventSlug: body.eventSlug } });
        if (!registration) return NextResponse.json({ error: "Entry not found for this event." }, { status: 404 });
        if (registration.deletedAt) return NextResponse.json({ ok: true, refundIssued: false });
        if (["processing", "unknown", "pending"].includes(registration.refundStatus || "")) return NextResponse.json({ error: "Resolve the pending or uncertain refund before deleting this entry." }, { status: 409 });
        const updated = await prisma.eventRegistration.updateMany({
            where: { id, eventSlug: body.eventSlug, deletedAt: null, OR: [{ refundStatus: null }, { refundStatus: { in: ["failed", "processed"] } }] },
            data: { ...deletion, cancelledAt: registration.cancelledAt || deletion.deletedAt, cancelledById: registration.cancelledById || admin.id, cancellationReason: registration.cancellationReason || "Entry deleted by administrator", reservationExpiresAt: null },
        });
        if (!updated.count) return NextResponse.json({ error: "Entry changed. Refresh before deleting." }, { status: 409 });
    } else if (kind === "registration") {
        const registration = await prisma.registration.findUnique({ where: { id }, select: { id: true, deletedAt: true } });
        if (!registration) return NextResponse.json({ error: "Registration not found." }, { status: 404 });
        if (registration.deletedAt) return NextResponse.json({ ok: true, refundIssued: false });
        await prisma.registration.updateMany({ where: { id, deletedAt: null }, data: deletion });
    } else {
        const booking = await prisma.programBooking.findUnique({ where: { id }, select: { id: true, deletedAt: true } });
        if (!booking) return NextResponse.json({ error: "Program booking not found." }, { status: 404 });
        if (booking.deletedAt) return NextResponse.json({ ok: true, refundIssued: false });
        await prisma.programBooking.updateMany({ where: { id, deletedAt: null }, data: deletion });
    }
    return NextResponse.json({ ok: true, refundIssued: false });
}