import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  const role = (session?.user as { role?: string } | undefined)?.role;
  if (!session?.user || !["admin", "coordinator"].includes(role || "")) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { id } = await params;

  const registrations = await prisma.registration.findMany({
    where: { userId: id, deletedAt: null },
    orderBy: { createdAt: "desc" },
    include: {
      ride: { select: { title: true } },
      training: { select: { title: true } },
    },
  });

  return NextResponse.json({ registrations });
}
