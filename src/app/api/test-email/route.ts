import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function GET() {
  console.log("[TEST] === EMAIL TEST START ===");
  console.log("[TEST] SMTP_PASSWORD:", process.env.SMTP_PASSWORD ? "SET" : "MISSING");

  const transporter = nodemailer.createTransport({
    host: "relay.secureserver.net",
    port: 465,
    secure: true,
    auth: {
      user: "info@dirtridecamp.com",
      pass: process.env.SMTP_PASSWORD,
    },
    connectionTimeout: 10000,
    socketTimeout: 10000,
  } as any);

  try {
    console.log("[TEST] Step 1: Verifying SMTP connection...");
    await Promise.race([
      transporter.verify(),
      new Promise((_, reject) => setTimeout(() => reject(new Error("Verify timeout")), 6000))
    ]);
    console.log("[TEST] ✅ SMTP verified");

    console.log("[TEST] Step 2: Sending test email...");
    const info = await Promise.race([
      transporter.sendMail({
        from: "info@dirtridecamp.com",
        to: "kulhary.1999@gmail.com",
        subject: "DRC Test Email",
        html: `<h1>Test Email</h1><p>Test at ${new Date().toISOString()}</p>`,
      }),
      new Promise((_, reject) => setTimeout(() => reject(new Error("Send timeout")), 6000))
    ]);

    console.log("[TEST] ✅ Email sent! MessageID:", info?.messageId);
    return NextResponse.json({
      success: true,
      message: "Email sent successfully",
      messageId: info?.messageId,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("[TEST] ❌ FAILED:", msg);
    console.error("[TEST] Error object:", error);
    return NextResponse.json(
      {
        success: false,
        error: msg,
        host: "smtpout.secureserver.net",
        port: 465,
      },
      { status: 500 }
    );
  }
}

