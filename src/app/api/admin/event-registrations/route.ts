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

export async function GET(req: Request) {
    const session = await requireAdmin();
    if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const url = new URL(req.url);
    const eventSlug = url.searchParams.get("eventSlug") || undefined;
    const category = url.searchParams.get("category") || undefined;
    const paymentStatus = url.searchParams.get("paymentStatus") || undefined;
    const registrationType = url.searchParams.get("registrationType") || undefined;
    const status = url.searchParams.get("status") || undefined;
    const format = url.searchParams.get("format") || undefined;
    if (!eventSlug) return NextResponse.json({ error: "Select an event first." }, { status: 400 });
    if (registrationType && !["rider", "spectator"].includes(registrationType)) return NextResponse.json({ error: "Invalid registration type." }, { status: 400 });
    if (paymentStatus && !["paid", "pending", "cancelled", "refunded"].includes(paymentStatus)) return NextResponse.json({ error: "Invalid payment status." }, { status: 400 });
    if (status && !["active", "cancelled"].includes(status)) return NextResponse.json({ error: "Invalid booking status." }, { status: 400 });
    if (format && !["xlsx", "category-zip"].includes(format)) return NextResponse.json({ error: "Unsupported export format." }, { status: 400 });
    const event = await prisma.event.findUnique({ where: { slug: eventSlug }, select: { id: true, title: true } });
    if (!event) return NextResponse.json({ error: "Event not found." }, { status: 404 });

    const registrations = await prisma.eventRegistration.findMany({
        where: {
            eventSlug,
            ...(status ? { status } : {}),
            ...(registrationType ? { registrationType } : {}),
            ...(category ? { OR: [{ category }, { category: { startsWith: `${category},` } }, { category: { endsWith: `,${category}` } }, { category: { contains: `,${category},` } }] } : {}),
            ...(paymentStatus ? { paymentStatus } : {}),
        },
        orderBy: { createdAt: "desc" },
        include: {
            user: { select: { id: true, name: true, email: true, phone: true } },
        },
    });

    if (format) {
        const { buildRegistrationWorkbook, buildCategoryWorkbooks } = await import("@/lib/eventRegistrationExport");
        const categories = await prisma.eventCategory.findMany({ where: { eventId: event.id, ...(category ? { slug: category } : {}) }, select: { slug: true, name: true, classLabel: true } });
        const buffer = format === "category-zip"
            ? await buildCategoryWorkbooks(event.title, registrations, registrationType === "spectator" ? [] : categories, category)
            : await buildRegistrationWorkbook(event.title, registrations, categories);
        return new NextResponse(new Uint8Array(buffer), {
            headers: {
                "Content-Type": format === "category-zip" ? "application/zip" : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                "Content-Disposition": `attachment; filename="${eventSlug.replace(/[^a-zA-Z0-9-]/g, "-")}-${registrationType || "all"}-registrations.${format === "category-zip" ? "zip" : "xlsx"}"`,
                "Cache-Control": "private, no-store",
            }
        });
    }
    return NextResponse.json(registrations, { headers: { "Cache-Control": "private, no-store" } });
}
