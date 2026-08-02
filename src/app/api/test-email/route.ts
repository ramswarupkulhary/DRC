import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function GET() {
  console.log("[TEST] Starting email test");
  console.log("[TEST] SMTP_PASSWORD exists:", !!process.env.SMTP_PASSWORD);
  console.log("[TEST] SMTP_PASSWORD value:", process.env.SMTP_PASSWORD?.substring(0, 5) + "***");

  const transporter = nodemailer.createTransport({
    host: "smtpout.secureserver.net",
    port: 465,
    secure: true,
    auth: {
      user: "info@dirtridecamp.com",
      pass: process.env.SMTP_PASSWORD,
    },
  } as any);

  try {
    console.log("[TEST] Verifying SMTP connection...");
    await transporter.verify();
    console.log("[TEST] ✅ SMTP connection verified!");

    console.log("[TEST] Sending test email...");
    const info = await transporter.sendMail({
      from: "info@dirtridecamp.com",
      to: "kulhary.1999@gmail.com",
      subject: "DRC Test Email",
      html: `<h1>Test Email</h1><p>This is a test email from DRC production at ${new Date().toISOString()}</p>`,
    });

    console.log("[TEST] ✅ Email sent! MessageID:", info.messageId);
    return NextResponse.json({
      success: true,
      message: "Email sent successfully",
      messageId: info.messageId,
    });
  } catch (error) {
    console.error("[TEST] ❌ Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
