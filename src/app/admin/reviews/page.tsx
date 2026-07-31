"use client";

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Star, Check, X, Trash2 } from "lucide-react";

interface Review {
  id: string;
  rating: number;
  comment: string;
  approved: boolean;
  createdAt: string;
  user: { name: string | null; email: string };
}

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/reviews")
      .then((r) => r.json())
      .then((data) => { setReviews(data); setLoading(false); });
  }, []);

  async function toggleApproval(id: string, approved: boolean) {
    await fetch(`/api/admin/reviews/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ approved }),
    });
    setReviews((prev) => prev.map((r) => (r.id === id ? { ...r, approved } : r)));
  }

  async function deleteReview(id: string) {
    await fetch(`/api/admin/reviews/${id}`, { method: "DELETE" });
    setReviews((prev) => prev.filter((r) => r.id !== id));
  }

  if (loading) return <div className="text-muted py-12 text-center">Loading...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-bold">Reviews</h1>
        <p className="text-muted mt-1">{reviews.length} reviews &middot; {reviews.filter(r => !r.approved).length} pending</p>
      </div>

      <div className="space-y-4">
        {reviews.map((review) => (
          <div key={review.id} className="bg-surface border border-border rounded-sm p-5 flex gap-5">
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-3">
                <span className="font-medium">{review.user.name || review.user.email}</span>
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={`w-4 h-4 ${i < review.rating ? "text-orange fill-orange" : "text-border"}`} />
                  ))}
                </div>
                <Badge variant={review.approved ? "success" : "warning"}>
                  {review.approved ? "Approved" : "Pending"}
                </Badge>
              </div>
              <p className="text-sm text-muted">{review.comment}</p>
              <p className="text-xs text-muted">{new Date(review.createdAt).toLocaleDateString()}</p>
            </div>
            <div className="flex flex-col gap-2">
              {review.approved ? (
                <Button size="sm" variant="outline" onClick={() => toggleApproval(review.id, false)}>
                  <X className="w-3.5 h-3.5" /> Hide
                </Button>
              ) : (
                <Button size="sm" variant="primary" onClick={() => toggleApproval(review.id, true)}>
                  <Check className="w-3.5 h-3.5" /> Approve
                </Button>
              )}
              <Button size="sm" variant="danger" onClick={() => deleteReview(review.id)}>
                <Trash2 className="w-3.5 h-3.5" /> Delete
              </Button>
            </div>
          </div>
        ))}
        {reviews.length === 0 && (
          <div className="text-center text-muted py-12 bg-surface border border-border rounded-sm">
            No reviews yet.
          </div>
        )}
      </div>
    </div>
  );
}
