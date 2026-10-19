import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendEmail, drcEmailTemplate } from "@/lib/email";
import { escapePassText } from "@/lib/spectatorPass";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const session = await getServerSession(authOptions);
    const admin = session?.user as { id?: string; role?: string } | undefined;
    if (!admin?.id || !["admin", "coordinator"].includes(admin.role || "")) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    const { id } = await params;
    const body = await req.json();
    if (body.action !== "cancel" || typeof body.eventSlug !== "string" || body.refund === true) {
        return NextResponse.json({ error: "This action only cancels a registration without a refund." }, { status: 400 });
    }
    const registration = await prisma.eventRegistration.findFirst({ where: { id, eventSlug: body.eventSlug } });
    if (!registration) return NextResponse.json({ error: "Registration not found for this event." }, { status: 404 });
    if (registration.status === "cancelled") return NextResponse.json({ registration, refundIssued: false });
    const reason = typeof body.reason === "string" ? body.reason.trim().slice(0, 2000) : "";
    const updated = await prisma.eventRegistration.updateMany({
        where: { id, eventSlug: body.eventSlug, status: "active" },
        data: { status: "cancelled", cancelledAt: new Date(), cancelledById: admin.id, cancellationReason: reason || null, reservationExpiresAt: null },
    });
    const cancelled = await prisma.eventRegistration.findUniqueOrThrow({ where: { id } });
    let notificationSent = true;
    if (updated.count) {
        try {
            const event = await prisma.event.findUnique({ where: { slug: registration.eventSlug }, select: { title: true } });
            const title = event?.title || registration.eventSlug;
            if (registration.userId) await prisma.notification.create({
                data: {
                    userId: registration.userId,
                    title: "Event registration cancelled",
                    message: `Your registration for ${title} has been cancelled. No refund has been issued.`,
                    link: `/events/${registration.eventSlug}`,
                    type: "event",
                }
            });
            await sendEmail({
                to: registration.email,
                subject: `Registration cancelled - ${title}`,
                html: drcEmailTemplate({
                    title: "Registration cancelled",
                    body: `<p>Your registration for ${escapePassText(title)} (${escapePassText(registration.categoryName)}) has been cancelled by the event team.</p>${reason ? `<p>Reason: ${escapePassText(reason)}</p>` : ""}<p>No refund has been issued. Your payment record is unchanged.</p>`,
                    ctaText: "My Registrations",
                    ctaUrl: `${process.env.NEXT_PUBLIC_BASE_URL || "https://www.dirtridecamp.com"}/my-registrations`,
                }),
            });
        } catch (error) { notificationSent = false; console.error("[event cancellation notification]", error); }
    }
    return NextResponse.json({ registration: cancelled, refundIssued: false, notificationSent });
}