import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { sendEmail, drcEmailTemplate } from "@/lib/email";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { escapePassText } from "@/lib/spectatorPass";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const role = (session?.user as { role?: string } | undefined)?.role;
  if (!session?.user || !["admin", "coordinator"].includes(role || "")) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { rideId, eventId, riderIds, message } = await req.json();

  if ((!rideId && !eventId) || (rideId && eventId) || !Array.isArray(riderIds) || !riderIds.length || riderIds.some((id) => typeof id !== "string")) {
    return NextResponse.json({ error: "Select one ride or event and at least one rider." }, { status: 400 });
  }

  const event = eventId ? await prisma.event.findUnique({ where: { id: eventId } }) : null;
  const ride = eventId ? event && { ...event, startDate: event.date, state: "" } : await prisma.ride.findUnique({ where: { id: rideId } });
  if (!ride) {
    return NextResponse.json({ error: "Ride or event not found" }, { status: 404 });
  }

  const riders = await prisma.user.findMany({
    where: { id: { in: riderIds } },
    select: { id: true, name: true, email: true },
  });

  const dateStr = ride.startDate
    ? new Date(ride.startDate).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })
    : "";

  const kind = eventId ? "Event" : "Ride";
  const destination = `${eventId ? "/events" : "/rides"}/${ride.slug}`;
  const notificationMessage = typeof message === "string" && message.trim() ? message.trim() : `New ${kind.toLowerCase()} posted: "${ride.title}"${dateStr ? ` on ${dateStr}` : ""} at ${ride.location}. Book your slot now!`;

  let sent = 0;
  for (const rider of riders) {
    try {
      await prisma.notification.create({
        data: {
          userId: rider.id,
          type: kind.toLowerCase(),
          title: `New ${kind}: ${ride.title}`,
          message: notificationMessage,
          link: destination,
        },
      });

      await sendEmail({
        to: rider.email,
        subject: `New ${kind} Alert — ${ride.title}`,
        html: drcEmailTemplate({
          title: `New ${kind}: ${escapePassText(ride.title)}`,
          body: `
            <p style="color: #F1E9DD; font-size: 15px;">Hi ${escapePassText(rider.name || "Rider")},</p>
            <p style="color: #B9A886; font-size: 14px;">${escapePassText(notificationMessage)}</p>
            ${dateStr ? `<p style="color: #B9A886; font-size: 14px;"><strong style="color: #F1E9DD;">Date:</strong> ${dateStr}</p>` : ""}
            <p style="color: #B9A886; font-size: 14px;"><strong style="color: #F1E9DD;">Location:</strong> ${ride.location}, ${ride.state || ""}</p>
            ${ride.price ? `<p style="color: #B9A886; font-size: 14px;"><strong style="color: #F1E9DD;">Price:</strong> ₹${ride.price.toLocaleString("en-IN")}</p>` : ""}
            <p style="color: #B9A886; font-size: 14px;">Slots are limited — book now before it fills up!</p>
          `,
          ctaText: `View ${kind} & Book`,
          ctaUrl: `${process.env.NEXT_PUBLIC_BASE_URL || "https://www.dirtridecamp.com"}${destination}`,
        }),
      });

      sent++;
    } catch (err) {
      console.error(`[NOTIFY] Failed for ${rider.email}:`, err);
    }
  }

  return NextResponse.json({ success: true, sent, total: riders.length });
}
