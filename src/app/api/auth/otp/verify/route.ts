import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const { email, code, type } = await req.json();

  if (!email || !code || !type) {
    return NextResponse.json({ error: "Email, code, and type are required" }, { status: 400 });
  }

  const otp = await prisma.otp.findFirst({
    where: { email, code, type, used: false, expires: { gt: new Date() } },
    orderBy: { createdAt: "desc" },
  });

  if (!otp) {
    return NextResponse.json({ error: "Invalid or expired code. Please request a new one." }, { status: 400 });
  }

  await prisma.otp.update({
    where: { id: otp.id },
    data: { used: true },
  });

  return NextResponse.json({ verified: true, verificationId: otp.id });
}
