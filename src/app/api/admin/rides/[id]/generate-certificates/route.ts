import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendEmail, drcEmailTemplate } from "@/lib/email";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as { role?: string }).role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const ride = await prisma.ride.findUnique({
    where: { id },
    include: {
      registrations: {
        where: { status: { in: ["confirmed", "checked_in"] } },
        include: { user: { select: { id: true, name: true, email: true } } },
      },
    },
  });

  if (!ride) return NextResponse.json({ error: "Ride not found" }, { status: 404 });

  let generated = 0;

  for (const reg of ride.registrations) {
    const existing = await prisma.certificate.findFirst({
      where: { userId: reg.user.id, rideId: ride.id },
    });
    if (existing) continue;

    const certNumber = `DRC-R-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

    await prisma.certificate.create({
      data: {
        userId: reg.user.id,
        rideId: ride.id,
        title: `${ride.title} — Ride Completion`,
        type: "ride_completion",
        certNumber,
      },
    });

    await prisma.notification.create({
      data: {
        userId: reg.user.id,
        type: "certificate",
        title: "Certificate Earned!",
        message: `You earned a completion certificate for ${ride.title}!`,
        link: "/certificates",
      },
    });

    try {
      await sendEmail({
        to: reg.user.email,
        subject: `🏆 Certificate Earned — ${ride.title}`,
        html: drcEmailTemplate({
          title: "Ride Completion Certificate",
          body: `
            <p style="color: #F1E9DD; font-size: 15px;">Hi ${reg.user.name || "Rider"},</p>
            <p style="color: #B9A886; font-size: 14px;">Congratulations! You've earned a completion certificate for <strong style="color: #E8622C;">${ride.title}</strong>.</p>
            <div style="background: #0D0D0D; border: 1px solid #E8622C; border-radius: 4px; padding: 16px; margin: 16px 0; text-align: center;">
              <p style="color: #F1E9DD; font-size: 18px; margin: 0; font-weight: bold;">Certificate #${certNumber}</p>
            </div>
            <p style="color: #B9A886; font-size: 14px;">View all your certificates in your dashboard. Keep riding and keep earning!</p>
          `,
          ctaText: "View Certificates",
          ctaUrl: "https://www.dirtridecamp.com/certificates",
        }),
      });
    } catch (err) {
      console.error(`[CERT] Email failed for ${reg.user.email}:`, err);
    }

    generated++;
  }

  return NextResponse.json({ success: true, certificatesGenerated: generated });
}
