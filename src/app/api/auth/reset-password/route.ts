import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashSync } from "bcryptjs";

export async function POST(req: Request) {
  const { token, password } = await req.json();

  if (!token || !password || password.length < 6) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

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
