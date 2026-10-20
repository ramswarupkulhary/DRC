import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  const role = (session?.user as { role?: string } | undefined)?.role;
  if (!session?.user || !["admin", "coordinator"].includes(role || "")) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const url = new URL(req.url);
  const rideId = url.searchParams.get("rideId");

  const where = { deletedAt: null, ...(rideId ? { rideId } : {}) };

  const registrations = await prisma.registration.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { id: true, name: true, email: true, phone: true } },
      ride: { select: { title: true, startDate: true } },
      training: { select: { title: true } },
    },
  });
  return NextResponse.json(registrations);
}
