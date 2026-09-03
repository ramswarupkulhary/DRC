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
    personPrice: number | null;
    kidPrice: number | null;
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
        personPrice: row.personPrice ?? undefined,
        kidPrice: row.kidPrice ?? undefined,
        requiresRiding: row.requiresRiding,
        supportsCompanions: row.supportsCompanions,
        ...content,
    };
}

/** Splits a rich Program into DB columns + a JSON content blob. */
export function programToRow(p: Program, sortOrder = 0) {
    const { slug, category, name, price, priceUnit, duration, difficulty, description, lunch, optionalLunch, personPrice, kidPrice, requiresRiding, supportsCompanions, ...content } = p;
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
        personPrice: personPrice ?? null,
        kidPrice: kidPrice ?? null,
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

/**
 * Idempotently reconciles an already-seeded catalog with the current defaults:
 * renames the legacy "Private Training" programs to "Off-Road Training" (only when the
 * DB still holds the old default name, so admin edits are preserved) and inserts any
 * new default programs that don't yet exist by slug.
 */
export async function reconcileProgramCatalog(): Promise<void> {
    const count = await prisma.program.count();
    if (count === 0) return; // fresh installs are handled by ensureProgramsSeeded

    // Apply the Private → Off-Road rename only if the row still has the old default name.
    const renames: { slug: string; from: string; to: string }[] = [
        { slug: "private-training-half-day", from: "Private Training — Half Day", to: "Off-Road Training — Half Day" },
        { slug: "private-training-full-day", from: "Private Training — Full Day", to: "Off-Road Training — Full Day" },
    ];
    for (const r of renames) {
        await prisma.program.updateMany({ where: { slug: r.slug, name: r.from }, data: { name: r.to } }).catch(() => { });
    }

    // Legacy Family/Friends were two separate plans — they're now one dynamic "Family & Friends".
    await prisma.program.deleteMany({ where: { slug: { in: ["family-overnighter-plan", "friends-plan"] } } }).catch(() => { });
    // The Overnighter is a solo trail; companions are handled by the Family & Friends program.
    await prisma.program.updateMany({ where: { slug: "overnighter-trail" }, data: { supportsCompanions: false } }).catch(() => { });

    // Insert any default programs missing from the DB (e.g. the new Private 1:1 trainings, Family & Friends).
    const existing = await prisma.program.findMany({ select: { slug: true } });
    const have = new Set(existing.map((e) => e.slug));
    const missing = DEFAULT_PROGRAMS.filter((p) => !have.has(p.slug));
    if (missing.length) {
        const maxOrder = existing.length + 100;
        await prisma.program.createMany({
            data: missing.map((p, i) => ({ ...programToRow(p, maxOrder + i), active: true, featured: false })),
            skipDuplicates: true,
        });
    }
}

/** All programs (optionally active only), ordered for display. Falls back to static defaults. */
export async function listPrograms(opts?: { activeOnly?: boolean }): Promise<Program[]> {
    await ensureProgramsSeeded();
    await reconcileProgramCatalog();
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