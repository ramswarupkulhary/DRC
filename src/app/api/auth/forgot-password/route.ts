import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { randomBytes } from "crypto";

export async function POST(req: Request) {
  const { email } = await req.json();

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return NextResponse.json({ ok: true });
  }

  const token = randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + 3600000);

  await prisma.passwordReset.create({
    data: { userId: user.id, token, expires },
  });

  console.log(`[Password Reset] Token for ${email}: ${token}`);
  console.log(`[Password Reset] Reset URL: /reset-password?token=${token}`);

  return NextResponse.json({ ok: true });
}
