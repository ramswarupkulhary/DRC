import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendEmail, drcEmailTemplate } from "@/lib/email";
import { escapePassText } from "@/lib/spectatorPass";
import { getRazorpay } from "@/lib/razorpay";
import { EventRefundError, requestEventRefund } from "@/lib/eventRefunds";
import { deleteAdminEntry } from "@/lib/adminEntryDeletion";

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    return deleteAdminEntry(req, (await params).id, "event");
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const session = await getServerSession(authOptions);
    const admin = session?.user as { id?: string; role?: string } | undefined;
    if (!admin?.id || !["admin", "coordinator"].includes(admin.role || "")) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    const { id } = await params;
    const body = await req.json();
    if (!["cancel", "refresh_refund"].includes(body.action) || typeof body.eventSlug !== "string" || (body.refund !== undefined && typeof body.refund !== "boolean")) {
        return NextResponse.json({ error: "Invalid cancellation request." }, { status: 400 });
    }
    if (body.refund === true && body.confirmRefund !== true) return NextResponse.json({ error: "Explicitly confirm the payment refund before continuing." }, { status: 400 });
    const registration = await prisma.eventRegistration.findFirst({ where: { id, eventSlug: body.eventSlug, deletedAt: null } });
    if (!registration) return NextResponse.json({ error: "Registration not found for this event." }, { status: 404 });
    const reason = typeof body.reason === "string" ? body.reason.trim().slice(0, 2000) : "";
    const cancellationData = { status: "cancelled", cancelledAt: registration.cancelledAt || new Date(), cancelledById: registration.cancelledById || admin.id, cancellationReason: reason || registration.cancellationReason || null, reservationExpiresAt: null };
    if (body.action === "refresh_refund") {
        if (!registration.refundId || !registration.razorpayPaymentId) return NextResponse.json({ error: "There is no recorded refund to refresh. Check Razorpay manually if its outcome is unknown." }, { status: 400 });
        const gateway = await getRazorpay();
        if (!gateway) return NextResponse.json({ error: "Razorpay is not configured." }, { status: 503 });
        try {
            const refund = await gateway.instance.refunds.fetch(registration.refundId);
            if (refund.payment_id !== registration.razorpayPaymentId || Number(refund.amount) !== registration.amount * 100 || refund.currency !== registration.currency || !["pending", "processed", "failed"].includes(refund.status)) {
                return NextResponse.json({ error: "Refund details do not match this registration." }, { status: 409 });
            }
            await prisma.eventRegistration.updateMany({
                where: { id, deletedAt: null, refundId: registration.refundId, refundStatus: { not: "processed" } },
                data: { ...cancellationData, refundStatus: refund.status, paymentStatus: refund.status === "processed" ? "refunded" : refund.status === "failed" ? "paid" : "refund_pending" },
            });
            return NextResponse.json({ registration: await prisma.eventRegistration.findUniqueOrThrow({ where: { id } }), refundIssued: refund.status === "processed", refundInitiated: refund.status === "pending" });
        } catch (error) {
            console.error("[event refund refresh]", error);
            return NextResponse.json({ error: "Could not refresh the refund. No new refund was requested." }, { status: 502 });
        }
    }
    let changed = false;
    if (body.refund === true) {
        if (registration.refundId && ["pending", "processed"].includes(registration.refundStatus || "")) return NextResponse.json({ registration, refundIssued: registration.refundStatus === "processed", refundInitiated: true, alreadyRequested: true });
        if (registration.refundId || ["processing", "unknown"].includes(registration.refundStatus || "")) return NextResponse.json({ error: "A refund is already recorded or its outcome needs reconciliation. Check Razorpay before retrying.", registration }, { status: 409 });
        if (registration.paymentStatus !== "paid" || !registration.razorpayPaymentId || registration.amount <= 0) return NextResponse.json({ error: "Only paid Razorpay registrations with a positive amount can be refunded." }, { status: 400 });
        const gateway = await getRazorpay();
        if (!gateway) return NextResponse.json({ error: "Razorpay is not configured." }, { status: 503 });
        const claim = await prisma.eventRegistration.updateMany({
            where: { id, eventSlug: body.eventSlug, deletedAt: null, paymentStatus: "paid", refundId: null, OR: [{ refundStatus: null }, { refundStatus: "failed" }] },
            data: { refundStatus: "processing", refundRequestedAt: new Date(), refundRequestedById: admin.id, refundAmount: registration.amount },
        });
        if (!claim.count) return NextResponse.json({ error: "Another refund request is already in progress. Refresh this registration." }, { status: 409 });
        let refund;
        try {
            refund = await requestEventRefund(registration, gateway.instance, admin.id, reason);
        } catch (error) {
            const uncertain = error instanceof EventRefundError && error.uncertain;
            await prisma.eventRegistration.updateMany({ where: { id, refundStatus: "processing" }, data: { refundStatus: uncertain ? "unknown" : "failed", ...(uncertain ? cancellationData : {}) } });
            return NextResponse.json({ error: error instanceof EventRefundError ? error.message : "Could not verify the payment. No refund was requested.", registration: await prisma.eventRegistration.findUniqueOrThrow({ where: { id } }), refundUncertain: uncertain }, { status: 502 });
        }
        try {
            const saved = await prisma.eventRegistration.updateMany({
                where: { id, refundStatus: "processing" },
                data: { ...cancellationData, refundId: refund.id, refundStatus: refund.status, paymentStatus: refund.status === "processed" ? "refunded" : "refund_pending" },
            });
            changed = saved.count > 0;
        } catch (error) {
            console.error("[event refund accepted but not persisted]", { registrationId: id, refundId: refund.id, error });
            return NextResponse.json({ error: "Razorpay accepted the refund, but its local record could not be saved. Do not retry; check Razorpay and contact support.", refundInitiated: true, refundId: refund.id }, { status: 503 });
        }
    } else {
        if (registration.status === "cancelled") return NextResponse.json({ registration, refundIssued: registration.refundStatus === "processed", refundInitiated: registration.refundStatus === "pending" });
        if (["processing", "unknown"].includes(registration.refundStatus || "")) return NextResponse.json({ error: "The refund outcome must be checked before changing this registration.", registration }, { status: 409 });
        const updated = await prisma.eventRegistration.updateMany({
            where: { id, eventSlug: body.eventSlug, deletedAt: null, status: "active", OR: [{ refundStatus: null }, { refundStatus: "failed" }] },
            data: cancellationData,
        });
        changed = updated.count > 0;
        if (!changed) return NextResponse.json({ error: "Registration status changed. Refresh before continuing." }, { status: 409 });
    }
    const cancelled = await prisma.eventRegistration.findUniqueOrThrow({ where: { id } });
    const refundMessage = cancelled.refundStatus === "processed"
        ? `A refund of ${cancelled.currency} ${cancelled.amount} has been processed. Refund reference: ${cancelled.refundId}.`
        : cancelled.refundStatus === "pending"
            ? `A refund of ${cancelled.currency} ${cancelled.amount} has been initiated and is pending with the payment provider. Refund reference: ${cancelled.refundId}. Bank processing times may vary.`
            : "No refund has been issued. Your payment record is unchanged.";
    let notificationSent = true;
    if (changed) {
        try {
            const event = await prisma.event.findUnique({ where: { slug: registration.eventSlug }, select: { title: true } });
            const title = event?.title || registration.eventSlug;
            if (registration.userId) await prisma.notification.create({
                data: {
                    userId: registration.userId,
                    title: "Event registration cancelled",
                    message: `Your registration for ${title} has been cancelled. ${refundMessage}`,
                    link: `/events/${registration.eventSlug}`,
                    type: "event",
                }
            });
            await sendEmail({
                to: registration.email,
                subject: `Registration cancelled - ${title}`,
                html: drcEmailTemplate({
                    title: "Registration cancelled",
                    body: `<p>Your registration for ${escapePassText(title)} (${escapePassText(registration.categoryName)}) has been cancelled by the event team.</p>${reason ? `<p>Reason: ${escapePassText(reason)}</p>` : ""}<p>${escapePassText(refundMessage)}</p>`,
                    ctaText: "My Registrations",
                    ctaUrl: `${process.env.NEXT_PUBLIC_BASE_URL || "https://www.dirtridecamp.com"}/my-registrations`,
                }),
            });
        } catch (error) { notificationSent = false; console.error("[event cancellation notification]", error); }
    }
    return NextResponse.json({ registration: cancelled, refundIssued: cancelled.refundStatus === "processed", refundInitiated: cancelled.refundStatus === "pending" || cancelled.refundStatus === "processed", notificationSent });
}