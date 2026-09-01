import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as { role?: string }).role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const bookings = await prisma.programBooking.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      companions: true,
      user: { select: { name: true, email: true, phone: true } },
    },
  });

  return NextResponse.json({ bookings });
}
