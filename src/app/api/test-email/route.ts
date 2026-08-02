import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "relay.secureserver.net",
  port: 465,
  secure: true,
  auth: {
    user: "info@dirtridecamp.com",
    pass: process.env.SMTP_PASSWORD,
  },
});

export async function GET() {
  console.log("[TEST] Testing GoDaddy SMTP email...");

  try {
    const info = await transporter.sendMail({
      from: "info@dirtridecamp.com",
      to: "kulhary.1999@gmail.com",
      subject: "DRC Test Email",
      html: `<h1>Test Email</h1><p>Test at ${new Date().toISOString()}</p>`,
    });

    console.log("[TEST] ✅ Email sent! ID:", (info as any)?.messageId);
    return NextResponse.json({
      success: true,
      message: "Email sent successfully",
      messageId: (info as any)?.messageId,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("[TEST] ❌ FAILED:", msg);
    return NextResponse.json(
      {
        success: false,
        error: msg,
      },
      { status: 500 }
    );
  }
}

