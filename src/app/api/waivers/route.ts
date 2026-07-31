import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  const userId = (session.user as { id: string }).id;

  const waiver = await prisma.waiver.findFirst({
    where: { userId },
    orderBy: { signedAt: "desc" },
  });

  return NextResponse.json(waiver);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  const userId = (session.user as { id: string }).id;
  const body = await req.json();

  if (!body.fullName || !body.emergencyName || !body.emergencyPhone || !body.agreedTerms) {
    return NextResponse.json({ error: "All required fields must be filled" }, { status: 400 });
  }

  const waiver = await prisma.waiver.create({
    data: {
      userId,
      type: body.type || "standard",
      fullName: body.fullName,
      dateOfBirth: body.dateOfBirth || null,
      emergencyName: body.emergencyName,
      emergencyPhone: body.emergencyPhone,
      medicalConditions: body.medicalConditions || null,
      allergies: body.allergies || null,
      medications: body.medications || null,
      agreedTerms: body.agreedTerms,
    },
  });

  return NextResponse.json(waiver, { status: 201 });
}
