import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function GET() {
  console.log("[TEST] Starting email test");

  const transporter = nodemailer.createTransport({
    host: "smtpout.secureserver.net",
    port: 465,
    secure: true,
    auth: {
      user: "info@dirtridecamp.com",
      pass: process.env.SMTP_PASSWORD,
    },
    connectionTimeout: 3000,
    socketTimeout: 3000,
  } as any);

  try {
    console.log("[TEST] Sending test email...");
    const sendPromise = transporter.sendMail({
      from: "info@dirtridecamp.com",
      to: "kulhary.1999@gmail.com",
      subject: "DRC Test Email",
      html: `<h1>Test Email</h1><p>Test at ${new Date().toISOString()}</p>`,
    });

    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("SMTP timeout after 5 seconds")), 5000)
    );

    const info = await Promise.race([sendPromise, timeoutPromise]);

    console.log("[TEST] ✅ Email sent!");
    return NextResponse.json({
      success: true,
      message: "Email sent",
      result: info,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("[TEST] ❌ Error:", msg);
    return NextResponse.json(
      {
        success: false,
        error: msg,
        hint: "SMTP connection issue - check GoDaddy settings",
      },
      { status: 500 }
    );
  }
}

