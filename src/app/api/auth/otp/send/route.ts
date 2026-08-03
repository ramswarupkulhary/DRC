import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendEmail, drcEmailTemplate } from "@/lib/email";

export async function POST(req: Request) {
  const { email, type } = await req.json();

  if (!email || !type) {
    return NextResponse.json({ error: "Email and type are required" }, { status: 400 });
  }

  if (type === "password_change") {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email || session.user.email !== email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  if (type === "forgot_password") {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ error: "No account found with this email. Please register first.", notFound: true }, { status: 404 });
    }
  }

  await prisma.otp.updateMany({
    where: { email, type, used: false },
    data: { used: true },
  });

  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expires = new Date(Date.now() + 10 * 60 * 1000);

  await prisma.otp.create({
    data: { email, code, type, expires },
  });

  try {
    await sendEmail({
      to: email,
      subject: `Your DRC Verification Code: ${code}`,
      html: drcEmailTemplate({
        title: "Verification Code",
        body: `
          <p style="color: #F1E9DD;">Your one-time verification code is:</p>
          <div style="text-align: center; margin: 24px 0;">
            <span style="font-size: 36px; font-weight: bold; color: #E8622C; letter-spacing: 8px; font-family: monospace;">${code}</span>
          </div>
          <p style="color: #888888;">This code expires in 10 minutes. Do not share it with anyone.</p>
        `,
      }),
    });
  } catch (error) {
    console.error("[OTP] Email send failed:", error instanceof Error ? error.message : String(error));
    return NextResponse.json({ error: "Failed to send verification code. Please try again." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
