import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as { role?: string }).role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const { action, rejectionNote } = await req.json();

  const booking = await prisma.programBooking.findUnique({ where: { id } });
  if (!booking) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }

  const status = action === "approve" ? "approved" : action === "reject" ? "rejected" : null;
  if (!status) {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }

  await prisma.programBooking.update({
    where: { id },
    data: { status, rejectionNote: status === "rejected" ? rejectionNote || null : null },
  });

  await prisma.notification.create({
    data: {
      userId: booking.userId,
      type: "booking",
      title: status === "approved" ? "Booking Approved" : "Booking Update",
      message:
        status === "approved"
          ? `You're confirmed for ${booking.programName}. See you on the trail!`
          : `Your ${booking.programName} booking was not approved. ${rejectionNote || "Our team will contact you."}`,
      link: "/my-programs",
    },
  });

  return NextResponse.json({ success: true });
}
