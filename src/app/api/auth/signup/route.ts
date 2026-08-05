import { prisma } from "@/lib/prisma";
import { hashSync } from "bcryptjs";
import { NextResponse } from "next/server";
import { sendEmail, drcEmailTemplate } from "@/lib/email";

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://www.dirtridecamp.com";

async function sendWelcomeEmail(name: string, email: string) {
  try {
    await sendEmail({
      to: email,
      subject: "Welcome to Dirt Ride Camp! 🏍️",
      html: drcEmailTemplate({
        title: "Welcome to DRC!",
        body: `
          <p style="color: #F1E9DD; font-size: 15px;">Hi ${name},</p>
          <p style="color: #B9A886; font-size: 14px;">Welcome to <strong style="color: #E8622C;">Dirt Ride Camp</strong> — India's community for off-road riders!</p>
          <p style="color: #B9A886; font-size: 14px;">Your account is ready. Here's what you can do:</p>
          <ul style="color: #B9A886; font-size: 14px; padding-left: 20px;">
            <li>Browse and register for upcoming rides & trainings</li>
            <li>Track your riding progress and earn badges</li>
            <li>Connect with fellow dirt riders</li>
          </ul>
          <div style="background: #0D0D0D; border: 1px solid #E8622C; border-radius: 4px; padding: 16px; margin: 20px 0; text-align: center;">
            <p style="color: #F1E9DD; font-size: 14px; margin: 0 0 4px;">Become a DRC Member</p>
            <p style="color: #B9A886; font-size: 13px; margin: 0;">Get a welcome kit, priority booking & exclusive rides — <strong style="color: #E8622C;">₹999/year</strong></p>
          </div>
        `,
        ctaText: "Join DRC Membership",
        ctaUrl: `${baseUrl}/membership`,
      }),
    });
  } catch (err) {
    console.error("[EMAIL] Welcome email failed:", err instanceof Error ? err.message : String(err));
  }
}

async function notifyAdminNewSignup(name: string, email: string) {
  try {
    const admins = await prisma.user.findMany({ where: { role: "admin" }, select: { id: true } });
    for (const admin of admins) {
      await prisma.notification.create({
        data: {
          userId: admin.id,
          type: "system",
          title: "New Rider Signed Up!",
          message: `${name} (${email}) just created an account.`,
          link: "/admin/riders",
        },
      });
    }
  } catch (err) {
    console.error("[ADMIN NOTIF] Signup notification failed:", err);
  }
}

export async function POST(req: Request) {
  try {
    const { name, email, phone, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Name, email, and password are required." }, { status: 400 });
    }

    const existing = await prisma.user.findFirst({
      where: { OR: [{ email }, ...(phone ? [{ phone }] : [])] },
    });

    if (existing) {
      if (existing.email === email && !existing.passwordHash) {
        await prisma.user.update({
          where: { id: existing.id },
          data: {
            name,
            phone: phone || existing.phone,
            passwordHash: hashSync(password, 10),
          },
        });
        sendWelcomeEmail(name, email);
        notifyAdminNewSignup(name, email);
        return NextResponse.json({ id: existing.id, name, email, claimed: true }, { status: 201 });
      }

      return NextResponse.json({ error: "An account with this email or phone already exists." }, { status: 409 });
    }

    const user = await prisma.user.create({
      data: {
        name,
        email,
        phone: phone || null,
        passwordHash: hashSync(password, 10),
        role: "rider",
      },
    });

    sendWelcomeEmail(name, email);
    notifyAdminNewSignup(name, email);

    return NextResponse.json({ id: user.id, name: user.name, email: user.email }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}
