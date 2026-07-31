import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  const userId = (session.user as { id: string }).id;

  const certs = await prisma.certificate.findMany({
    where: { userId },
    include: { training: { select: { title: true, level: true } } },
    orderBy: { issuedAt: "desc" },
  });

  return NextResponse.json(certs);
}
