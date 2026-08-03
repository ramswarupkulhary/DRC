import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendEmail, drcEmailTemplate } from "@/lib/email";

export async function POST(req: Request) {
  const { email } = await req.json();

  if (!email) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return NextResponse.json({ error: "No account found with this email. Please register first.", notFound: true }, { status: 404 });
  }

  await prisma.otp.updateMany({
    where: { email, type: "forgot_password", used: false },
    data: { used: true },
  });

  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expires = new Date(Date.now() + 10 * 60 * 1000);

  await prisma.otp.create({
    data: { email, code, type: "forgot_password", expires },
  });

  try {
    await sendEmail({
      to: email,
      subject: `Password Reset Code: ${code}`,
      html: drcEmailTemplate({
        title: "Password Reset",
        body: `
          <p style="color: #F1E9DD;">Hi ${user.name || "Rider"},</p>
          <p style="color: #F1E9DD;">Your password reset code is:</p>
          <div style="text-align: center; margin: 24px 0;">
            <span style="font-size: 36px; font-weight: bold; color: #E8622C; letter-spacing: 8px; font-family: monospace;">${code}</span>
          </div>
          <p style="color: #888888;">This code expires in 10 minutes. If you didn't request this, ignore this email.</p>
        `,
      }),
    });
  } catch (error) {
    console.error("[EMAIL] Forgot password OTP failed:", error instanceof Error ? error.message : String(error));
    return NextResponse.json({ error: "Failed to send email. Please try again." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
