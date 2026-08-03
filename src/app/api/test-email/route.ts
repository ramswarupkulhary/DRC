import { NextResponse } from "next/server";
import { sendEmail, drcEmailTemplate } from "@/lib/email";

export async function GET() {
  const start = Date.now();
  try {
    await sendEmail({
      to: "kulhary.1999@gmail.com",
      subject: "DRC Test Email",
      html: drcEmailTemplate({
        title: "Test Email",
        body: `<p style="color: #F1E9DD;">This is a test email from DRC sent at ${new Date().toISOString()}</p>
               <p style="color: #888888;">If you received this, email sending is working correctly.</p>`,
      }),
    });
    return NextResponse.json({
      success: true,
      message: "Email sent successfully",
      elapsed: `${Date.now() - start}ms`,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("[TEST] Email failed:", msg);
    return NextResponse.json({
      success: false,
      error: msg,
      elapsed: `${Date.now() - start}ms`,
    }, { status: 500 });
  }
}
