import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { MAX_EVENT_PDF_BYTES, validateEventPdf } from "@/lib/eventDocuments";

async function isAdmin() {
    const session = await getServerSession(authOptions);
    const role = (session?.user as { role?: string } | undefined)?.role;
    return !!session?.user && ["admin", "coordinator"].includes(role || "");
}

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
    if (!await isAdmin()) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    const { id } = await params;
    const documents = await prisma.eventDocument.findMany({
        where: { eventId: id, active: true },
        orderBy: { createdAt: "asc" },
        select: { id: true, displayText: true, filename: true, size: true, createdAt: true, _count: { select: { downloads: true } } },
    });
    return NextResponse.json(documents, { headers: { "Cache-Control": "private, no-store" } });
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
    if (!await isAdmin()) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    if (Number(req.headers.get("content-length")) > MAX_EVENT_PDF_BYTES + 1024 * 1024) return NextResponse.json({ error: "PDF files must be 10 MB or smaller." }, { status: 413 });
    const { id } = await params;
    if (!await prisma.event.findUnique({ where: { id }, select: { id: true } })) return NextResponse.json({ error: "Event not found." }, { status: 404 });
    const form = await req.formData();
    const displayText = String(form.get("displayText") || "").trim();
    const file = form.get("file");
    if (!displayText || displayText.length > 150 || !(file instanceof File)) return NextResponse.json({ error: "Enter display text (up to 150 characters) and select a PDF." }, { status: 400 });
    if (file.size > MAX_EVENT_PDF_BYTES) return NextResponse.json({ error: "PDF files must be 10 MB or smaller." }, { status: 413 });
    const content = new Uint8Array(await file.arrayBuffer());
    const error = validateEventPdf(file.name, content);
    if (error) return NextResponse.json({ error }, { status: 400 });
    const document = await prisma.eventDocument.create({ data: { eventId: id, displayText, filename: file.name.slice(0, 200), content, size: file.size }, select: { id: true, displayText: true, filename: true, size: true } });
    return NextResponse.json(document, { status: 201 });
}