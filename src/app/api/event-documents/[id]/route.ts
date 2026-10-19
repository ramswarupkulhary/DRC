import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendEmail, drcEmailTemplate } from "@/lib/email";
import { escapePassText } from "@/lib/spectatorPass";

export const dynamic = "force-dynamic";

export async function HEAD(_req: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const document = await prisma.eventDocument.findFirst({ where: { id, active: true }, select: { size: true } });
    return new NextResponse(null, { status: document ? 200 : 404, headers: { "Cache-Control": "no-store", ...(document ? { "Content-Type": "application/pdf", "Content-Length": String(document.size) } : {}) } });
}

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const document = await prisma.eventDocument.findFirst({ where: { id, active: true }, include: { event: { select: { title: true, slug: true } } } });
    if (!document) return NextResponse.json({ error: "Document not found." }, { status: 404 });
    const ip = (req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "unknown").slice(0, 200);
    const recent = await prisma.eventDocumentDownload.count({ where: { documentId: id, ip, downloadedAt: { gte: new Date(Date.now() - 60000) } } });
    if (recent >= 10) return NextResponse.json({ error: "Too many downloads. Please try again in a minute." }, { status: 429, headers: { "Retry-After": "60" } });
    const session = await getServerSession(authOptions);
    const userId = (session?.user as { id?: string } | undefined)?.id;
    const user = userId ? await prisma.user.findUnique({ where: { id: userId }, select: { id: true, name: true, email: true, phone: true } }) : null;
    const download = await prisma.eventDocumentDownload.create({
        data: {
            documentId: id, userId: user?.id, name: user?.name, email: user?.email, phone: user?.phone, ip,
            userAgent: req.headers.get("user-agent")?.slice(0, 1000), referrer: req.headers.get("referer")?.slice(0, 2000),
        }
    });
    try {
        const fields = [
            ["Event", document.event.title], ["Document", document.displayText], ["File", document.filename],
            ["Time (IST)", download.downloadedAt.toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })],
            ["Visitor", user ? "Signed in" : "Anonymous visitor"], ["User ID", user?.id || "Not available"],
            ["Name", user?.name || "Not available"], ["Email", user?.email || "Not available"], ["Phone", user?.phone || "Not available"],
            ["IP (reported)", ip], ["Browser", download.userAgent || "Not available"], ["Referrer", download.referrer || "Not available"],
            ["Download ID", download.id],
        ];
        await sendEmail({
            to: process.env.ADMIN_NOTIFICATION_EMAIL || "info@dirtridecamp.com",
            subject: `PDF downloaded - ${document.event.title} - ${document.displayText}`,
            html: drcEmailTemplate({ title: "Event PDF downloaded", body: `<table>${fields.map(([label, value]) => `<tr><th style="text-align:left;padding:8px;color:#E8622C">${escapePassText(label)}</th><td style="padding:8px">${escapePassText(value)}</td></tr>`).join("")}</table><p>Anonymous visitors have not supplied an identity. Request details are not proof of identity. This records a download request; it cannot prove the visitor saved or opened the file.</p>` }),
        });
        await prisma.eventDocumentDownload.update({ where: { id: download.id }, data: { notificationStatus: "sent" } });
    } catch (error) {
        console.error("[event PDF download notification]", error);
        await prisma.eventDocumentDownload.update({ where: { id: download.id }, data: { notificationStatus: "failed" } });
    }
    return new NextResponse(new Uint8Array(document.content), {
        headers: {
            "Content-Type": "application/pdf",
            "Content-Disposition": `attachment; filename="event-document.pdf"; filename*=UTF-8''${encodeURIComponent(document.filename)}`,
            "Content-Length": String(document.size),
            "Cache-Control": "private, no-store",
            "X-Content-Type-Options": "nosniff",
            "X-Robots-Tag": "noindex",
            "Referrer-Policy": "no-referrer",
        }
    });
}