export const dynamic = "force-dynamic";
import { prisma } from "@/lib/prisma";
import { formatPrice, formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { Plus, Edit } from "lucide-react";

export default async function AdminRidesPage() {
  const rides = await prisma.ride.findMany({
    orderBy: { startDate: "desc" },
    include: { registrations: { where: { status: { not: "cancelled" } } } },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-3xl font-bold">Rides</h1>
          <p className="text-muted mt-1">Manage rides and events</p>
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
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rides.map((ride) => {
                const booked = ride.registrations.length;
                return (
                  <tr key={ride.id} className="hover:bg-surface-light/50">
                    <td className="px-5 py-3 font-medium">{ride.title}</td>
                    <td className="px-5 py-3 text-muted">{formatDate(ride.startDate)}</td>
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
                    <td className="px-5 py-3">
                      <Link href={`/admin/rides/${ride.id}/edit`} className="text-orange hover:underline inline-flex items-center gap-1 text-xs">
                        <Edit className="w-3.5 h-3.5" /> Edit
                      </Link>
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
