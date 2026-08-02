import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

// Create transporter with GoDaddy relay
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

export async function GET() {
  const memberships = await prisma.membership.findMany({
    include: {
      plan: true,
      users: { select: { id: true, name: true, email: true, phone: true, image: true } },
    },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ memberships });
}

export async function PATCH(req: Request) {
  const { id, status, rejectionNote } = await req.json();

  const data: Record<string, unknown> = { status };
  if (rejectionNote) data.rejectionNote = rejectionNote;

  if (status === "active") {
    const membership = await prisma.membership.findUnique({ where: { id }, include: { plan: true } });
    if (membership) {
      data.startDate = new Date();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + membership.plan.duration);
      data.endDate = endDate;
    }
  }

  const membership = await prisma.membership.update({
    where: { id },
    data,
    include: { users: { select: { id: true, name: true, email: true } } },
  });

  const userId = membership.users[0]?.id;

  console.log(`[MEMBERSHIP] Status update: id=${id}, status=${status}, email=${membership.users[0]?.email}`);

  if (status === "rejected" && membership.users[0]?.email) {
    const userEmail = membership.users[0].email;
    const userName = membership.users[0].name || "User";

    console.log(`[EMAIL] Attempting rejection email to: ${userEmail}`);

    // Create in-app notification
    if (userId) {
      await prisma.notification.create({
        data: {
          userId,
          type: "membership",
          title: "Membership Application Rejected",
          message: rejectionNote ? `Your membership application was rejected. Reason: ${rejectionNote}` : "Your membership application has been rejected.",
        },
      });
    }

    // Send email - verify connection works first
    try {
      console.log(`[EMAIL] Verifying SMTP connection...`);
      await transporter.verify();
      console.log(`[EMAIL] ✅ SMTP connection verified`);

      console.log(`[EMAIL] Sending rejection email...`);
      const info = await transporter.sendMail({
        from: "info@dirtridecamp.com",
        to: userEmail,
        subject: "DRC Membership Application - Status Update",
        html: `
          <h2>Membership Application Status</h2>
          <p>Hi ${userName},</p>
          <p>Unfortunately, your DRC Membership application has been rejected.</p>
          ${rejectionNote ? `<p><strong>Reason:</strong> ${rejectionNote}</p>` : ""}
          <p>If you have any questions, please contact us at info@dirtridecamp.com</p>
          <p>Best regards,<br>DRC Team</p>
        `,
      });
      console.log(`[EMAIL] ✅ Rejection email sent. MessageID: ${info.messageId}`);
    } catch (error) {
      console.error(`[EMAIL] ❌ REJECTION EMAIL FAILED:`, error instanceof Error ? error.message : String(error));
    }
  }

  if (status === "active" && membership.users[0]?.email) {
    const userEmail = membership.users[0].email;
    const userName = membership.users[0].name || "User";

    console.log(`[EMAIL] Attempting approval email to: ${userEmail}`);

    // Create in-app notification
    if (userId) {
      await prisma.notification.create({
        data: {
          userId,
          type: "membership",
          title: "Welcome to DRC Membership!",
          message: "Your membership application has been approved! Your welcome kit will be dispatched within 7 working days.",
        },
      });
    }

    // Send email - verify connection works first
    try {
      console.log(`[EMAIL] Verifying SMTP connection...`);
      await transporter.verify();
      console.log(`[EMAIL] ✅ SMTP connection verified`);

      console.log(`[EMAIL] Sending approval email...`);
      const info = await transporter.sendMail({
        from: "info@dirtridecamp.com",
        to: userEmail,
        subject: "Welcome to DRC Membership!",
        html: `
          <h2>Welcome to DRC Membership</h2>
          <p>Hi ${userName},</p>
          <p>Your DRC Membership application has been approved! Welcome to the tribe.</p>
          <p>Your welcome kit will be dispatched within 7 working days.</p>
          <p>Best regards,<br>DRC Team</p>
        `,
      });
      console.log(`[EMAIL] ✅ Approval email sent. MessageID: ${info.messageId}`);
    } catch (error) {
      console.error(`[EMAIL] ❌ APPROVAL EMAIL FAILED:`, error instanceof Error ? error.message : String(error));
    }
  }

  return NextResponse.json({ membership });
}

