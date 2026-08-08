import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const riders = await prisma.user.findMany({
    where: { role: "rider" },
    select: { id: true, name: true, email: true, phone: true },
    orderBy: { name: "asc" },
  });

  return NextResponse.json(riders);
}
