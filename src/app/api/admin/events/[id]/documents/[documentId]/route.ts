import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string; documentId: string }> }) {
    const session = await getServerSession(authOptions);
    const role = (session?.user as { role?: string } | undefined)?.role;
    if (!session?.user || !["admin", "coordinator"].includes(role || "")) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    const { id, documentId } = await params;
    const result = await prisma.eventDocument.updateMany({ where: { id: documentId, eventId: id, active: true }, data: { active: false } });
    if (!result.count) return NextResponse.json({ error: "Document not found for this event." }, { status: 404 });
    return NextResponse.json({ ok: true });
}