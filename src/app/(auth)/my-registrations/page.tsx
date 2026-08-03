"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Badge } from "@/components/ui/Badge";
import { formatPrice, formatDate } from "@/lib/utils";
import Link from "next/link";
import { MapPin, Calendar, MessageCircle, Image as ImageIcon, Star } from "lucide-react";

interface Registration {
  id: string;
  status: string;
  paymentStatus: string;
  amount: number;
  createdAt: string;
  ride?: {
    id: string;
    title: string;
    slug: string;
    location: string;
    startDate: string;
    whatsappGroupLink: string | null;
    photosLink: string | null;
    photosPublished: boolean;
  };
  training?: { title: string; slug: string; location: string | null };
}

const statusVariant: Record<string, "success" | "warning" | "error" | "muted" | "orange"> = {
  confirmed: "success",
  pending: "warning",
  cancelled: "error",
  waitlist: "muted",
  checked_in: "success",
};

const statusLabel: Record<string, string> = {
  confirmed: "Confirmed",
  pending: "Awaiting Approval",
  cancelled: "Cancelled",
  waitlist: "Waitlisted",
  checked_in: "Checked In",
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
  const [reviewingRide, setReviewingRide] = useState<string | null>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState<string | null>(null);

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

  async function submitReview(rideId: string) {
    setReviewSubmitting(true);
    const res = await fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rideId, rating: reviewRating, comment: reviewComment }),
    });
    setReviewSubmitting(false);
    if (res.ok) {
      setReviewSuccess(rideId);
      setReviewingRide(null);
      setReviewComment("");
      setReviewRating(5);
    }
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
            const isConfirmedPaid = (reg.status === "confirmed" || reg.status === "checked_in") && reg.paymentStatus === "paid";
            return (
              <div key={reg.id} className="bg-surface border border-border rounded-sm p-5 hover:border-orange/30 transition-colors">
                <Link href={href} className="block group">
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
                      <Badge variant={statusVariant[reg.status] || "muted"}>
                        {statusLabel[reg.status] || reg.status}
                      </Badge>
                      <Badge variant={paymentVariant[reg.paymentStatus] || "muted"}>{reg.paymentStatus}</Badge>
                      <span className="font-heading text-lg font-bold text-orange">{formatPrice(reg.amount)}</span>
                    </div>
                  </div>
                </Link>

                {isConfirmedPaid && (reg.ride?.whatsappGroupLink || (reg.ride?.photosLink && reg.ride?.photosPublished)) && (
                  <div className="mt-3 pt-3 border-t border-border flex flex-wrap gap-3">
                    {reg.ride?.whatsappGroupLink && (
                      <a
                        href={reg.ride.whatsappGroupLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-success/10 text-success border border-success/20 rounded-sm hover:bg-success/20 transition-colors"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        Join WhatsApp Group
                      </a>
                    )}
                    {reg.ride?.photosLink && reg.ride?.photosPublished && (
                      <a
                        href={reg.ride.photosLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-orange/10 text-orange border border-orange/20 rounded-sm hover:bg-orange/20 transition-colors"
                      >
                        <ImageIcon className="w-3.5 h-3.5" />
                        View Photos & Videos
                      </a>
                    )}
                  </div>
                )}

                {isConfirmedPaid && reg.ride && (
                  <div className="mt-3 pt-3 border-t border-border">
                    {reviewSuccess === reg.ride.id ? (
                      <p className="text-sm text-success">Review submitted! It will appear on the homepage once approved.</p>
                    ) : reviewingRide === reg.ride.id ? (
                      <div className="space-y-3">
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button key={star} onClick={() => setReviewRating(star)} className="p-0.5">
                              <Star className={`w-5 h-5 ${star <= reviewRating ? "fill-orange text-orange" : "text-muted"}`} />
                            </button>
                          ))}
                        </div>
                        <textarea
                          value={reviewComment}
                          onChange={(e) => setReviewComment(e.target.value)}
                          placeholder="Share your experience..."
                          className="w-full px-3 py-2 bg-background border border-border rounded-sm text-sm text-foreground focus:border-orange focus:outline-none resize-none"
                          rows={3}
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => submitReview(reg.ride!.id)}
                            disabled={reviewSubmitting}
                            className="px-4 py-1.5 text-xs font-medium bg-orange text-white rounded-sm hover:bg-orange/90 disabled:opacity-50"
                          >
                            {reviewSubmitting ? "Submitting..." : "Submit Review"}
                          </button>
                          <button onClick={() => setReviewingRide(null)} className="px-4 py-1.5 text-xs text-muted hover:text-foreground">
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => setReviewingRide(reg.ride!.id)}
                        className="inline-flex items-center gap-1.5 text-xs text-orange hover:underline font-medium"
                      >
                        <Star className="w-3.5 h-3.5" /> Write a Review
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
