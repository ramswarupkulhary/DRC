import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const registrations = await prisma.registration.findMany({
    where: { userId: id },
    orderBy: { createdAt: "desc" },
    include: {
      ride: { select: { title: true } },
      training: { select: { title: true } },
    },
  });

  return NextResponse.json({ registrations });
}
