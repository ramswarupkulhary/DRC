import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const memberships = await prisma.membership.findMany({
    include: {
      plan: true,
      users: { select: { id: true, name: true, email: true, phone: true, image: true } },
    },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ memberships });
}

export async function PATCH(req: Request) {
  const { id, status } = await req.json();

  const data: Record<string, unknown> = { status };

  if (status === "active") {
    const membership = await prisma.membership.findUnique({ where: { id }, include: { plan: true } });
    if (membership) {
      data.startDate = new Date();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + membership.plan.duration);
      data.endDate = endDate;
    }
  }

  const membership = await prisma.membership.update({ where: { id }, data });
  return NextResponse.json({ membership });
}
