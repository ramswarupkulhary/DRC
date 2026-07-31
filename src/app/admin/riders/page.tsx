export const dynamic = "force-dynamic";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";

export default async function AdminRidersPage() {
  const riders = await prisma.user.findMany({
    where: { role: "rider" },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { registrations: true } } },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-bold">Riders</h1>
        <p className="text-muted mt-1">{riders.length} registered riders</p>
      </div>

      <div className="bg-surface border border-border rounded-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-surface-light text-left text-muted text-xs uppercase tracking-wider">
                <th className="px-5 py-3">Name</th>
                <th className="px-5 py-3">Email</th>
                <th className="px-5 py-3">Phone</th>
                <th className="px-5 py-3">Bike</th>
                <th className="px-5 py-3">Experience</th>
                <th className="px-5 py-3">Rides</th>
                <th className="px-5 py-3">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {riders.map((rider) => (
                <tr key={rider.id} className="hover:bg-surface-light/50">
                  <td className="px-5 py-3 font-medium">{rider.name || "—"}</td>
                  <td className="px-5 py-3 text-muted">{rider.email}</td>
                  <td className="px-5 py-3 text-muted">{rider.phone || "—"}</td>
                  <td className="px-5 py-3">{rider.bikeName || "—"}</td>
                  <td className="px-5 py-3">
                    {rider.ridingExperience ? (
                      <Badge variant={
                        rider.ridingExperience === "beginner" ? "success" :
                        rider.ridingExperience === "intermediate" ? "warning" : "orange"
                      }>
                        {rider.ridingExperience}
                      </Badge>
                    ) : "—"}
                  </td>
                  <td className="px-5 py-3 text-orange font-semibold">{rider._count.registrations}</td>
                  <td className="px-5 py-3 text-muted">{formatDate(rider.createdAt)}</td>
                </tr>
              ))}
              {riders.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-muted">No riders yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
