import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendEmail, drcEmailTemplate } from "@/lib/email";

const CATEGORIES: Record<string, { name: string; fee: number }> = {
    amateurs: { name: "Amateurs", fee: 4999 },
    professionals: { name: "Professionals", fee: 7999 },
    women: { name: "Women Category", fee: 4999 },
    "big-bikes": { name: "Big Bikes", fee: 7999 },
};

const ADMIN_INBOX = "info@dirtridecamp.com";

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: "Please sign in to register." }, { status: 401 });
        }

        const body = await req.json();
        const { name, email, phone, city, bikeMake, bikeModel, experience, notes, category, agree } = body ?? {};

        if (!name || !email || !phone || !city || !bikeMake || !bikeModel || !experience || !category) {
            return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
        }
        if (!agree) {
            return NextResponse.json({ error: "Entry terms must be accepted." }, { status: 400 });
        }
        const cat = CATEGORIES[category];
        if (!cat) {
            return NextResponse.json({ error: "Invalid category." }, { status: 400 });
        }

        // Persist a pending record so admin can see it before payment.
        const userId = (session.user as { id: string }).id;
        await prisma.eventRegistration.create({
            data: {
                userId,
                eventSlug: "drc-ultimate-rider",
                category,
                categoryName: cat.name,
                amount: cat.fee,
                currency: "INR",
                paymentStatus: "pending",
                name: String(name),
                email: String(email),
                phone: String(phone),
                city: String(city),
                bikeMake: String(bikeMake),
                bikeModel: String(bikeModel),
                experience: String(experience),
                notes: notes ? String(notes) : null,
            },
        });

        const summaryRows = [
            ["Category", cat.name],
            ["Entry fee", `₹${cat.fee.toLocaleString("en-IN")}`],
            ["Name", name],
            ["Email", email],
            ["Phone", phone],
            ["City", city],
            ["Bike", `${bikeMake} ${bikeModel}`],
            ["Experience", experience],
        ];

        const rowsHtml = summaryRows
            .map(
                ([k, v]) =>
                    `<tr><td style="padding:6px 12px 6px 0;color:#B9A886;font-size:12px;text-transform:uppercase;letter-spacing:1px;">${k}</td><td style="padding:6px 0;color:#F1E9DD;font-size:14px;">${v}</td></tr>`,
            )
            .join("");

        // Admin notification
        await sendEmail({
            to: ADMIN_INBOX,
            subject: `[DRC Ultimate Rider] New registration — ${cat.name} — ${name}`,
            html: drcEmailTemplate({
                title: "New Ultimate Rider registration",
                body: `<table style="width:100%;border-collapse:collapse;">${rowsHtml}</table>${notes
                        ? `<p style="margin-top:16px;color:#B9A886;font-size:12px;text-transform:uppercase;letter-spacing:1px;">Notes</p><p style="color:#F1E9DD;font-size:14px;line-height:1.6;">${escapeHtml(notes)}</p>`
                        : ""
                    }`,
            }),
        });

        // Confirmation to rider
        await sendEmail({
            to: email,
            subject: `DRC Ultimate Rider — registration received (${cat.name})`,
            html: drcEmailTemplate({
                title: `Thank you, ${escapeHtml(String(name).split(" ")[0])}`,
                body: `
          <p style="color:#F1E9DD;font-size:14px;line-height:1.7;">We&rsquo;ve received your registration for <strong>DRC Ultimate Rider</strong> in the <strong>${cat.name}</strong> category. Our team will confirm your slot and share payment instructions shortly on this email and on WhatsApp.</p>
          <p style="color:#B9A886;font-size:12px;text-transform:uppercase;letter-spacing:1px;margin-top:24px;">Your entry summary</p>
          <table style="width:100%;border-collapse:collapse;margin-top:8px;">${rowsHtml}</table>
          <p style="color:#F1E9DD;font-size:14px;line-height:1.7;margin-top:24px;"><strong>Event:</strong> 12&ndash;13 December 2026 &middot; Bengaluru<br/><strong>Overall prize pool:</strong> ₹5,00,000</p>
          <p style="color:#F1E9DD;font-size:14px;line-height:1.7;margin-top:16px;">Questions? Reply to this email or WhatsApp us at <a href="https://wa.me/919414870102" style="color:#E8622C;">+91 94148 70102</a>.</p>
        `,
                ctaText: "Race brief",
                ctaUrl: "https://www.dirtridecamp.com/events/drc-ultimate-rider",
            }),
        });

        return NextResponse.json({ ok: true });
    } catch (err) {
        console.error("[ultimate-rider register]", err);
        return NextResponse.json({ error: "Server error. Please try again." }, { status: 500 });
    }
}

function escapeHtml(s: string) {
    return String(s).replace(/[&<>"']/g, (c) =>
        c === "&" ? "&amp;" : c === "<" ? "&lt;" : c === ">" ? "&gt;" : c === '"' ? "&quot;" : "&#39;",
    );
}
