import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  const role = (session?.user as { role?: string } | undefined)?.role;
  if (!session?.user || (role !== "admin" && role !== "coordinator")) return null;
  return session;
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string; categoryId: string }> }) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { categoryId } = await params;
  const body = await req.json();
  const data: Record<string, unknown> = {};
  if (typeof body.name === "string") data.name = body.name.trim();
  if (typeof body.slug === "string") data.slug = body.slug.trim();
  if (typeof body.description === "string") data.description = body.description;
  if (body.description === null) data.description = null;
  if (body.fee !== undefined) {
    const fee = parseInt(String(body.fee), 10);
    if (Number.isNaN(fee) || fee < 0) return NextResponse.json({ error: "Invalid fee." }, { status: 400 });
    data.fee = fee;
  }
  if (body.totalSlots !== undefined) {
    data.totalSlots = body.totalSlots === null || body.totalSlots === "" ? null : parseInt(String(body.totalSlots), 10);
  }
  if (body.sortOrder !== undefined) data.sortOrder = parseInt(String(body.sortOrder), 10);
  if (typeof body.active === "boolean") data.active = body.active;

  try {
    const updated = await prisma.eventCategory.update({ where: { id: categoryId }, data });
    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: "Could not update category." }, { status: 400 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string; categoryId: string }> }) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { categoryId } = await params;
  try {
    await prisma.eventCategory.delete({ where: { id: categoryId } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Could not delete category." }, { status: 400 });
  }
}
