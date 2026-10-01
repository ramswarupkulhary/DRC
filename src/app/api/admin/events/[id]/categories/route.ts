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

function slugify(s: string) {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const categories = await prisma.eventCategory.findMany({
    where: { eventId: id },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  });
  return NextResponse.json(categories);
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const body = await req.json();
  const name = String(body.name || "").trim();
  if (!name) return NextResponse.json({ error: "Name is required." }, { status: 400 });

  const fee = parseInt(String(body.fee ?? 0), 10);
  if (Number.isNaN(fee) || fee < 0) return NextResponse.json({ error: "Fee must be a positive number." }, { status: 400 });

  const slug = (body.slug && String(body.slug).trim()) || slugify(name);

  try {
    const created = await prisma.eventCategory.create({
      data: {
        eventId: id,
        slug,
        name,
        description: body.description ? String(body.description) : null,
        fee,
        totalSlots: body.totalSlots ? parseInt(String(body.totalSlots), 10) : null,
        sortOrder: body.sortOrder ? parseInt(String(body.sortOrder), 10) : 0,
        active: body.active !== false,
      },
    });
    return NextResponse.json(created, { status: 201 });
  } catch {
    return NextResponse.json({ error: "A category with that slug already exists on this event." }, { status: 409 });
  }
}
