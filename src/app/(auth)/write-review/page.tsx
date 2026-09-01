"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import { Badge } from "@/components/ui/Badge";
import { Star, CheckCircle2, Clock3 } from "lucide-react";

interface MyReview {
    id: string;
    rating: number;
    comment: string | null;
    approved: boolean;
    createdAt: string;
}

export default function WriteReviewPage() {
    const { status } = useSession();
    const router = useRouter();

    const [reviews, setReviews] = useState<MyReview[]>([]);
    const [loading, setLoading] = useState(true);
    const [rating, setRating] = useState(0);
    const [hover, setHover] = useState(0);
    const [comment, setComment] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [done, setDone] = useState(false);

    const load = useCallback(() => {
        fetch("/api/reviews")
            .then((r) => r.json())
            .then((d) => setReviews(d.reviews || []))
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        if (status === "unauthenticated") router.push("/login?redirect=/write-review");
        if (status === "authenticated") load();
    }, [status, router, load]);

    async function submit(e: React.FormEvent) {
        e.preventDefault();
        setError("");
        if (rating < 1) {
            setError("Please select a star rating.");
            return;
        }
        if (!comment.trim()) {
            setError("Please write a short review.");
            return;
        }
        setSubmitting(true);
        try {
            const res = await fetch("/api/reviews", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ rating, comment: comment.trim() }),
            });
            if (!res.ok) {
                const err = await res.json();
                setError(err.error || "Could not submit your review.");
                return;
            }
            setDone(true);
            setRating(0);
            setComment("");
            load();
        } catch {
            setError("Could not submit your review.");
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
            <SectionHeader accent="Share your experience" title="Write a Review" align="center" />
            <p className="text-center text-muted mt-4">
                Tell us about your ride, trail or training with DRC. Once our team approves it, your review appears on our homepage.
            </p>

            <form onSubmit={submit} className="mt-10 bg-surface border border-border rounded-sm p-6 space-y-5">
                {error && <div className="bg-error/10 border border-error/30 text-error text-sm p-3 rounded-sm">{error}</div>}
                {done && (
                    <div className="bg-success/10 border border-success/30 text-success text-sm p-3 rounded-sm flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4" /> Thanks! Your review was submitted and is awaiting approval.
                    </div>
                )}

                <div>
                    <label className="block text-sm font-medium text-tan-light mb-2">Your rating</label>
                    <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((n) => (
                            <button
                                key={n}
                                type="button"
                                onClick={() => setRating(n)}
                                onMouseEnter={() => setHover(n)}
                                onMouseLeave={() => setHover(0)}
                                className="p-1"
                                aria-label={`${n} star${n > 1 ? "s" : ""}`}
                            >
                                <Star className={`w-8 h-8 transition-colors ${(hover || rating) >= n ? "fill-orange text-orange" : "text-muted"}`} />
                            </button>
                        ))}
                    </div>
                </div>

                <Textarea
                    id="comment"
                    label="Your review"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="What did you love about your DRC experience?"
                    rows={5}
                />

                <Button type="submit" size="lg" className="w-full" loading={submitting}>
                    Submit Review
                </Button>
            </form>

            {/* Rider's own reviews + status */}
            <div className="mt-12">
                <h2 className="font-heading text-xl font-bold mb-4">Your Reviews</h2>
                {loading ? (
                    <p className="text-muted">Loading…</p>
                ) : reviews.length === 0 ? (
                    <p className="text-muted text-sm">You haven&apos;t written a review yet.</p>
                ) : (
                    <div className="space-y-3">
                        {reviews.map((r) => (
                            <div key={r.id} className="bg-surface border border-border rounded-sm p-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex gap-0.5">
                                        {[1, 2, 3, 4, 5].map((n) => (
                                            <Star key={n} className={`w-4 h-4 ${r.rating >= n ? "fill-orange text-orange" : "text-muted"}`} />
                                        ))}
                                    </div>
                                    {r.approved ? (
                                        <Badge variant="success"><CheckCircle2 className="w-3.5 h-3.5 mr-1" />Published</Badge>
                                    ) : (
                                        <Badge variant="warning"><Clock3 className="w-3.5 h-3.5 mr-1" />Awaiting Approval</Badge>
                                    )}
                                </div>
                                {r.comment && <p className="text-sm text-foreground/80 mt-2">{r.comment}</p>}
                                <p className="text-xs text-muted mt-2">{new Date(r.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
