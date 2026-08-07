import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const { email, otp } = await req.json();

  if (!email || !otp) {
    return NextResponse.json({ error: "Email and OTP are required" }, { status: 400 });
  }

  const record = await prisma.otp.findFirst({
    where: { email, code: otp, type: "forgot_password", used: false },
    orderBy: { createdAt: "desc" },
  });

  if (!record) {
    return NextResponse.json({ error: "Invalid verification code" }, { status: 400 });
  }

  if (new Date() > record.expires) {
    return NextResponse.json({ error: "Code has expired. Please request a new one." }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
