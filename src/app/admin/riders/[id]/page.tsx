export const dynamic = "force-dynamic";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/Badge";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import { ArrowLeft, Mail, Phone, MapPin, Bike, Shield, Heart, Award, Crown, Calendar, FileText } from "lucide-react";

export default async function AdminRiderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const rider = await prisma.user.findUnique({
    where: { id },
    include: {
      membership: { include: { plan: true } },
      registrations: {
        include: { ride: true, training: true },
        orderBy: { createdAt: "desc" },
        take: 20,
      },
      badges: { include: { badge: true } },
      _count: { select: { registrations: true, rideLogs: true, journals: true, referrals: true } },
    },
  });

  if (!rider) return notFound();

  const infoItems = [
    { label: "Email", value: rider.email, icon: Mail },
    { label: "Phone", value: rider.phone, icon: Phone },
    { label: "City", value: rider.city, icon: MapPin },
    { label: "Bike", value: rider.bikeName ? `${rider.bikeName}${rider.bikeCC ? ` (${rider.bikeCC}cc)` : ""}` : null, icon: Bike },
    { label: "Riding Experience", value: rider.ridingExperience, icon: Award },
    { label: "Blood Group", value: rider.bloodGroup, icon: Heart },
    { label: "License Number", value: rider.licenseNumber, icon: FileText },
    { label: "Emergency Contact", value: rider.emergencyName ? `${rider.emergencyName} (${rider.emergencyPhone || "—"})` : null, icon: Shield },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/riders" className="p-2 hover:bg-surface-light rounded-sm transition-colors">
          <ArrowLeft className="w-5 h-5 text-muted" />
        </Link>
        <div>
          <h1 className="font-heading text-3xl font-bold">{rider.name || "Unnamed Rider"}</h1>
          <p className="text-muted mt-1">Joined {formatDate(rider.createdAt)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="bg-surface border border-border rounded-sm p-6 text-center">
          <div className="w-24 h-24 mx-auto rounded-full bg-orange/20 flex items-center justify-center overflow-hidden border-2 border-orange/30">
            {rider.image ? (
              <img src={rider.image} alt={rider.name || ""} className="w-full h-full object-cover" />
            ) : (
              <span className="text-3xl font-bold text-orange">
                {(rider.name || "R").split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)}
              </span>
            )}
          </div>
          <h2 className="font-heading text-xl font-bold mt-4">{rider.name || "—"}</h2>
          <p className="text-sm text-muted">{rider.email}</p>

          <div className="mt-4 flex flex-wrap justify-center gap-2">
            <Badge variant="orange">{rider.skillLevel}</Badge>
            {rider.membership?.status === "active" && <Badge variant="success">Member</Badge>}
            {rider.membership?.status === "pending" && <Badge variant="warning">Pending Member</Badge>}
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3 text-center">
            <div className="bg-background p-3 rounded-sm border border-border">
              <p className="text-2xl font-bold text-orange">{rider.skillPoints}</p>
              <p className="text-xs text-muted">Points</p>
            </div>
            <div className="bg-background p-3 rounded-sm border border-border">
              <p className="text-2xl font-bold text-orange">{rider._count.registrations}</p>
              <p className="text-xs text-muted">Rides</p>
            </div>
            <div className="bg-background p-3 rounded-sm border border-border">
              <p className="text-2xl font-bold text-orange">{rider.totalKm}</p>
              <p className="text-xs text-muted">Total KM</p>
            </div>
            <div className="bg-background p-3 rounded-sm border border-border">
              <p className="text-2xl font-bold text-orange">{rider.badges.length}</p>
              <p className="text-xs text-muted">Badges</p>
            </div>
          </div>

          {rider.referralCode && (
            <div className="mt-4 bg-background p-3 rounded-sm border border-border text-left">
              <p className="text-xs text-muted">Referral Code</p>
              <p className="text-sm font-mono text-orange font-bold">{rider.referralCode}</p>
              <p className="text-xs text-muted mt-1">{rider._count.referrals} referrals · ₹{rider.referralCredits} credits</p>
            </div>
          )}
        </div>

        {/* Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Info Grid */}
          <div className="bg-surface border border-border rounded-sm p-6">
            <h3 className="font-heading text-lg font-semibold mb-4">Rider Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {infoItems.map((item) => (
                <div key={item.label} className="flex items-start gap-3">
                  <item.icon className="w-4 h-4 text-orange mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-muted">{item.label}</p>
                    <p className="text-sm font-medium">{item.value || "—"}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Membership */}
          {rider.membership && (
            <div className="bg-surface border border-border rounded-sm p-6">
              <div className="flex items-center gap-2 mb-4">
                <Crown className="w-5 h-5 text-orange" />
                <h3 className="font-heading text-lg font-semibold">Membership</h3>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <p className="text-xs text-muted">Plan</p>
                  <p className="text-sm font-medium">{rider.membership.plan.name}</p>
                </div>
                <div>
                  <p className="text-xs text-muted">Status</p>
                  <Badge variant={rider.membership.status === "active" ? "success" : rider.membership.status === "pending" ? "orange" : "error"} className="mt-1">
                    {rider.membership.status}
                  </Badge>
                </div>
                <div>
                  <p className="text-xs text-muted">T-Shirt Size</p>
                  <p className="text-sm font-medium">{rider.membership.tshirtSize || "—"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted">Valid Until</p>
                  <p className="text-sm font-medium">{formatDate(rider.membership.endDate)}</p>
                </div>
              </div>
              {rider.membership.paymentProof && (
                <div className="mt-4">
                  <p className="text-xs text-muted mb-2">Payment Proof</p>
                  <a href={rider.membership.paymentProof} target="_blank" rel="noopener noreferrer">
                    <img src={rider.membership.paymentProof} alt="Payment proof" className="h-32 rounded-sm border border-border object-cover hover:opacity-80 transition-opacity" />
                  </a>
                </div>
              )}
            </div>
          )}

          {/* Registration History */}
          <div className="bg-surface border border-border rounded-sm p-6">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="w-5 h-5 text-orange" />
              <h3 className="font-heading text-lg font-semibold">Registration History</h3>
            </div>
            {rider.registrations.length === 0 ? (
              <p className="text-sm text-muted">No registrations yet.</p>
            ) : (
              <div className="space-y-3">
                {rider.registrations.map((reg) => (
                  <div key={reg.id} className="flex items-center justify-between bg-background p-3 rounded-sm border border-border">
                    <div>
                      <p className="text-sm font-medium">{reg.ride?.title || reg.training?.title || "—"}</p>
                      <p className="text-xs text-muted">{formatDate(reg.createdAt)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={reg.paymentStatus === "paid" ? "success" : "warning"}>{reg.paymentStatus}</Badge>
                      <Badge variant={reg.status === "confirmed" ? "success" : reg.status === "pending" ? "orange" : "muted"}>{reg.status}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Badges */}
          {rider.badges.length > 0 && (
            <div className="bg-surface border border-border rounded-sm p-6">
              <h3 className="font-heading text-lg font-semibold mb-4">Badges</h3>
              <div className="flex flex-wrap gap-3">
                {rider.badges.map((ub) => (
                  <div key={ub.id} className="flex items-center gap-2 bg-background px-3 py-2 rounded-sm border border-border">
                    <span className="text-xl">{ub.badge.icon}</span>
                    <div>
                      <p className="text-sm font-medium">{ub.badge.name}</p>
                      <p className="text-xs text-muted">{formatDate(ub.earnedAt)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
