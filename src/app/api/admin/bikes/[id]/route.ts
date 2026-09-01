import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function isAdmin(session: unknown) {
  return !!session && (session as { user?: { role?: string } }).user?.role === "admin";
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!isAdmin(session)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const b = await req.json();
  const data: Record<string, unknown> = {};
  if (b.name !== undefined) data.name = b.name;
  if (b.price !== undefined) data.price = parseInt(b.price, 10) || 0;
  if (b.active !== undefined) data.active = b.active;
  if (b.sortOrder !== undefined) data.sortOrder = parseInt(b.sortOrder, 10);

  const bike = await prisma.rentalBike.update({ where: { id }, data });
  return NextResponse.json({ bike });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!isAdmin(session)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await prisma.rentalBike.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
