import { NextResponse } from "next/server";
import sgMail from "@sendgrid/mail";

sgMail.setApiKey(process.env.SENDGRID_API_KEY || "");

export async function GET() {
  console.log("[TEST] Testing SendGrid email...");

  try {
    await sgMail.send({
      to: "kulhary.1999@gmail.com",
      from: "info@dirtridecamp.com",
      subject: "DRC Test Email",
      html: `<h1>Test Email from SendGrid</h1><p>Test at ${new Date().toISOString()}</p>`,
    });

    console.log("[TEST] ✅ Email sent via SendGrid");
    return NextResponse.json({
      success: true,
      message: "Email sent successfully via SendGrid",
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

