import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { sendEmail, drcEmailTemplate } from "@/lib/email";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as { role?: string }).role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { email, name, phone, planId, durationType, customDays } = await req.json();

  if (!email || !name || !planId || !durationType) {
    return NextResponse.json({ error: "Email, name, plan, and duration type are required" }, { status: 400 });
  }

  const plan = await prisma.membershipPlan.findUnique({ where: { id: planId } });
  if (!plan) return NextResponse.json({ error: "Plan not found" }, { status: 404 });

  let user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    user = await prisma.user.create({
      data: { name, email, phone: phone || null, role: "rider" },
    });
  }

  if (user.membershipId) {
    const existing = await prisma.membership.findUnique({ where: { id: user.membershipId } });
    if (existing && (existing.status === "active" || existing.status === "pending")) {
      return NextResponse.json({ error: "This user already has an active or pending membership" }, { status: 400 });
    }
  }

  const durationDays: Record<string, number> = {
    "1day": 1,
    "1month": 30,
    "1year": 365,
    "lifetime": 36500,
  };
  const days = durationType === "custom" ? (customDays || plan.duration) : (durationDays[durationType] || plan.duration);

  const endDate = new Date();
  endDate.setDate(endDate.getDate() + days);

  const membership = await prisma.membership.create({
    data: {
      planId,
      status: "active",
      startDate: new Date(),
      endDate,
      users: { connect: { id: user.id } },
    },
  });

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://www.dirtridecamp.com";
  const hasAccount = !!user.passwordHash;

  try {
    await sendEmail({
      to: email,
      subject: "Welcome to DRC Membership!",
      html: drcEmailTemplate({
        title: "DRC Membership Activated!",
        body: `
          <p style="color: #F1E9DD;">Hi ${name},</p>
          <p style="color: #F1E9DD;">You have been granted a <strong>${plan.name}</strong> membership by the DRC team.</p>
          <p style="color: #F1E9DD;">Your membership is active until <strong>${endDate.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</strong>.</p>
          ${!hasAccount ? `<p style="color: #888888;">Create your DRC account to access your membership benefits.</p>` : ""}
        `,
        ctaText: hasAccount ? "View My Membership" : "Create Your Account",
        ctaUrl: hasAccount ? `${baseUrl}/membership` : `${baseUrl}/signup`,
      }),
    });
  } catch (error) {
    console.error("[EMAIL] Membership assign email failed:", error instanceof Error ? error.message : String(error));
  }

  return NextResponse.json({ membership, userId: user.id }, { status: 201 });
}
