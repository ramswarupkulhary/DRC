import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { sendEmail, drcEmailTemplate } from "@/lib/email";

export async function POST(req: Request) {
  const { rideId, riderIds, message } = await req.json();

  if (!rideId || !riderIds?.length) {
    return NextResponse.json({ error: "Ride ID and rider IDs are required" }, { status: 400 });
  }

  const ride = await prisma.ride.findUnique({ where: { id: rideId } });
  if (!ride) {
    return NextResponse.json({ error: "Ride not found" }, { status: 404 });
  }

  const riders = await prisma.user.findMany({
    where: { id: { in: riderIds } },
    select: { id: true, name: true, email: true },
  });

  const dateStr = ride.startDate
    ? new Date(ride.startDate).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })
    : "";

  const notificationMessage = message || `New ride posted: "${ride.title}"${dateStr ? ` on ${dateStr}` : ""} at ${ride.location}. Book your slot now!`;

  let sent = 0;
  for (const rider of riders) {
    try {
      await prisma.notification.create({
        data: {
          userId: rider.id,
          type: "ride",
          title: `New Ride: ${ride.title}`,
          message: notificationMessage,
          link: `/rides/${ride.slug}`,
        },
      });

      await sendEmail({
        to: rider.email,
        subject: `New Ride Alert — ${ride.title}`,
        html: drcEmailTemplate({
          title: `New Ride: ${ride.title}`,
          body: `
            <p style="color: #F1E9DD; font-size: 15px;">Hi ${rider.name || "Rider"},</p>
            <p style="color: #B9A886; font-size: 14px;">${notificationMessage}</p>
            ${dateStr ? `<p style="color: #B9A886; font-size: 14px;"><strong style="color: #F1E9DD;">Date:</strong> ${dateStr}</p>` : ""}
            <p style="color: #B9A886; font-size: 14px;"><strong style="color: #F1E9DD;">Location:</strong> ${ride.location}, ${ride.state || ""}</p>
            ${ride.price ? `<p style="color: #B9A886; font-size: 14px;"><strong style="color: #F1E9DD;">Price:</strong> ₹${ride.price.toLocaleString("en-IN")}</p>` : ""}
            <p style="color: #B9A886; font-size: 14px;">Slots are limited — book now before it fills up!</p>
          `,
          ctaText: "View Ride & Book",
          ctaUrl: `https://www.dirtridecamp.com/rides/${ride.slug}`,
        }),
      });

      sent++;
    } catch (err) {
      console.error(`[NOTIFY] Failed for ${rider.email}:`, err);
    }
  }

  return NextResponse.json({ success: true, sent, total: riders.length });
}
