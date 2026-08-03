import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  let plans = await prisma.membershipPlan.findMany({
    where: { active: true },
    select: { id: true, name: true, duration: true, price: true },
    orderBy: { price: "asc" },
  });

  if (plans.length === 0) {
    const created = await prisma.membershipPlan.create({
      data: {
        name: "DRC Membership",
        slug: "drc-membership",
        tier: "drc",
        price: 999,
        duration: 365,
        description: "Annual DRC membership with welcome kit",
        benefits: JSON.stringify([
          "Welcome Kit with DRC T-Shirt",
          "Priority Ride Booking",
          "Member-only Rides & Events",
          "Exclusive Discounts on Merchandise",
        ]),
        upiId: "ramswarup.kulhary@ybl",
      },
    });
    plans = [{ id: created.id, name: created.name, duration: created.duration, price: created.price }];
  }

  return NextResponse.json({ plans });
}
