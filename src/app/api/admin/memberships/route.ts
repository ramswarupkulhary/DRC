import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { sendEmail, drcEmailTemplate } from "@/lib/email";

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

    try {
      await sendEmail({
        to: userEmail,
        subject: "DRC Membership Application - Status Update",
        html: drcEmailTemplate({
          title: "Membership Application Status",
          body: `
            <p style="color: #F1E9DD;">Hi ${userName},</p>
            <p style="color: #F1E9DD;">Unfortunately, your DRC Membership application has been rejected.</p>
            ${rejectionNote ? `<p style="color: #F1E9DD;"><strong>Reason:</strong> ${rejectionNote}</p>` : ""}
            <p style="color: #888888;">If you have any questions, please contact us at info@dirtridecamp.com</p>
          `,
        }),
      });
    } catch (error) {
      console.error(`[EMAIL] ❌ Failed:`, error instanceof Error ? error.message : String(error));
    }
  }

  if (status === "active" && membership.users[0]?.email) {
    const userEmail = membership.users[0].email;
    const userName = membership.users[0].name || "User";

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

    try {
      await sendEmail({
        to: userEmail,
        subject: "Welcome to DRC Membership!",
        html: drcEmailTemplate({
          title: "Welcome to DRC Membership!",
          body: `
            <p style="color: #F1E9DD;">Hi ${userName},</p>
            <p style="color: #F1E9DD;">Your DRC Membership application has been approved! Welcome to the tribe.</p>
            <p style="color: #F1E9DD;">Your welcome kit will be dispatched within 7 working days.</p>
          `,
        }),
      });
    } catch (error) {
      console.error(`[EMAIL] ❌ Failed:`, error instanceof Error ? error.message : String(error));
    }
  }

  return NextResponse.json({ membership });
}
