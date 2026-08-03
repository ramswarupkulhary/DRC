import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const rideId = url.searchParams.get("rideId");

  const where = rideId ? { rideId } : {};

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
