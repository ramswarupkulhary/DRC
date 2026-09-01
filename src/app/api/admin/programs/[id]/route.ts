import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function requireAdmin(session: unknown) {
  return !!session && (session as { user?: { role?: string } }).user?.role === "admin";
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!requireAdmin(session)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const b = await req.json();

  if (b.content) {
    try {
      JSON.parse(b.content);
    } catch {
      return NextResponse.json({ error: "Content must be valid JSON" }, { status: 400 });
    }
  }

  const data: Record<string, unknown> = {};
  if (b.name !== undefined) data.name = b.name;
  if (b.category !== undefined) data.category = b.category;
  if (b.price !== undefined) data.price = parseInt(b.price, 10);
  if (b.priceUnit !== undefined) data.priceUnit = b.priceUnit || null;
  if (b.duration !== undefined) data.duration = b.duration;
  if (b.difficulty !== undefined) data.difficulty = b.difficulty;
  if (b.description !== undefined) data.description = b.description;
  if (b.lunch !== undefined) data.lunch = b.lunch || null;
  if (b.optionalLunch !== undefined) data.optionalLunch = b.optionalLunch ? parseInt(b.optionalLunch, 10) : null;
  if (b.requiresRiding !== undefined) data.requiresRiding = b.requiresRiding;
  if (b.supportsCompanions !== undefined) data.supportsCompanions = b.supportsCompanions;
  if (b.active !== undefined) data.active = b.active;
  if (b.featured !== undefined) data.featured = b.featured;
  if (b.sortOrder !== undefined) data.sortOrder = parseInt(b.sortOrder, 10);
  if (b.content !== undefined) data.content = b.content || null;

  const program = await prisma.program.update({ where: { id }, data });
  return NextResponse.json({ program });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!requireAdmin(session)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await prisma.program.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
