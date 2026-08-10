export const dynamic = "force-dynamic";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";
import { Bike, GraduationCap, Users, DollarSign, TrendingUp, Crown, ShoppingBag } from "lucide-react";
import Link from "next/link";

export default async function AdminDashboard() {
  const now = new Date();
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

  const [rideCount, trainingCount, riderCount, registrations, memberships, orders, recentRegistrations] =
    await Promise.all([
      prisma.ride.count({ where: { status: "published" } }),
      prisma.training.count({ where: { status: "published" } }),
      prisma.user.count({ where: { role: "rider" } }),
      prisma.registration.findMany({ where: { paymentStatus: "paid", paymentId: { not: null } }, select: { amount: true, createdAt: true, rideId: true, trainingId: true } }),
      prisma.membership.findMany({ where: { status: "active" }, select: { createdAt: true, plan: { select: { price: true } } } }),
      prisma.order.findMany({ where: { status: "completed", paymentId: { not: null } }, select: { total: true, createdAt: true } }),
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
  const membershipRevenue = 0;
  const storeRevenue = orders.reduce((sum, o) => sum + o.total, 0);
  const rideRevenue = registrations.filter((r) => r.rideId).reduce((sum, r) => sum + r.amount, 0);
  const trainingRevenue = registrations.filter((r) => r.trainingId).reduce((sum, r) => sum + r.amount, 0);
  const grandTotal = totalRevenue + membershipRevenue + storeRevenue;

  // Monthly revenue for last 6 months
  const months: { label: string; rides: number; trainings: number; memberships: number; store: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const nextMonth = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
    const label = month.toLocaleDateString("en-IN", { month: "short", year: "2-digit" });
    months.push({
      label,
      rides: registrations.filter((r) => r.rideId && r.createdAt >= month && r.createdAt < nextMonth).reduce((s, r) => s + r.amount, 0),
      trainings: registrations.filter((r) => r.trainingId && r.createdAt >= month && r.createdAt < nextMonth).reduce((s, r) => s + r.amount, 0),
      memberships: 0,
      store: orders.filter((o) => o.createdAt >= month && o.createdAt < nextMonth).reduce((s, o) => s + o.total, 0),
    });
  }

  const maxMonthly = Math.max(...months.map((m) => m.rides + m.trainings + m.memberships + m.store), 1);

  const stats = [
    { label: "Active Rides", value: rideCount, icon: Bike, color: "text-orange" },
    { label: "Training Programs", value: trainingCount, icon: GraduationCap, color: "text-success" },
    { label: "Registered Riders", value: riderCount, icon: Users, color: "text-tan" },
    { label: "Total Revenue", value: formatPrice(grandTotal), icon: DollarSign, color: "text-orange" },
  ];

  const breakdown = [
    { label: "Rides", value: rideRevenue, color: "bg-orange", icon: Bike },
    { label: "Trainings", value: trainingRevenue, color: "bg-success", icon: GraduationCap },
    { label: "Memberships", value: membershipRevenue, color: "bg-tan", icon: Crown },
    { label: "Store", value: storeRevenue, color: "bg-blue-500", icon: ShoppingBag },
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

      {/* Revenue Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-surface border border-border rounded-sm p-6">
          <h2 className="font-heading text-lg font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-orange" /> Revenue by Category
          </h2>
          <div className="space-y-3">
            {breakdown.map((b) => (
              <div key={b.label} className="flex items-center gap-3">
                <b.icon className="w-4 h-4 text-muted" />
                <span className="text-sm w-24">{b.label}</span>
                <div className="flex-1 bg-background rounded-full h-3 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${b.color}`}
                    style={{ width: `${grandTotal > 0 ? (b.value / grandTotal) * 100 : 0}%` }}
                  />
                </div>
                <span className="text-sm font-semibold w-24 text-right">{formatPrice(b.value)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Monthly Chart */}
        <div className="bg-surface border border-border rounded-sm p-6">
          <h2 className="font-heading text-lg font-semibold mb-4">Monthly Revenue (6 months)</h2>
          <div className="flex items-end gap-2 h-40">
            {months.map((m) => {
              const total = m.rides + m.trainings + m.memberships + m.store;
              const height = (total / maxMonthly) * 100;
              return (
                <div key={m.label} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-[10px] text-muted">{total > 0 ? formatPrice(total) : ""}</span>
                  <div className="w-full bg-background rounded-sm overflow-hidden" style={{ height: "100%" }}>
                    <div className="w-full flex flex-col justify-end h-full">
                      <div className="bg-orange rounded-t-sm" style={{ height: `${height}%`, minHeight: total > 0 ? "4px" : "0" }} />
                    </div>
                  </div>
                  <span className="text-[10px] text-muted">{m.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recent Registrations */}
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
