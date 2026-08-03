import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const userId = (session.user as { id: string }).id;

  const registrations = await prisma.registration.findMany({
    where: {
      userId,
      status: "confirmed",
      paymentStatus: "paid",
      ride: { photosPublished: true },
    },
    select: {
      ride: {
        select: {
          id: true,
          title: true,
          startDate: true,
          coverImage: true,
          photosLink: true,
          whatsappGroupLink: true,
        },
      },
    },
    orderBy: { ride: { startDate: "desc" } },
  });

  const rides = registrations.map((r) => r.ride);
  return NextResponse.json(rides);
}
