import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getRazorpaySecret } from "@/lib/razorpay";
import { getProgram, computeProgramPrice, FAMILY_PACKAGES, type FamilyOption } from "@/lib/programs";
import crypto from "crypto";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    programSlug,
    friends,
    familyOption,
    lunch,
  } = await req.json();

  const secret = await getRazorpaySecret();
  if (!secret) {
    return NextResponse.json({ error: "Razorpay not configured" }, { status: 500 });
  }

  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest("hex");

  if (expectedSignature !== razorpay_signature) {
    return NextResponse.json({ error: "Invalid payment signature" }, { status: 400 });
  }

  const program = getProgram(programSlug);
  if (!program) {
    return NextResponse.json({ error: "Invalid program" }, { status: 400 });
  }

  const userId = (session.user as { id: string }).id;
  const normalizedFamily: FamilyOption | null =
    familyOption && FAMILY_PACKAGES[familyOption as FamilyOption] ? (familyOption as FamilyOption) : null;
  const normalizedFriends = program.supportsCompanions ? Math.max(0, Math.floor(Number(friends) || 0)) : 0;

  const amount = computeProgramPrice(program, {
    friends: normalizedFriends,
    familyOption: normalizedFamily,
    lunch: !!lunch,
  });

  try {
    const booking = await prisma.programBooking.create({
      data: {
        userId,
        programSlug: program.slug,
        programName: program.name,
        friends: normalizedFriends,
        familyOption: normalizedFamily,
        lunch: !!lunch,
        amount,
        status: "awaiting_approval",
        paymentStatus: "paid",
        paymentId: razorpay_payment_id,
      },
    });

    const admins = await prisma.user.findMany({ where: { role: "admin" }, select: { id: true } });
    await Promise.all(
      admins.map((admin) =>
        prisma.notification.create({
          data: {
            userId: admin.id,
            type: "booking",
            title: "New Program Booking",
            message: `${session.user?.name || "A rider"} paid for ${program.name} — awaiting your approval`,
            link: "/admin/program-bookings",
          },
        })
      )
    );

    await prisma.notification.create({
      data: {
        userId,
        title: "Booking Received",
        message: `Your ${program.name} booking is confirmed and awaiting admin approval.`,
        type: "booking",
        link: "/my-programs",
      },
    });

    return NextResponse.json({ success: true, bookingId: booking.id });
  } catch {
    return NextResponse.json({ error: "Failed to record booking" }, { status: 500 });
  }
}
