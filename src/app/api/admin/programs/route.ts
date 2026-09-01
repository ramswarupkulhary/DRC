import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ensureProgramsSeeded } from "@/lib/programsDb";

function requireAdmin(session: unknown) {
  return !!session && (session as { user?: { role?: string } }).user?.role === "admin";
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!requireAdmin(session)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await ensureProgramsSeeded();
  const programs = await prisma.program.findMany({ orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }] });
  return NextResponse.json({ programs });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!requireAdmin(session)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const b = await req.json();
  if (!b.slug || !b.name || !b.category || b.price == null) {
    return NextResponse.json({ error: "slug, name, category and price are required" }, { status: 400 });
  }

  // Validate content JSON if provided.
  if (b.content) {
    try {
      JSON.parse(b.content);
    } catch {
      return NextResponse.json({ error: "Content must be valid JSON" }, { status: 400 });
    }
  }

  const max = await prisma.program.aggregate({ _max: { sortOrder: true } });

  try {
    const program = await prisma.program.create({
      data: {
        slug: String(b.slug).trim(),
        category: b.category,
        name: b.name,
        price: parseInt(b.price, 10),
        priceUnit: b.priceUnit || null,
        duration: b.duration || "",
        difficulty: b.difficulty || "",
        description: b.description || "",
        lunch: b.lunch || null,
        optionalLunch: b.optionalLunch ? parseInt(b.optionalLunch, 10) : null,
        requiresRiding: b.requiresRiding ?? true,
        supportsCompanions: b.supportsCompanions ?? false,
        active: b.active ?? true,
        featured: b.featured ?? false,
        sortOrder: (max._max.sortOrder ?? 0) + 1,
        content: b.content || null,
      },
    });
    return NextResponse.json({ program }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "A program with that slug already exists" }, { status: 400 });
  }
}
