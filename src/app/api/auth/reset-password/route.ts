import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashSync } from "bcryptjs";

export async function POST(req: Request) {
  const { email, otp, password, token } = await req.json();

  if (!password || password.length < 6) {
    return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
  }

  if (token) {
    const resetRecord = await prisma.passwordReset.findUnique({ where: { token } });
    if (!resetRecord || resetRecord.used || resetRecord.expires < new Date()) {
      return NextResponse.json({ error: "Invalid or expired reset link" }, { status: 400 });
    }

    await prisma.user.update({
      where: { id: resetRecord.userId },
      data: { passwordHash: hashSync(password, 10) },
    });

    await prisma.passwordReset.update({
      where: { id: resetRecord.id },
      data: { used: true },
    });

    return NextResponse.json({ ok: true });
  }

  if (!email || !otp) {
    return NextResponse.json({ error: "Email and OTP are required" }, { status: 400 });
  }

  const otpRecord = await prisma.otp.findFirst({
    where: { email, code: otp, type: "forgot_password", used: false, expires: { gt: new Date() } },
    orderBy: { createdAt: "desc" },
  });

  if (!otpRecord) {
    return NextResponse.json({ error: "Invalid or expired code" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash: hashSync(password, 10) },
  });

  await prisma.otp.update({
    where: { id: otpRecord.id },
    data: { used: true },
  });

  return NextResponse.json({ ok: true });
}
