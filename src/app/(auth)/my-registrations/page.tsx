"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Badge } from "@/components/ui/Badge";
import { formatPrice, formatDate } from "@/lib/utils";
import Link from "next/link";
import { MapPin, Calendar } from "lucide-react";

interface Registration {
  id: string;
  status: string;
  paymentStatus: string;
  amount: number;
  createdAt: string;
  ride?: { title: string; slug: string; location: string; startDate: string };
  training?: { title: string; slug: string; location: string | null };
}

const statusVariant: Record<string, "success" | "warning" | "error" | "muted" | "orange"> = {
  confirmed: "success",
  pending: "warning",
  cancelled: "error",
  waitlist: "muted",
  checked_in: "success",
};

const paymentVariant: Record<string, "success" | "warning" | "error" | "muted"> = {
  paid: "success",
  unpaid: "warning",
  refunded: "muted",
};

export default function MyRegistrationsPage() {
  const { status } = useSession();
  const router = useRouter();
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login?redirect=/my-registrations");
    }
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/registrations/mine")
        .then((r) => r.json())
        .then((data) => {
          setRegistrations(data.registrations || []);
          setLoading(false);
        });
    }
  }, [status]);

  if (status === "loading" || loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-pulse text-muted">Loading...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <SectionHeader accent="Your bookings" title="My Registrations" align="left" />

      {registrations.length === 0 ? (
        <div className="mt-12 text-center py-16 bg-surface border border-border rounded-sm">
          <p className="text-muted text-lg">No registrations yet.</p>
          <p className="text-muted text-sm mt-2">
            <Link href="/rides" className="text-orange hover:underline">Browse upcoming rides</Link> to get started!
          </p>
        </div>
      ) : (
        <div className="mt-8 space-y-4">
          {registrations.map((reg) => {
            const item = reg.ride || reg.training;
            const href = reg.ride ? `/rides/${reg.ride.slug}` : `/trainings/${reg.training?.slug}`;
            return (
              <Link key={reg.id} href={href} className="block group">
                <div className="bg-surface border border-border rounded-sm p-5 hover:border-orange/30 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <h3 className="font-heading text-lg font-semibold group-hover:text-orange transition-colors">
                        {item?.title}
                      </h3>
                      <div className="flex flex-wrap items-center gap-3 text-sm text-muted">
                        {item && "location" in item && item.location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-orange" /> {item.location}
                          </span>
                        )}
                        {reg.ride?.startDate && (
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-orange" /> {formatDate(reg.ride.startDate)}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant={statusVariant[reg.status] || "muted"}>{reg.status}</Badge>
                      <Badge variant={paymentVariant[reg.paymentStatus] || "muted"}>{reg.paymentStatus}</Badge>
                      <span className="font-heading text-lg font-bold text-orange">{formatPrice(reg.amount)}</span>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
