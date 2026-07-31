export const dynamic = "force-dynamic";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";
import { Bike, GraduationCap, Users, DollarSign, TrendingUp, Calendar } from "lucide-react";
import Link from "next/link";

export default async function AdminDashboard() {
  const [rideCount, trainingCount, riderCount, registrations, recentRegistrations] =
    await Promise.all([
      prisma.ride.count({ where: { status: "published" } }),
      prisma.training.count({ where: { status: "published" } }),
      prisma.user.count({ where: { role: "rider" } }),
      prisma.registration.findMany({ where: { paymentStatus: "paid" } }),
      prisma.registration.findMany({
        orderBy: { createdAt: "desc" },
        take: 10,
        include: {
          user: { select: { name: true, email: true } },
          ride: { select: { title: true } },
          training: { select: { title: true } },
        },
      }),
    ]);

  const totalRevenue = registrations.reduce((sum, r) => sum + r.amount, 0);

  const stats = [
    { label: "Active Rides", value: rideCount, icon: Bike, color: "text-orange" },
    { label: "Training Programs", value: trainingCount, icon: GraduationCap, color: "text-success" },
    { label: "Registered Riders", value: riderCount, icon: Users, color: "text-tan" },
    { label: "Total Revenue", value: formatPrice(totalRevenue), icon: DollarSign, color: "text-orange" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-3xl font-bold">Dashboard</h1>
        <p className="text-muted mt-1">Overview of DRC operations</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="bg-surface border border-border rounded-sm p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted">{s.label}</p>
                <p className={`font-heading text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p>
              </div>
              <s.icon className={`w-8 h-8 ${s.color} opacity-50`} />
            </div>
          </div>
        ))}
      </div>

      <div className="bg-surface border border-border rounded-sm">
        <div className="p-5 border-b border-border flex items-center justify-between">
          <h2 className="font-heading text-lg font-semibold">Recent Registrations</h2>
          <Link href="/admin/registrations" className="text-sm text-orange hover:underline">
            View All
          </Link>
        </div>
        <div className="divide-y divide-border">
          {recentRegistrations.length === 0 && (
            <div className="p-8 text-center text-muted">No registrations yet.</div>
          )}
          {recentRegistrations.map((reg) => (
            <div key={reg.id} className="px-5 py-3 flex items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="font-medium truncate">{reg.user.name || reg.user.email}</p>
                <p className="text-sm text-muted truncate">
                  {reg.ride?.title || reg.training?.title}
                </p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className={`text-xs px-2 py-0.5 rounded-sm ${
                  reg.paymentStatus === "paid" ? "bg-success/20 text-success" : "bg-warning/20 text-warning"
                }`}>
                  {reg.paymentStatus}
                </span>
                <span className="font-heading font-bold text-orange">{formatPrice(reg.amount)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
