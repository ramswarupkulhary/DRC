export const dynamic = "force-dynamic";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import RideForm from "@/components/admin/RideForm";

type Props = { params: Promise<{ id: string }> };

export default async function EditRidePage({ params }: Props) {
  const { id } = await params;
  const ride = await prisma.ride.findUnique({ where: { id } });
  if (!ride) notFound();

  const rideData = {
    ...ride,
    startDate: ride.startDate.toISOString(),
    endDate: ride.endDate.toISOString(),
    memberDiscount: ride.memberDiscount,
    earlyBirdDeadline: ride.earlyBirdDeadline?.toISOString() ?? null,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-bold">Edit Ride</h1>
        <p className="text-muted mt-1">{ride.title}</p>
      </div>
      <RideForm ride={rideData} />
    </div>
  );
}
