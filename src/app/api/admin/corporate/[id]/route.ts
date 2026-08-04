import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendEmail, drcEmailTemplate } from "@/lib/email";
import { slugify } from "@/lib/utils";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as { role?: string }).role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { id } = await params;
  const body = await req.json();

  const data: Record<string, unknown> = {};
  if (body.status) data.status = body.status;
  if (body.notes !== undefined) data.notes = body.notes;

  const inquiry = await prisma.corporateInquiry.update({
    where: { id },
    data,
  });

  if (body.sendEmail && body.emailBody) {
    try {
      await sendEmail({
        to: inquiry.email,
        subject: body.emailSubject || `DRC Corporate — ${inquiry.companyName}`,
        html: drcEmailTemplate({
          title: body.emailSubject || "Corporate Event Update",
          body: `
            <p style="color: #F1E9DD; font-size: 15px;">Hi ${inquiry.contactName},</p>
            <p style="color: #B9A886; font-size: 14px; white-space: pre-wrap;">${body.emailBody}</p>
          `,
          ctaText: "Visit DRC",
          ctaUrl: "https://www.dirtridecamp.com/corporate",
        }),
      });
    } catch (err) {
      console.error("[CORPORATE] Email failed:", err);
    }
  }

  return NextResponse.json(inquiry);
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as { role?: string }).role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { id } = await params;
  const inquiry = await prisma.corporateInquiry.findUnique({ where: { id } });
  if (!inquiry) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const title = `${inquiry.companyName} — Corporate ${inquiry.eventType}`;
  let slug = slugify(title);
  const existing = await prisma.ride.findUnique({ where: { slug } });
  if (existing) slug = `${slug}-${Date.now()}`;

  const ride = await prisma.ride.create({
    data: {
      title,
      slug,
      description: inquiry.requirements || `Corporate ${inquiry.eventType} for ${inquiry.companyName}`,
      location: "TBD",
      startDate: inquiry.preferredDate ? new Date(inquiry.preferredDate) : new Date(),
      endDate: inquiry.preferredDate ? new Date(inquiry.preferredDate) : new Date(),
      price: 0,
      totalSlots: inquiry.groupSize,
      type: "ride",
      status: "draft",
    },
  });

  await prisma.corporateInquiry.update({
    where: { id },
    data: { status: "confirmed", notes: `Ride created: ${ride.id}` },
  });

  return NextResponse.json({ ride });
}
