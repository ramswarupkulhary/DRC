import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import sgMail from "@sendgrid/mail";

sgMail.setApiKey(process.env.SENDGRID_API_KEY || "");

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

  if (status === "rejected" && membership.users[0]?.email) {
    const userEmail = membership.users[0].email;
    const userName = membership.users[0].name || "User";

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

    // Send email via SendGrid
    try {
      console.log(`Sending rejection email to ${userEmail} via SendGrid`);
      await sgMail.send({
        to: userEmail,
        from: process.env.SENDGRID_FROM_EMAIL || "info@dirtridecamp.com",
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
      console.log(`✅ Rejection email sent successfully to ${userEmail}`);
    } catch (error) {
      console.error("❌ SendGrid error (rejection):", error);
    }
  }

  if (status === "active" && membership.users[0]?.email) {
    const userEmail = membership.users[0].email;
    const userName = membership.users[0].name || "User";

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

    // Send email via SendGrid
    try {
      console.log(`Sending approval email to ${userEmail} via SendGrid`);
      await sgMail.send({
        to: userEmail,
        from: process.env.SENDGRID_FROM_EMAIL || "info@dirtridecamp.com",
        subject: "Welcome to DRC Membership!",
        html: `
          <h2>Welcome to DRC Membership</h2>
          <p>Hi ${userName},</p>
          <p>Your DRC Membership application has been approved! Welcome to the tribe.</p>
          <p>Your welcome kit will be dispatched within 7 working days.</p>
          <p>Best regards,<br>DRC Team</p>
        `,
      });
      console.log(`✅ Approval email sent successfully to ${userEmail}`);
    } catch (error) {
      console.error("❌ SendGrid error (approval):", error);
    }
  }

  return NextResponse.json({ membership });
}

