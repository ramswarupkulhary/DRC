import { prisma } from "@/lib/prisma";
import { programs as DEFAULT_PROGRAMS, getProgram as getStaticProgram, type Program } from "@/lib/programs";

type ProgramRow = {
    slug: string;
    category: string;
    name: string;
    price: number;
    priceUnit: string | null;
    duration: string;
    difficulty: string;
    description: string;
    lunch: string | null;
    optionalLunch: number | null;
    requiresRiding: boolean;
    supportsCompanions: boolean;
    content: string | null;
};

/** Maps a DB row (core fields + JSON content) back to the rich Program shape used everywhere. */
export function rowToProgram(row: ProgramRow): Program {
    let content: Partial<Program> = {};
    try {
        content = row.content ? (JSON.parse(row.content) as Partial<Program>) : {};
    } catch {
        content = {};
    }
    return {
        slug: row.slug,
        category: row.category as Program["category"],
        name: row.name,
        price: row.price,
        priceUnit: row.priceUnit || undefined,
        duration: row.duration,
        difficulty: row.difficulty,
        description: row.description,
        lunch: row.lunch || undefined,
        optionalLunch: row.optionalLunch ?? undefined,
        requiresRiding: row.requiresRiding,
        supportsCompanions: row.supportsCompanions,
        ...content,
    };
}

/** Splits a rich Program into DB columns + a JSON content blob. */
export function programToRow(p: Program, sortOrder = 0) {
    const { slug, category, name, price, priceUnit, duration, difficulty, description, lunch, optionalLunch, requiresRiding, supportsCompanions, ...content } = p;
    return {
        slug,
        category,
        name,
        price,
        priceUnit: priceUnit ?? null,
        duration,
        difficulty,
        description,
        lunch: lunch ?? null,
        optionalLunch: optionalLunch ?? null,
        requiresRiding: requiresRiding ?? true,
        supportsCompanions: supportsCompanions ?? false,
        sortOrder,
        content: JSON.stringify(content),
    };
}

/** Seeds the Program table from the static defaults the first time it's empty. */
export async function ensureProgramsSeeded(): Promise<void> {
    const count = await prisma.program.count();
    if (count > 0) return;
    await prisma.program.createMany({
        data: DEFAULT_PROGRAMS.map((p, i) => ({ ...programToRow(p, i), active: true, featured: false })),
        skipDuplicates: true,
    });
}

/** All programs (optionally active only), ordered for display. Falls back to static defaults. */
export async function listPrograms(opts?: { activeOnly?: boolean }): Promise<Program[]> {
    await ensureProgramsSeeded();
    const rows = await prisma.program.findMany({
        where: opts?.activeOnly ? { active: true } : undefined,
        orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    });
    if (rows.length === 0) return DEFAULT_PROGRAMS;
    return rows.map(rowToProgram);
}

/** A single program by slug (DB first, static fallback so pricing never breaks). */
export async function getProgramBySlug(slug: string): Promise<Program | undefined> {
    const row = await prisma.program.findUnique({ where: { slug } });
    if (row) return rowToProgram(row);
    return getStaticProgram(slug);
}
/** Resolves an authoritative rental-bike price (own bike → 0). */
export async function getRentalBike(bikeId?: string | null): Promise<{ name: string | null; price: number }> {
  if (!bikeId) return { name: null, price: 0 };
  const bike = await prisma.rentalBike.findUnique({ where: { id: bikeId } });
  if (!bike || !bike.active) return { name: null, price: 0 };
  return { name: bike.name, price: bike.price };
}