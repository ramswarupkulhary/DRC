import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendEmail, drcEmailTemplate } from "@/lib/email";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();

  const data: Record<string, unknown> = {};
  if (body.read !== undefined) data.read = body.read;
  if (body.reply) {
    const message = await prisma.contactMessage.findUnique({ where: { id } });
    if (!message) return NextResponse.json({ error: "Not found" }, { status: 404 });

    try {
      await sendEmail({
        to: message.email,
        subject: `Re: ${message.subject || "Your message to DRC"}`,
        html: drcEmailTemplate({
          title: "Reply from Dirt Ride Camp",
          body: `
            <p style="color: #F1E9DD; font-size: 15px;">Hi ${message.name},</p>
            <p style="color: #B9A886; font-size: 14px; white-space: pre-wrap;">${body.reply}</p>
            <div style="background: #0D0D0D; border-left: 3px solid #444; padding: 12px; margin: 16px 0;">
              <p style="color: #666; font-size: 12px; margin: 0;">Your original message:</p>
              <p style="color: #888; font-size: 13px; margin: 4px 0 0; white-space: pre-wrap;">${message.message}</p>
            </div>
          `,
          ctaText: "Visit DRC",
          ctaUrl: "https://www.dirtridecamp.com",
        }),
      });
    } catch (err) {
      console.error("[REPLY] Email failed:", err);
      return NextResponse.json({ error: "Failed to send reply" }, { status: 500 });
    }

    data.replied = true;
    data.repliedAt = new Date();
    data.read = true;
  }

  const updated = await prisma.contactMessage.update({
    where: { id },
    data,
  });

  return NextResponse.json(updated);
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await prisma.contactMessage.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
