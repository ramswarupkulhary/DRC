import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const { rideId, trainingId } = await req.json();

  if (!rideId && !trainingId) {
    return NextResponse.json({ error: "Must specify a ride or training" }, { status: 400 });
  }

  let amount = 0;
  let totalSlots = 0;

  if (rideId) {
    const ride = await prisma.ride.findUnique({
      where: { id: rideId },
      include: { registrations: { where: { status: { not: "cancelled" } } } },
    });
    if (!ride) return NextResponse.json({ error: "Ride not found" }, { status: 404 });
    if (ride.status !== "published") return NextResponse.json({ error: "Ride is not available" }, { status: 400 });

    const existing = await prisma.registration.findFirst({
      where: { userId: user.id, rideId, status: { not: "cancelled" } },
    });
    if (existing) return NextResponse.json({ error: "You are already registered for this ride" }, { status: 409 });

    amount = ride.price;
    totalSlots = ride.totalSlots;
    const bookedSlots = ride.registrations.length;

    if (bookedSlots >= totalSlots) {
      return NextResponse.json({ error: "This ride is sold out" }, { status: 400 });
    }
  }

  if (trainingId) {
    const training = await prisma.training.findUnique({ where: { id: trainingId } });
    if (!training) return NextResponse.json({ error: "Training not found" }, { status: 404 });
    if (training.status !== "published") return NextResponse.json({ error: "Training is not available" }, { status: 400 });

    const existing = await prisma.registration.findFirst({
      where: { userId: user.id, trainingId, status: { not: "cancelled" } },
    });
    if (existing) return NextResponse.json({ error: "You are already registered for this training" }, { status: 409 });

    amount = training.price;
  }

  const registration = await prisma.registration.create({
    data: {
      userId: user.id,
      rideId: rideId || null,
      trainingId: trainingId || null,
      amount,
      status: "pending",
      paymentStatus: "unpaid",
    },
  });

  return NextResponse.json({ registration }, { status: 201 });
}
