import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { sendEmail, drcEmailTemplate } from "@/lib/email";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as { role?: string }).role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { rideId, name, email, phone } = await req.json();

  if (!rideId || !name || !email) {
    return NextResponse.json({ error: "Ride, name, and email are required" }, { status: 400 });
  }

  const ride = await prisma.ride.findUnique({ where: { id: rideId } });
  if (!ride) return NextResponse.json({ error: "Ride not found" }, { status: 404 });

  let user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    user = await prisma.user.create({
      data: {
        name,
        email,
        phone: phone || null,
        role: "rider",
      },
    });
  }

  const existing = await prisma.registration.findFirst({
    where: { userId: user.id, rideId, status: { not: "cancelled" } },
  });
  if (existing) {
    return NextResponse.json({ error: "This rider is already registered for this ride" }, { status: 409 });
  }

  const registration = await prisma.registration.create({
    data: {
      userId: user.id,
      rideId,
      amount: ride.price,
      status: "confirmed",
      paymentStatus: "paid",
    },
  });

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://www.dirtridecamp.com";
  const hasAccount = !!user.passwordHash;

  try {
    await sendEmail({
      to: email,
      subject: `You're in! ${ride.title} — Ride Confirmed`,
      html: drcEmailTemplate({
        title: "Ride Registration Confirmed!",
        body: `
          <p style="color: #F1E9DD;">Hi ${name},</p>
          <p style="color: #F1E9DD;">You have been registered for <strong>${ride.title}</strong> by the DRC team.</p>
          <p style="color: #F1E9DD;">📍 ${ride.location}</p>
          <p style="color: #F1E9DD;">📅 ${ride.startDate.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</p>
          ${!hasAccount ? `<p style="color: #888888;">Create your DRC account to view your registrations, ride photos, and more.</p>` : `<p style="color: #888888;">Log in to your DRC account to view this registration.</p>`}
        `,
        ctaText: hasAccount ? "View My Registrations" : "Create Your Account",
        ctaUrl: hasAccount ? `${baseUrl}/my-registrations` : `${baseUrl}/signup`,
      }),
    });
  } catch (error) {
    console.error("[EMAIL] Manual registration email failed:", error instanceof Error ? error.message : String(error));
  }

  return NextResponse.json({ registration, userId: user.id }, { status: 201 });
}
