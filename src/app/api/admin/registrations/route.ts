import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const registrations = await prisma.registration.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { name: true, email: true, phone: true } },
      ride: { select: { title: true, startDate: true } },
      training: { select: { title: true } },
    },
  });
  return NextResponse.json(registrations);
}
