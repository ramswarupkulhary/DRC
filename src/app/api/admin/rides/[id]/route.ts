import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { slugify } from "@/lib/utils";
import { sendEmail, drcEmailTemplate } from "@/lib/email";

type Props = { params: Promise<{ id: string }> };

export async function PUT(req: Request, { params }: Props) {
  const { id } = await params;
  const body = await req.json();

  const inclusions = body.inclusions
    ? JSON.stringify(body.inclusions.split("\n").map((s: string) => s.trim()).filter(Boolean))
    : null;

  const ride = await prisma.ride.update({
    where: { id },
    data: {
      title: body.title,
      slug: slugify(body.title),
      description: body.description,
      shortDesc: body.shortDesc,
      location: body.location,
      state: body.state,
      startDate: new Date(body.startDate),
      endDate: new Date(body.endDate),
      startPoint: body.startPoint,
      startTime: body.startTime,
      price: body.price,
      totalSlots: body.totalSlots,
      difficulty: body.difficulty,
      type: body.type,
      status: body.status,
      featured: body.featured || false,
      inclusions,
      coverImage: body.coverImage || null,
      images: body.images || null,
      memberDiscount: body.memberDiscount ?? 0,
      earlyBirdPrice: body.earlyBirdPrice ? parseInt(body.earlyBirdPrice) : null,
      earlyBirdDeadline: body.earlyBirdDeadline ? new Date(body.earlyBirdDeadline) : null,
      whatsappGroupLink: body.whatsappGroupLink || null,
      photosLink: body.photosLink || null,
    },
  });

  return NextResponse.json({ ride });
}

export async function PATCH(req: Request, { params }: Props) {
  const { id } = await params;
  const body = await req.json();

  const data: Record<string, unknown> = {};
  if (body.whatsappGroupLink !== undefined) data.whatsappGroupLink = body.whatsappGroupLink || null;
  if (body.photosLink !== undefined) data.photosLink = body.photosLink || null;
  if (body.status !== undefined) data.status = body.status;
  if (body.memberDiscount !== undefined) data.memberDiscount = body.memberDiscount;

  const ride = await prisma.ride.update({ where: { id }, data });
  return NextResponse.json({ ride });
}

export async function DELETE(_req: Request, { params }: Props) {
  const { id } = await params;

  const ride = await prisma.ride.findUnique({
    where: { id },
    include: {
      registrations: {
        where: { status: { in: ["confirmed", "checked_in"] } },
        include: { user: { select: { email: true, name: true, id: true } } },
      },
    },
  });

  if (!ride) {
    return NextResponse.json({ error: "Ride not found" }, { status: 404 });
  }

  const isFutureRide = ride.startDate ? new Date(ride.startDate) > new Date() : false;

  if (isFutureRide && ride.registrations.length > 0) {
    const dateStr = ride.startDate ? new Date(ride.startDate).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }) : "";
    for (const reg of ride.registrations) {
      try {
        await prisma.notification.create({
          data: {
            userId: reg.user.id,
            type: "registration",
            title: "Ride Cancelled",
            message: `The ride "${ride.title}" on ${dateStr} has been cancelled. We apologize for the inconvenience.`,
            link: "/rides",
          },
        });
        await sendEmail({
          to: reg.user.email,
          subject: `Ride Cancelled — ${ride.title}`,
          html: drcEmailTemplate({
            title: "Ride Cancelled",
            body: `
              <p style="color: #F1E9DD; font-size: 15px;">Hi ${reg.user.name || "Rider"},</p>
              <p style="color: #B9A886; font-size: 14px;">We regret to inform you that the ride <strong style="color: #E8622C;">${ride.title}</strong> scheduled for <strong style="color: #F1E9DD;">${dateStr}</strong> has been cancelled.</p>
              <p style="color: #B9A886; font-size: 14px;">We sincerely apologize for the inconvenience. If you have any questions or need a refund, please reach out to us.</p>
              <p style="color: #B9A886; font-size: 14px;">Check out our other upcoming rides below!</p>
            `,
            ctaText: "Browse Rides",
            ctaUrl: "https://www.dirtridecamp.com/rides",
          }),
        });
      } catch (err) {
        console.error("[EMAIL] Ride cancellation email failed:", err);
      }
    }
  }

  await prisma.registration.deleteMany({ where: { rideId: id } });
  await prisma.review.deleteMany({ where: { rideId: id } });
  await prisma.galleryImage.deleteMany({ where: { rideId: id } });
  await prisma.rideLog.deleteMany({ where: { rideId: id } });
  await prisma.rideJournal.deleteMany({ where: { rideId: id } });
  await prisma.waitlist.deleteMany({ where: { rideId: id } });
  await prisma.survey.deleteMany({ where: { rideId: id } });
  await prisma.ride.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
