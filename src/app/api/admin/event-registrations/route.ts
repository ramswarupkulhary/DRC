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

  const registrations = await prisma.eventRegistration.findMany({
    where: {
      ...(eventSlug ? { eventSlug } : {}),
      ...(category ? { category } : {}),
      ...(paymentStatus ? { paymentStatus } : {}),
    },
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { id: true, name: true, email: true, phone: true } },
    },
  });

  return NextResponse.json(registrations);
}
