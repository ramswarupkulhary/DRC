import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { spectatorPassDownloadUrl } from "@/lib/spectatorPass";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const [registrations, eventRegistrations, programs] = await Promise.all([prisma.registration.findMany({
    where: { userId: user.id, deletedAt: null },
    orderBy: { createdAt: "desc" },
    include: {
      ride: { select: { id: true, title: true, slug: true, location: true, startDate: true, whatsappGroupLink: true, photosLink: true, photosPublished: true } },
      training: { select: { title: true, slug: true, location: true } },
    },
  }), prisma.eventRegistration.findMany({
    where: { userId: user.id, deletedAt: null, paymentStatus: { in: ["paid", "refunded", "refund_pending"] } },
    orderBy: { createdAt: "desc" },
  }), prisma.programBooking.findMany({
    where: { userId: user.id, deletedAt: null },
    orderBy: { createdAt: "desc" },
    include: { companions: true },
  })]);

  const events = await prisma.event.findMany({
    where: { slug: { in: [...new Set(eventRegistrations.map((registration) => registration.eventSlug))] } },
    select: { slug: true, title: true, date: true, location: true },
  });
  const eventBySlug = new Map(events.map((event) => [event.slug, event]));
  const combined = [
    ...registrations.map((registration) => ({
      ...registration,
      kind: registration.ride ? "ride" : "training",
      title: registration.ride?.title || registration.training?.title || "Registration",
      href: registration.ride ? `/rides/${registration.ride.slug}` : `/trainings/${registration.training?.slug}`,
      location: registration.ride?.location || registration.training?.location,
      date: registration.ride?.startDate,
    })),
    ...eventRegistrations.map((registration) => {
      const event = eventBySlug.get(registration.eventSlug);
      return {
        id: registration.id,
        kind: registration.registrationType === "spectator" ? "spectator" : "event",
        title: event?.title || registration.eventSlug,
        href: `/events/${registration.eventSlug}`,
        location: event?.location,
        date: event?.date,
        categoryName: registration.categoryName,
        status: registration.status === "cancelled" || registration.paymentStatus === "cancelled" ? "cancelled" : registration.paymentStatus === "paid" ? "confirmed" : "pending",
        paymentStatus: registration.paymentStatus,
        refundId: registration.refundId,
        refundStatus: registration.refundStatus,
        amount: registration.amount,
        createdAt: registration.createdAt,
        passUrl: registration.status === "active" && registration.registrationType === "spectator" && registration.paymentStatus === "paid" && registration.eventSlug === "drc-ultimate-rider"
          ? spectatorPassDownloadUrl(registration.id) : null,
      };
    }),
    ...programs.map((booking) => ({
      ...booking,
      kind: "program",
      title: booking.programName,
      href: `/programs#${booking.programSlug}`,
      program: booking,
    })),
  ].sort((first, second) => second.createdAt.getTime() - first.createdAt.getTime());

  return NextResponse.json({ registrations: combined }, { headers: { "Cache-Control": "private, no-store" } });
}
