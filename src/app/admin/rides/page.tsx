export const dynamic = "force-dynamic";
import { prisma } from "@/lib/prisma";
import { formatPrice, formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { Plus } from "lucide-react";

export default async function AdminRidesPage() {
  // Auto-archive rides whose date has passed
  await prisma.ride.updateMany({
    where: { status: { in: ["published", "draft"] }, endDate: { lt: new Date() } },
    data: { status: "past" },
  });

  const rides = await prisma.ride.findMany({
    where: { status: { not: "past" } },
    orderBy: { startDate: "desc" },
    include: {
      registrations: { where: { status: { in: ["confirmed", "checked_in"] } } },
      _count: { select: { registrations: true } },
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-3xl font-bold">Rides</h1>
          <p className="text-muted mt-1">Click a ride title to manage registrations</p>
        </div>
        <Link href="/admin/rides/new">
          <Button size="sm"><Plus className="w-4 h-4" /> New Ride</Button>
        </Link>
      </div>

      <div className="bg-surface border border-border rounded-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-surface-light text-left text-muted text-xs uppercase tracking-wider">
                <th className="px-5 py-3">Title</th>
                <th className="px-5 py-3">Date</th>
                <th className="px-5 py-3">Location</th>
                <th className="px-5 py-3">Price</th>
                <th className="px-5 py-3">Slots</th>
                <th className="px-5 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rides.map((ride) => {
                const booked = ride.registrations.length;
                return (
                  <tr key={ride.id} className="hover:bg-surface-light/50 cursor-pointer">
                    <td className="px-5 py-3">
                      <Link href={`/admin/rides/${ride.id}`} className="font-medium text-orange hover:underline">
                        {ride.title}
                      </Link>
                      <div className="text-xs text-muted mt-0.5">{ride._count.registrations} total registrations</div>
                    </td>
                    <td className="px-5 py-3 text-muted">{ride.startDate ? formatDate(ride.startDate) : "—"}</td>
                    <td className="px-5 py-3 text-muted">{ride.location}</td>
                    <td className="px-5 py-3 text-orange font-semibold">{formatPrice(ride.price)}</td>
                    <td className="px-5 py-3">
                      <span className={booked >= ride.totalSlots ? "text-error" : "text-foreground"}>
                        {booked}/{ride.totalSlots}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <Badge variant={ride.status === "published" ? "success" : ride.status === "draft" ? "muted" : "error"}>
                        {ride.status}
                      </Badge>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
