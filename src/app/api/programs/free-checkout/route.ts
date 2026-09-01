import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { computeProgramPrice, FAMILY_PACKAGES, type FamilyOption } from "@/lib/programs";
import { getProgramBySlug } from "@/lib/programsDb";
import { applyCoupon } from "@/lib/pricing";
import { notifyRider } from "@/lib/notify";

/** Completes a program booking with no payment when a coupon makes it free (₹0). */
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as { id: string }).id;
  const { programSlug, friends, familyOption, lunch, couponCode } = await req.json();

  const program = await getProgramBySlug(programSlug);
  if (!program) return NextResponse.json({ error: "Invalid program" }, { status: 400 });

  const normalizedFamily: FamilyOption | null =
    familyOption && FAMILY_PACKAGES[familyOption as FamilyOption] ? (familyOption as FamilyOption) : null;
  const normalizedFriends = program.supportsCompanions ? Math.max(0, Math.floor(Number(friends) || 0)) : 0;

  const baseAmount = computeProgramPrice(program, { friends: normalizedFriends, familyOption: normalizedFamily, lunch: !!lunch });
  const quote = await applyCoupon(baseAmount, couponCode);
  if (quote.error) return NextResponse.json({ error: quote.error }, { status: 400 });

  if (quote.finalAmount !== 0) {
    return NextResponse.json({ error: "Payment is required for this booking." }, { status: 400 });
  }

  try {
    const booking = await prisma.programBooking.create({
      data: {
        userId,
        programSlug: program.slug,
        programName: program.name,
        friends: normalizedFriends,
        familyOption: normalizedFamily,
        lunch: !!lunch,
        amount: 0,
        status: "awaiting_approval",
        paymentStatus: "paid",
        paymentId: `coupon:${quote.coupon?.code || "FREE"}`,
      },
    });

    if (quote.coupon) {
      await prisma.coupon.update({ where: { id: quote.coupon.id }, data: { usedCount: { increment: 1 } } }).catch(() => {});
    }

    const admins = await prisma.user.findMany({ where: { role: "admin" }, select: { id: true } });
    await Promise.all(
      admins.map((admin) =>
        prisma.notification.create({
          data: {
            userId: admin.id,
            type: "booking",
            title: "New Program Booking",
            message: `${session.user?.name || "A rider"} booked ${program.name} (free coupon) — awaiting approval`,
            link: "/admin/program-bookings",
          },
        })
      )
    );

    await notifyRider({
      userId,
      title: "Booking Received",
      message: `Your ${program.name} booking is confirmed and awaiting admin approval.`,
      type: "booking",
      link: "/my-programs",
      email: true,
      push: true,
    });

    return NextResponse.json({ success: true, bookingId: booking.id });
  } catch {
    return NextResponse.json({ error: "Failed to record booking" }, { status: 500 });
  }
}
