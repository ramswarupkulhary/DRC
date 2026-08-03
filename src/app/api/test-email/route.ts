import { NextResponse } from "next/server";
import { sendEmail } from "@/lib/email";

export async function GET() {
  try {
    await sendEmail({
      to: "kulhary.1999@gmail.com",
      subject: "DRC Test Email",
      html: `<h1>Test Email</h1><p>Test at ${new Date().toISOString()}</p>`,
    });
    return NextResponse.json({ success: true, message: "Email sent successfully" });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("[TEST] ❌ FAILED:", msg);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
