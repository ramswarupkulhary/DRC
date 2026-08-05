import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendEmail, drcEmailTemplate } from "@/lib/email";

export async function POST(req: Request) {
  const { authorization } = Object.fromEntries(req.headers);
  const body = await req.json().catch(() => ({}));
  const secret = body.secret || authorization?.replace("Bearer ", "");
  if (secret !== process.env.CRON_SECRET && secret !== process.env.NEXTAUTH_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const windows = [
    { hours: 24, label: "24 hours" },
    { hours: 12, label: "12 hours" },
    { hours: 2, label: "2 hours" },
  ];

  let totalSent = 0;

  for (const window of windows) {
    const windowStart = new Date(now.getTime() + (window.hours - 0.5) * 60 * 60 * 1000);
    const windowEnd = new Date(now.getTime() + (window.hours + 0.5) * 60 * 60 * 1000);

    const upcomingRides = await prisma.ride.findMany({
      where: {
        status: "published",
        startDate: { gte: windowStart, lte: windowEnd },
      },
      include: {
        registrations: {
          where: { status: { in: ["confirmed", "checked_in"] } },
          include: { user: { select: { id: true, email: true, name: true } } },
        },
      },
    });

    for (const ride of upcomingRides) {
      const rideDate = ride.startDate!.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" });
      const rideTime = ride.startTime || "as scheduled";

      for (const reg of ride.registrations) {
        const existingNotif = await prisma.notification.findFirst({
          where: {
            userId: reg.user.id,
            type: "reminder",
            title: { contains: window.label },
            link: { contains: ride.id },
            createdAt: { gte: new Date(now.getTime() - 60 * 60 * 1000) },
          },
        });
        if (existingNotif) continue;

        await prisma.notification.create({
          data: {
            userId: reg.user.id,
            type: "reminder",
            title: `Ride in ${window.label}!`,
            message: `${ride.title} starts in ${window.label}. Location: ${ride.location}. Time: ${rideTime}`,
            link: `/rides/${ride.slug}`,
          },
        });

        try {
          await sendEmail({
            to: reg.user.email,
            subject: `⏰ ${ride.title} starts in ${window.label}!`,
            html: drcEmailTemplate({
              title: `Ride Reminder — ${window.label} to go!`,
              body: `
                <p style="color: #F1E9DD; font-size: 15px;">Hi ${reg.user.name || "Rider"},</p>
                <p style="color: #B9A886; font-size: 14px;">Your ride <strong style="color: #E8622C;">${ride.title}</strong> starts in <strong>${window.label}</strong>!</p>
                <div style="background: #0D0D0D; border: 1px solid #E8622C; border-radius: 4px; padding: 16px; margin: 16px 0;">
                  <p style="color: #F1E9DD; font-size: 14px; margin: 0 0 8px;">📍 <strong>${ride.location}</strong></p>
                  <p style="color: #F1E9DD; font-size: 14px; margin: 0 0 8px;">📅 <strong>${rideDate}</strong></p>
                  <p style="color: #F1E9DD; font-size: 14px; margin: 0;">⏰ <strong>${rideTime}</strong></p>
                  ${ride.startPoint ? `<p style="color: #F1E9DD; font-size: 14px; margin: 8px 0 0;">📌 Start Point: <strong>${ride.startPoint}</strong></p>` : ""}
                </div>
                <p style="color: #B9A886; font-size: 14px;">Make sure your bike is ready and your gear is packed. See you on the trail!</p>
              `,
              ctaText: "View Ride Details",
              ctaUrl: `https://www.dirtridecamp.com/rides/${ride.slug}`,
            }),
          });
        } catch (err) {
          console.error(`[REMINDER] Email failed for ${reg.user.email}:`, err);
        }
        totalSent++;
      }
    }
  }

  return NextResponse.json({ success: true, remindersSent: totalSent });
}
