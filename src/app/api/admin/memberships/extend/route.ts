import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { sendEmail, drcEmailTemplate } from "@/lib/email";

export async function POST(req: Request) {
  const { membershipId, days } = await req.json();

  if (!membershipId || !days || days < 1) {
    return NextResponse.json({ error: "Membership ID and days are required" }, { status: 400 });
  }

  const membership = await prisma.membership.findUnique({
    where: { id: membershipId },
    include: {
      plan: true,
      users: { select: { id: true, name: true, email: true } },
    },
  });

  if (!membership) {
    return NextResponse.json({ error: "Membership not found" }, { status: 404 });
  }

  const baseDate = membership.status === "active" && membership.endDate && new Date(membership.endDate) > new Date()
    ? new Date(membership.endDate)
    : new Date();

  const newEndDate = new Date(baseDate);
  newEndDate.setDate(newEndDate.getDate() + days);

  const updated = await prisma.membership.update({
    where: { id: membershipId },
    data: {
      status: "active",
      endDate: newEndDate,
      ...(membership.status !== "active" ? { startDate: new Date() } : {}),
    },
  });

  const user = membership.users[0];
  if (user?.email) {
    try {
      await sendEmail({
        to: user.email,
        subject: "DRC Membership Extended!",
        html: drcEmailTemplate({
          title: "Membership Extended!",
          body: `
            <p style="color: #F1E9DD; font-size: 15px;">Hi ${user.name || "Rider"},</p>
            <p style="color: #B9A886; font-size: 14px;">Your <strong style="color: #E8622C;">${membership.plan.name}</strong> membership has been extended!</p>
            <div style="background: #0D0D0D; border: 1px solid #E8622C; border-radius: 4px; padding: 16px; margin: 16px 0; text-align: center;">
              <p style="color: #B9A886; font-size: 13px; margin: 0 0 4px 0;">New Expiry Date</p>
              <p style="color: #F1E9DD; font-size: 18px; font-weight: bold; margin: 0;">${newEndDate.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</p>
            </div>
            <p style="color: #B9A886; font-size: 14px;">Keep riding, keep exploring!</p>
          `,
          ctaText: "View Membership",
          ctaUrl: "https://www.dirtridecamp.com/membership",
        }),
      });
    } catch (error) {
      console.error("[EMAIL] Extend membership email failed:", error instanceof Error ? error.message : String(error));
    }
  }

  return NextResponse.json({ membership: updated, newEndDate });
}
