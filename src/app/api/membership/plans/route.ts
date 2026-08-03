import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const plans = await prisma.membershipPlan.findMany({
    where: { active: true },
    select: { id: true, name: true, duration: true },
    orderBy: { price: "asc" },
  });
  return NextResponse.json({ plans });
}
