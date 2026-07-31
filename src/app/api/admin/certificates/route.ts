import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const certs = await prisma.certificate.findMany({
    orderBy: { issuedAt: "desc" },
    include: {
      user: { select: { name: true, email: true } },
      training: { select: { title: true } },
    },
  });
  return NextResponse.json(certs);
}

export async function POST(req: Request) {
  const body = await req.json();
  const certNumber = `DRC-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

  const cert = await prisma.certificate.create({
    data: {
      userId: body.userId,
      trainingId: body.trainingId || null,
      title: body.title,
      type: body.type || "training",
      certNumber,
      validUntil: body.validUntil ? new Date(body.validUntil) : null,
    },
  });

  return NextResponse.json(cert, { status: 201 });
}
