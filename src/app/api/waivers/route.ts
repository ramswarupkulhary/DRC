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

  // A valid e-signature requires the typed legal name + explicit agreement.
  if (!body.fullName || !body.signature || !body.agreedTerms) {
    return NextResponse.json({ error: "Please type your full legal name and accept the terms to sign." }, { status: 400 });
  }

  const ipAddress =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    null;

  const waiver = await prisma.waiver.create({
    data: {
      userId,
      type: body.type || "indemnity",
      fullName: body.fullName,
      dateOfBirth: body.dateOfBirth || null,
      emergencyName: body.emergencyName || "",
      emergencyPhone: body.emergencyPhone || "",
      medicalConditions: body.medicalConditions || null,
      allergies: body.allergies || null,
      medications: body.medications || null,
      agreedTerms: true,
      signature: body.signature,
      ipAddress,
      context: body.context || null,
      registrationId: body.registrationId || null,
      programBookingId: body.programBookingId || null,
    },
  });

  // Mark the related booking as waiver-signed.
  if (body.registrationId) {
    await prisma.registration.update({ where: { id: body.registrationId }, data: { waiverSigned: true } }).catch(() => { });
  }
  if (body.programBookingId) {
    await prisma.programBooking.update({ where: { id: body.programBookingId }, data: { waiverSigned: true } }).catch(() => { });
  }

  return NextResponse.json(waiver, { status: 201 });
}
