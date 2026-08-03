import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const rides = await prisma.ride.findMany({
    where: { status: "published" },
    select: { id: true, title: true },
    orderBy: { startDate: "desc" },
  });
  return NextResponse.json({ rides });
}
