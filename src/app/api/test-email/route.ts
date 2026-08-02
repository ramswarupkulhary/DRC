import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function GET() {
  console.log("[TEST] === EMAIL TEST START ===");
  console.log("[TEST] SMTP_PASSWORD:", process.env.SMTP_PASSWORD ? "SET" : "MISSING");

  const transporter = nodemailer.createTransport({
    host: "216.69.141.27",
    port: 25,
    secure: false,
    auth: {
      user: "info@dirtridecamp.com",
      pass: process.env.SMTP_PASSWORD,
    },
    connectionTimeout: 10000,
    socketTimeout: 10000,
    tls: { rejectUnauthorized: false },
  } as any);

  try {
    console.log("[TEST] Sending test email directly (skip verify)...");
    const info = await transporter.sendMail({
      from: "info@dirtridecamp.com",
      to: "kulhary.1999@gmail.com",
      subject: "DRC Test Email",
      html: `<h1>Test Email</h1><p>Test at ${new Date().toISOString()}</p>`,
    });

    console.log("[TEST] ✅ Email sent! MessageID:", (info as any)?.messageId);
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

