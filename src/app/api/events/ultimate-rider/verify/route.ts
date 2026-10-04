import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendEmail, drcEmailTemplate } from "@/lib/email";
import crypto from "crypto";

const ADMIN_INBOX = "info@dirtridecamp.com";

async function getRazorpaySecret() {
    const setting = await prisma.siteSetting.findUnique({ where: { key: "razorpay_key_secret" } });
    return setting?.value || process.env.RAZORPAY_KEY_SECRET || "";
}

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: "Please sign in to complete registration." }, { status: 401 });
        }

        const body = await req.json();
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            category,
            name,
            email,
            phone,
            city,
            bikeMake,
            bikeModel,
            experience,
            notes,
            stayBooked,
            registrationType = "rider",
            attendanceDays,
            foodPackage,
        } = body ?? {};

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return NextResponse.json({ error: "Missing payment identifiers." }, { status: 400 });
        }
        const secret = await getRazorpaySecret();
        if (!secret) {
            return NextResponse.json({ error: "Payment gateway not configured." }, { status: 500 });
        }

        const expected = crypto
            .createHmac("sha256", secret)
            .update(`${razorpay_order_id}|${razorpay_payment_id}`)
            .digest("hex");

        if (expected !== razorpay_signature) {
            return NextResponse.json({ error: "Invalid payment signature." }, { status: 400 });
        }

        const userId = (session.user as { id: string }).id;
        const registration = await prisma.eventRegistration.findFirst({
            where: { razorpayOrderId: razorpay_order_id, userId, eventSlug: "drc-ultimate-rider" },
        });
        if (!registration) return NextResponse.json({ error: "Payment order reservation not found." }, { status: 404 });
        if (registration.paymentStatus === "paid") return NextResponse.json({ ok: true });
        if (
            registration.registrationType !== registrationType ||
            (registrationType === "rider" && registration.category !== String(category)) ||
            (registrationType === "spectator" && registration.attendanceDays !== String(attendanceDays)) ||
            registration.stayBooked !== (stayBooked === true)
        ) {
            return NextResponse.json({ error: "Order details do not match this registration." }, { status: 400 });
        }
        const paidRegistration = await prisma.eventRegistration.update({
            where: { id: registration.id },
            data: {
                paymentStatus: "paid",
                razorpayPaymentId: razorpay_payment_id,
                razorpaySignature: razorpay_signature,
                reservationExpiresAt: null,
            },
        });
        const totalAmount = registration.amount;
        const stayAmount = registration.stayAmount;
        const foodAmount = registration.foodAmount;
        const entryAmount = totalAmount - stayAmount - foodAmount;

        const rows = [
            ["Registration", registration.registrationType === "spectator" ? "Spectator" : "Race rider"],
            ["Pass / category", registration.categoryName],
            ...(registration.attendanceDays ? [["Attendance", registration.attendanceDays]] : []),
            ["Entry", `₹${entryAmount.toLocaleString("en-IN")}`],
            ...(registration.membershipDiscount ? [["Member discount", `−₹${registration.membershipDiscount.toLocaleString("en-IN")}`]] : []),
            ...(registration.foodPackage ? [["Food package", registration.foodPackage]] : []),
            ...(foodAmount ? [["Food amount", `₹${foodAmount.toLocaleString("en-IN")}`]] : []),
            ...(stayAmount ? [["Tent stay", `₹${stayAmount.toLocaleString("en-IN")}`]] : []),
            ["Paid", `₹${totalAmount.toLocaleString("en-IN")}`],
            ["Payment ID", razorpay_payment_id],
            ["Order ID", razorpay_order_id],
            ["Name", name || "—"],
            ["Email", email || "—"],
            ["Phone", phone || "—"],
            ["City", city || "—"],
            ["Bike", `${bikeMake || "—"} ${bikeModel || ""}`.trim()],
            ["Experience", experience || "—"],
        ];
        const rowsHtml = rows
            .map(
                ([k, v]) =>
                    `<tr><td style="padding:6px 12px 6px 0;color:#B9A886;font-size:12px;text-transform:uppercase;letter-spacing:1px;">${k}</td><td style="padding:6px 0;color:#F1E9DD;font-size:14px;">${escapeHtml(v)}</td></tr>`,
            )
            .join("");

        await sendEmail({
            to: ADMIN_INBOX,
            subject: `[DRC Ultimate Rider] PAID registration — ${registration.categoryName} — ${name}`,
            html: drcEmailTemplate({
                title: "Ultimate Rider — paid registration",
                body: `<table style="width:100%;border-collapse:collapse;">${rowsHtml}</table>${notes
                    ? `<p style="margin-top:16px;color:#B9A886;font-size:12px;text-transform:uppercase;letter-spacing:1px;">Notes</p><p style="color:#F1E9DD;font-size:14px;line-height:1.6;">${escapeHtml(notes)}</p>`
                    : ""
                    }`,
            }),
        });

        if (email) {
            await sendEmail({
                to: email,
                subject: `DRC Ultimate Rider — slot confirmed (${registration.categoryName})`,
                html: drcEmailTemplate({
                    title: `You're in, ${escapeHtml(String(name).split(" ")[0])}`,
                    body: `
                    <p style="color:#F1E9DD;font-size:14px;line-height:1.7;">Your <strong>${registration.registrationType === "spectator" ? "spectator booking" : "race entry"}</strong> for <strong>DRC Ultimate Rider</strong> is confirmed: <strong>${escapeHtml(registration.categoryName)}</strong>${registration.attendanceDays ? `, ${escapeHtml(registration.attendanceDays)}` : ""}${registration.foodPackage ? `, food package: ${escapeHtml(registration.foodPackage)}` : ""}${stayAmount ? ", including a tent stay" : ""}. Payment of <strong>₹${totalAmount.toLocaleString("en-IN")}</strong> has been received.</p>
            <p style="color:#B9A886;font-size:12px;text-transform:uppercase;letter-spacing:1px;margin-top:24px;">Your entry &amp; receipt</p>
            <table style="width:100%;border-collapse:collapse;margin-top:8px;">${rowsHtml}</table>
            <p style="color:#F1E9DD;font-size:14px;line-height:1.7;margin-top:24px;"><strong>Event:</strong> 12&ndash;13 December 2026 &middot; Bengaluru<br/><strong>Overall prize pool:</strong> ₹5,00,000</p>
            <p style="color:#F1E9DD;font-size:14px;line-height:1.7;margin-top:16px;">We'll be in touch with race-week details, gear checklist and venue instructions. Questions? Reply to this email or WhatsApp us at <a href="https://wa.me/919414870102" style="color:#E8622C;">+91 94148 70102</a>.</p>
          `,
                    ctaText: "Race brief",
                    ctaUrl: "https://www.dirtridecamp.com/events/drc-ultimate-rider",
                }),
            });
        }

        return NextResponse.json({ ok: true, registrationId: paidRegistration.id });
    } catch (err) {
        console.error("[ultimate-rider verify]", err);
        return NextResponse.json({ error: "Verification failed." }, { status: 500 });
    }
}

function escapeHtml(s: string) {
    return String(s).replace(/[&<>"']/g, (c) =>
        c === "&" ? "&amp;" : c === "<" ? "&lt;" : c === ">" ? "&gt;" : c === '"' ? "&quot;" : "&#39;",
    );
}
