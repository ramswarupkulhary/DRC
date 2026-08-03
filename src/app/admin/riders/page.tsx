export const dynamic = "force-dynamic";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import Link from "next/link";
import { Crown } from "lucide-react";

export default async function AdminRidersPage() {
  const riders = await prisma.user.findMany({
    where: { role: "rider" },
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { registrations: true, reviews: true } },
      membership: { include: { plan: { select: { name: true } } } },
    },
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
                <th className="px-5 py-3">Rider</th>
                <th className="px-5 py-3">Email</th>
                <th className="px-5 py-3">Phone</th>
                <th className="px-5 py-3">Experience</th>
                <th className="px-5 py-3">Rides</th>
                <th className="px-5 py-3">Membership</th>
                <th className="px-5 py-3">Reviews</th>
                <th className="px-5 py-3">Joined</th>
                <th className="px-5 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {riders.map((rider) => {
                const isMember = rider.membership?.status === "active" && new Date(rider.membership.endDate) > new Date();
                return (
                  <tr key={rider.id} className="hover:bg-surface-light/50">
                    <td className="px-5 py-3">
                      <Link href={`/admin/riders/${rider.id}`} className="flex items-center gap-3 group">
                        <div className="w-8 h-8 rounded-full bg-orange/20 flex items-center justify-center overflow-hidden shrink-0 relative">
                          {rider.image ? (
                            <img src={rider.image} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-xs font-bold text-orange">
                              {(rider.name || "R").charAt(0).toUpperCase()}
                            </span>
                          )}
                          {isMember && (
                            <div className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-orange rounded-full flex items-center justify-center">
                              <Crown className="w-2 h-2 text-white" />
                            </div>
                          )}
                        </div>
                        <span className="font-medium text-foreground group-hover:text-orange transition-colors">
                          {rider.name || "—"}
                        </span>
                      </Link>
                    </td>
                    <td className="px-5 py-3 text-muted">{rider.email}</td>
                    <td className="px-5 py-3 text-muted">{rider.phone || "—"}</td>
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
                    <td className="px-5 py-3">
                      {isMember ? (
                        <Badge variant="success">{rider.membership!.plan.name}</Badge>
                      ) : (
                        <Link
                          href={`/admin/memberships?assign=true&email=${encodeURIComponent(rider.email)}&name=${encodeURIComponent(rider.name || "")}&phone=${encodeURIComponent(rider.phone || "")}`}
                          className="text-xs text-orange hover:underline"
                        >
                          Assign
                        </Link>
                      )}
                    </td>
                    <td className="px-5 py-3 text-muted">{rider._count.reviews}</td>
                    <td className="px-5 py-3 text-muted">{formatDate(rider.createdAt)}</td>
                    <td className="px-5 py-3">
                      <Link href={`/admin/riders/${rider.id}`} className="text-xs text-orange hover:underline">
                        View
                      </Link>
                    </td>
                  </tr>
                );
              })}
              {riders.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-5 py-12 text-center text-muted">No riders yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
