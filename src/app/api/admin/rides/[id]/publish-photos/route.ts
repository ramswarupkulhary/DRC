import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { sendEmail, drcEmailTemplate } from "@/lib/email";

type Props = { params: Promise<{ id: string }> };

export async function POST(_req: Request, { params }: Props) {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as { role?: string }).role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const ride = await prisma.ride.findUnique({
    where: { id },
    include: {
      registrations: {
        where: { status: "confirmed", paymentStatus: "paid" },
        include: { user: { select: { id: true, name: true, email: true } } },
      },
    },
  });

  if (!ride) return NextResponse.json({ error: "Ride not found" }, { status: 404 });
  if (!ride.photosLink) return NextResponse.json({ error: "No photos link set" }, { status: 400 });

  await prisma.ride.update({
    where: { id },
    data: { photosPublished: true, photosPublishedAt: new Date() },
  });

  let emailsSent = 0;

  for (const reg of ride.registrations) {
    const user = reg.user;
    if (!user.email) continue;

    try {
      await sendEmail({
        to: user.email,
        subject: `Photos & Videos: ${ride.title}`,
        html: drcEmailTemplate({
          title: `${ride.title} — Photos & Videos`,
          body: `
            <p style="color: #F1E9DD;">Hi ${user.name || "Rider"},</p>
            <p style="color: #F1E9DD;">The photos and videos from <strong>${ride.title}</strong> are now available!</p>
            <p style="color: #888888;">Click the button below to view them.</p>
          `,
          ctaText: "View Photos & Videos",
          ctaUrl: ride.photosLink!,
        }),
      });
      emailsSent++;
    } catch (error) {
      console.error(`[EMAIL] Failed to send to ${user.email}:`, error instanceof Error ? error.message : String(error));
    }

    await prisma.notification.create({
      data: {
        userId: user.id,
        type: "gallery",
        title: `Photos: ${ride.title}`,
        message: "Photos and videos from the ride are now available!",
        link: ride.photosLink,
      },
    });
  }

  const shareText = encodeURIComponent(`📸 Photos & Videos from ${ride.title} are now available!\n\n${ride.photosLink}`);
  const whatsappShareUrl = `https://wa.me/?text=${shareText}`;

  return NextResponse.json({ success: true, emailsSent, whatsappShareUrl });
}
