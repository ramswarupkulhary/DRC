"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { formatPrice, formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import { ChevronLeft, Eye, Check, X } from "lucide-react";
import Link from "next/link";

interface Registration {
  id: string;
  amount: number;
  status: string;
  paymentStatus: string;
  paymentProof: string | null;
  notes: string | null;
  createdAt: string;
  user: { name: string | null; email: string; phone: string | null };
}

interface RideInfo {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  location: string;
  totalSlots: number;
  type: string;
}

export default function AdminRideDetailPage() {
  const params = useParams();
  const rideId = params.id as string;
  const [ride, setRide] = useState<RideInfo | null>(null);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [rejectNote, setRejectNote] = useState("");
  const [submitting, setSubmitting] = useState("");

  useEffect(() => {
    Promise.all([
      fetch(`/api/admin/rides/${rideId}/details`).then((r) => r.json()),
      fetch(`/api/admin/registrations?rideId=${rideId}`).then((r) => r.json()),
    ]).then(([rideData, regsData]) => {
      setRide(rideData);
      setRegistrations(regsData);
      setLoading(false);
    });
  }, [rideId]);

  async function updateStatus(id: string, status: string, notes?: string) {
    setSubmitting(id);
    await fetch(`/api/admin/registrations/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, ...(notes ? { notes } : {}) }),
    });
    setRegistrations((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status, ...(notes ? { notes } : {}) } : r))
    );
    setSubmitting("");
    setRejectId(null);
    setRejectNote("");
  }

  async function updatePayment(id: string, paymentStatus: string) {
    setSubmitting(id);
    await fetch(`/api/admin/registrations/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ paymentStatus }),
    });
    setRegistrations((prev) =>
      prev.map((r) => (r.id === id ? { ...r, paymentStatus } : r))
    );
    setSubmitting("");
  }

  const statusVariant: Record<string, "success" | "warning" | "error" | "muted" | "orange"> = {
    confirmed: "success",
    pending: "warning",
    rejected: "error",
    cancelled: "muted",
    checked_in: "success",
  };

  if (loading) return <div className="text-muted py-12 text-center">Loading...</div>;
  if (!ride) return <div className="text-error py-12 text-center">Ride not found</div>;

  const confirmedCount = registrations.filter((r) => r.status === "confirmed" || r.status === "checked_in").length;

  return (
    <div className="space-y-6">
      <Link href="/admin/rides" className="inline-flex items-center gap-1 text-sm text-muted hover:text-orange transition-colors">
        <ChevronLeft className="w-4 h-4" /> Back to Rides
      </Link>

      <div className="bg-surface border border-border rounded-sm p-6">
        <h1 className="font-heading text-2xl font-bold">{ride.title}</h1>
        <div className="flex flex-wrap gap-4 text-sm text-muted mt-2">
          <span>{formatDate(ride.startDate)}</span>
          <span>{ride.location}</span>
          <span className="text-orange font-semibold">{confirmedCount}/{ride.totalSlots} confirmed</span>
        </div>
      </div>

      <div className="bg-surface border border-border rounded-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-border">
          <h2 className="font-heading text-lg font-semibold">Registrations ({registrations.length})</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-surface-light text-left text-muted text-xs uppercase tracking-wider">
                <th className="px-5 py-3">Rider</th>
                <th className="px-5 py-3">Phone</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Payment</th>
                <th className="px-5 py-3">Proof</th>
                <th className="px-5 py-3">Date</th>
                <th className="px-5 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {registrations.map((reg) => (
                <tr key={reg.id} className="hover:bg-surface-light/50">
                  <td className="px-5 py-3">
                    <div className="font-medium">{reg.user.name || "—"}</div>
                    <div className="text-xs text-muted">{reg.user.email}</div>
                  </td>
                  <td className="px-5 py-3 text-muted">{reg.user.phone || "—"}</td>
                  <td className="px-5 py-3">
                    <Badge variant={statusVariant[reg.status] || "muted"}>{reg.status}</Badge>
                    {reg.notes && reg.status === "rejected" && (
                      <p className="text-xs text-error/70 mt-1 max-w-[150px] truncate" title={reg.notes}>{reg.notes}</p>
                    )}
                  </td>
                  <td className="px-5 py-3">
                    <Badge variant={reg.paymentStatus === "paid" ? "success" : "warning"}>
                      {reg.paymentStatus}
                    </Badge>
                  </td>
                  <td className="px-5 py-3">
                    {reg.paymentProof ? (
                      <a href={reg.paymentProof} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-orange hover:underline text-xs">
                        <Eye className="w-3.5 h-3.5" /> View
                      </a>
                    ) : (
                      <span className="text-muted text-xs">—</span>
                    )}
                  </td>
                  <td className="px-5 py-3 text-muted text-xs">{new Date(reg.createdAt).toLocaleDateString()}</td>
                  <td className="px-5 py-3">
                    <div className="flex flex-wrap gap-2">
                      {reg.status === "pending" && (
                        <>
                          <Button
                            size="sm"
                            variant="primary"
                            loading={submitting === reg.id}
                            onClick={() => updateStatus(reg.id, "confirmed")}
                          >
                            <Check className="w-3.5 h-3.5 mr-1" /> Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setRejectId(reg.id)}
                          >
                            <X className="w-3.5 h-3.5 mr-1" /> Reject
                          </Button>
                        </>
                      )}
                      {reg.paymentStatus !== "paid" && reg.status !== "rejected" && (
                        <Button size="sm" variant="secondary" loading={submitting === reg.id} onClick={() => updatePayment(reg.id, "paid")}>
                          Mark Paid
                        </Button>
                      )}
                    </div>

                    {rejectId === reg.id && (
                      <div className="mt-3 space-y-2 max-w-xs">
                        <Textarea
                          id={`reject-${reg.id}`}
                          label="Rejection reason"
                          placeholder="Enter reason for rejection..."
                          value={rejectNote}
                          onChange={(e) => setRejectNote(e.target.value)}
                        />
                        <div className="flex gap-2">
                          <Button size="sm" variant="primary" loading={submitting === reg.id} onClick={() => updateStatus(reg.id, "rejected", rejectNote)}>
                            Confirm Reject
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => { setRejectId(null); setRejectNote(""); }}>
                            Cancel
                          </Button>
                        </div>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {registrations.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-muted">No registrations yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
