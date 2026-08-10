"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { formatPrice, formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { ChevronLeft, Eye, Check, X, Edit, ChevronDown, ChevronUp, MessageCircle, Image as ImageIcon, Link as LinkIcon, Trash2, Copy, ClipboardList, Award, Send } from "lucide-react";
import Link from "next/link";
import { NotifyRidersModal } from "@/components/admin/NotifyRidersModal";

interface Registration {
  id: string;
  amount: number;
  status: string;
  paymentStatus: string;
  paymentProof: string | null;
  paymentId: string | null;
  notes: string | null;
  createdAt: string;
  user: { id: string; name: string | null; email: string; phone: string | null };
}

interface RideInfo {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  location: string;
  totalSlots: number;
  price: number;
  memberDiscount: number;
  type: string;
  status: string;
  whatsappGroupLink: string | null;
  photosLink: string | null;
  photosPublished: boolean;
}

interface RiderHistory {
  registrations: {
    id: string;
    status: string;
    notes: string | null;
    createdAt: string;
    paymentStatus: string;
    amount: number;
    ride: { title: string } | null;
    training: { title: string } | null;
  }[];
}

const statusVariant: Record<string, "success" | "warning" | "error" | "muted" | "orange"> = {
  confirmed: "success",
  pending: "warning",
  rejected: "error",
  cancelled: "muted",
  checked_in: "success",
};

export default function AdminRideDetailPage() {
  const params = useParams();
  const router = useRouter();
  const rideId = params.id as string;
  const [ride, setRide] = useState<RideInfo | null>(null);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [cancelId, setCancelId] = useState<string | null>(null);
  const [rejectNote, setRejectNote] = useState("");
  const [cancelNote, setCancelNote] = useState("");
  const [submitting, setSubmitting] = useState("");
  const [expandedRider, setExpandedRider] = useState<string | null>(null);
  const [riderHistory, setRiderHistory] = useState<Record<string, RiderHistory>>({});
  const [linksForm, setLinksForm] = useState({ whatsappGroupLink: "", photosLink: "" });
  const [savingLinks, setSavingLinks] = useState(false);
  const [linksSaved, setLinksSaved] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showNotifyModal, setShowNotifyModal] = useState(false);
  const [refunding, setRefunding] = useState("");

  const fetchData = useCallback(() => {
    Promise.all([
      fetch(`/api/admin/rides/${rideId}/details`).then((r) => r.json()),
      fetch(`/api/admin/registrations?rideId=${rideId}`).then((r) => r.json()),
    ]).then(([rideData, regsData]) => {
      setRide(rideData);
      setRegistrations(regsData);
      setLinksForm({
        whatsappGroupLink: rideData.whatsappGroupLink || "",
        photosLink: rideData.photosLink || "",
      });
      setLoading(false);
    });
  }, [rideId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  async function updateStatus(id: string, status: string, notes?: string) {
    setSubmitting(id);
    await fetch(`/api/admin/registrations/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, ...(notes ? { notes } : {}) }),
    });
    fetchData();
    setSubmitting("");
    setRejectId(null);
    setCancelId(null);
    setRejectNote("");
    setCancelNote("");
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

  async function initiateRefund(id: string) {
    if (!confirm("Are you sure you want to refund this rider? The amount will be credited back to their account.")) return;
    setRefunding(id);
    try {
      const res = await fetch(`/api/admin/registrations/${id}/refund`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Refund failed");
      } else {
        alert(`Refund initiated! Refund ID: ${data.refundId}`);
        fetchData();
      }
    } catch {
      alert("Refund failed. Please try again.");
    } finally {
      setRefunding("");
    }
  }

  async function loadRiderHistory(userId: string) {
    if (riderHistory[userId]) return;
    const res = await fetch(`/api/admin/riders/${userId}/history`);
    const data = await res.json();
    setRiderHistory((prev) => ({ ...prev, [userId]: data }));
  }

  async function saveLinks() {
    setSavingLinks(true);
    setLinksSaved(false);
    await fetch(`/api/admin/rides/${rideId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(linksForm),
    });
    setRide((prev) => prev ? { ...prev, ...linksForm } : prev);
    setSavingLinks(false);
    setLinksSaved(true);
    setTimeout(() => setLinksSaved(false), 3000);
  }

  if (loading) return <div className="text-muted py-12 text-center">Loading...</div>;
  if (!ride) return <div className="text-error py-12 text-center">Ride not found</div>;

  const confirmedCount = registrations.filter((r) => r.status === "confirmed" || r.status === "checked_in").length;
  const uniqueRiders = new Map<string, Registration>();
  registrations.forEach((r) => {
    const existing = uniqueRiders.get(r.user.id);
    if (!existing || new Date(r.createdAt) > new Date(existing.createdAt)) {
      uniqueRiders.set(r.user.id, r);
    }
  });
  const latestPerRider = Array.from(uniqueRiders.values());

  return (
    <div className="space-y-6">
      <Link href="/admin/rides" className="inline-flex items-center gap-1 text-sm text-muted hover:text-orange transition-colors">
        <ChevronLeft className="w-4 h-4" /> Back to Rides
      </Link>

      <div className="bg-surface border border-border rounded-sm p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="font-heading text-2xl font-bold">{ride.title}</h1>
            <div className="flex flex-wrap gap-4 text-sm text-muted mt-2">
              <span>{formatDate(ride.startDate)}</span>
              <span>{ride.location}</span>
              <span className="text-orange font-semibold">{confirmedCount}/{ride.totalSlots} confirmed</span>
              <Badge variant={ride.status === "published" ? "success" : ride.status === "completed" ? "muted" : "warning"}>{ride.status}</Badge>
              {ride.memberDiscount > 0 && <span className="text-success">Members: {ride.memberDiscount}% off</span>}
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="secondary" onClick={() => setShowNotifyModal(true)}>
              <Send className="w-4 h-4 mr-1" /> Notify Riders
            </Button>
            <Button size="sm" variant="outline" onClick={async () => {
              const res = await fetch(`/api/admin/rides/${rideId}/duplicate`, { method: "POST" });
              const data = await res.json();
              if (res.ok) router.push(`/admin/rides/${data.ride.id}/edit`);
            }}>
              <Copy className="w-4 h-4 mr-1" /> Duplicate
            </Button>
            {ride.status === "completed" && (
              <>
                <Button size="sm" variant="secondary" onClick={async () => {
                  const res = await fetch(`/api/admin/rides/${rideId}/create-survey`, { method: "POST" });
                  const data = await res.json();
                  if (res.ok) alert(`Survey created! ${data.notified} riders notified.`);
                  else alert(data.error || "Failed");
                }}>
                  <ClipboardList className="w-4 h-4 mr-1" /> Send Survey
                </Button>
                <Button size="sm" variant="secondary" onClick={async () => {
                  const res = await fetch(`/api/admin/rides/${rideId}/generate-certificates`, { method: "POST" });
                  const data = await res.json();
                  if (res.ok) alert(`${data.certificatesGenerated} certificates generated!`);
                  else alert(data.error || "Failed");
                }}>
                  <Award className="w-4 h-4 mr-1" /> Certificates
                </Button>
              </>
            )}
            <Link href={`/admin/rides/${ride.id}/edit`}>
              <Button size="sm" variant="outline"><Edit className="w-4 h-4 mr-1" /> Edit</Button>
            </Link>
            <Button size="sm" variant="danger" onClick={() => setShowDeleteConfirm(true)}>
              <Trash2 className="w-4 h-4 mr-1" /> Delete
            </Button>
          </div>
        </div>
      </div>

      {/* Links & Media */}
      <div className="bg-surface border border-border rounded-sm p-6 space-y-4">
        <h2 className="font-heading text-lg font-semibold flex items-center gap-2">
          <LinkIcon className="w-5 h-5 text-orange" /> Links & Media
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-foreground block mb-1.5">WhatsApp Group Link</label>
            <input
              type="text"
              value={linksForm.whatsappGroupLink}
              onChange={(e) => setLinksForm((p) => ({ ...p, whatsappGroupLink: e.target.value }))}
              placeholder="https://chat.whatsapp.com/..."
              className="w-full px-3 py-2 bg-background border border-border rounded-sm text-sm text-foreground focus:border-orange focus:outline-none"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground block mb-1.5">Photos/Videos Link</label>
            <input
              type="text"
              value={linksForm.photosLink}
              onChange={(e) => setLinksForm((p) => ({ ...p, photosLink: e.target.value }))}
              placeholder="https://drive.google.com/..."
              className="w-full px-3 py-2 bg-background border border-border rounded-sm text-sm text-foreground focus:border-orange focus:outline-none"
            />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button size="sm" onClick={saveLinks} loading={savingLinks}>Save Links</Button>
          {linksSaved && <span className="text-sm text-success">Saved!</span>}
        </div>
      </div>

      {/* Registrations */}
      <div className="bg-surface border border-border rounded-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-border flex items-center justify-between">
          <h2 className="font-heading text-lg font-semibold">Registrations ({latestPerRider.length} riders)</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-surface-light text-left text-muted text-xs uppercase tracking-wider">
                <th className="px-5 py-3"></th>
                <th className="px-5 py-3">Rider</th>
                <th className="px-5 py-3">Phone</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Payment</th>
                <th className="px-5 py-3">Transaction</th>
                <th className="px-5 py-3">Date</th>
                <th className="px-5 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {latestPerRider.map((reg) => (
                <>
                  <tr key={reg.id} className="hover:bg-surface-light/50">
                    <td className="px-3 py-3">
                      <button
                        onClick={() => {
                          const newId = expandedRider === reg.user.id ? null : reg.user.id;
                          setExpandedRider(newId);
                          if (newId) loadRiderHistory(newId);
                        }}
                        className="p-1 text-muted hover:text-orange transition-colors"
                      >
                        {expandedRider === reg.user.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </td>
                    <td className="px-5 py-3">
                      <Link href={`/admin/riders/${reg.user.id}`} className="group">
                        <div className="font-medium group-hover:text-orange transition-colors">{reg.user.name || "—"}</div>
                        <div className="text-xs text-muted">{reg.user.email}</div>
                      </Link>
                    </td>
                    <td className="px-5 py-3 text-muted">{reg.user.phone || "—"}</td>
                    <td className="px-5 py-3">
                      <Badge variant={statusVariant[reg.status] || "muted"}>{reg.status}</Badge>
                      {reg.notes && reg.status === "rejected" && (
                        <p className="text-xs text-error/70 mt-1 max-w-[150px] truncate" title={reg.notes}>{reg.notes}</p>
                      )}
                      {reg.notes && reg.status === "cancelled" && (
                        <p className="text-xs text-muted mt-1 max-w-[150px] truncate" title={reg.notes}>{reg.notes}</p>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      <Badge variant={reg.paymentStatus === "paid" ? "success" : "warning"}>
                        {reg.paymentStatus}
                      </Badge>
                    </td>
                    <td className="px-5 py-3">
                      {reg.paymentId ? (
                        <span className="text-xs font-mono text-success">{reg.paymentId}</span>
                      ) : reg.paymentProof ? (
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
                            <Button size="sm" variant="primary" loading={submitting === reg.id} onClick={() => updateStatus(reg.id, "confirmed")}>
                              <Check className="w-3.5 h-3.5 mr-1" /> Approve
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => setRejectId(reg.id)}>
                              <X className="w-3.5 h-3.5 mr-1" /> Reject
                            </Button>
                          </>
                        )}
                        {(reg.status === "confirmed" || reg.status === "checked_in") && (
                          <Button size="sm" variant="outline" onClick={() => setCancelId(reg.id)}>
                            Cancel
                          </Button>
                        )}
                        {(reg.status === "confirmed" || reg.status === "checked_in") && reg.paymentId && reg.paymentStatus !== "refunded" && (
                          <Button size="sm" variant="outline" loading={refunding === reg.id} onClick={() => initiateRefund(reg.id)}>
                            Refund
                          </Button>
                        )}
                        {reg.paymentStatus !== "paid" && reg.status !== "rejected" && reg.status !== "cancelled" && (
                          <Button size="sm" variant="secondary" loading={submitting === reg.id} onClick={() => updatePayment(reg.id, "paid")}>
                            Mark Paid
                          </Button>
                        )}
                      </div>

                      {rejectId === reg.id && (
                        <div className="mt-3 space-y-2 max-w-xs">
                          <Textarea id={`reject-${reg.id}`} label="Rejection reason" placeholder="Enter reason..." value={rejectNote} onChange={(e) => setRejectNote(e.target.value)} />
                          <div className="flex gap-2">
                            <Button size="sm" variant="primary" loading={submitting === reg.id} onClick={() => updateStatus(reg.id, "rejected", rejectNote)}>Confirm Reject</Button>
                            <Button size="sm" variant="ghost" onClick={() => { setRejectId(null); setRejectNote(""); }}>Cancel</Button>
                          </div>
                        </div>
                      )}

                      {cancelId === reg.id && (
                        <div className="mt-3 space-y-2 max-w-xs">
                          <Textarea id={`cancel-${reg.id}`} label="Cancellation note" placeholder="Rider requested cancellation..." value={cancelNote} onChange={(e) => setCancelNote(e.target.value)} />
                          <div className="flex gap-2">
                            <Button size="sm" variant="primary" loading={submitting === reg.id} onClick={() => updateStatus(reg.id, "cancelled", cancelNote)}>Confirm Cancel</Button>
                            <Button size="sm" variant="ghost" onClick={() => { setCancelId(null); setCancelNote(""); }}>Back</Button>
                          </div>
                        </div>
                      )}
                    </td>
                  </tr>

                  {expandedRider === reg.user.id && (
                    <tr key={`history-${reg.user.id}`}>
                      <td colSpan={8} className="bg-background/50 px-8 py-4">
                        <h4 className="font-heading text-sm font-semibold text-tan mb-3">Registration History — {reg.user.name}</h4>
                        {!riderHistory[reg.user.id] ? (
                          <p className="text-sm text-muted">Loading...</p>
                        ) : (
                          <div className="space-y-2">
                            {riderHistory[reg.user.id].registrations.map((h) => (
                              <div key={h.id} className="flex items-center gap-3 text-xs border-b border-border/50 pb-2">
                                <Badge variant={statusVariant[h.status] || "muted"} className="text-[10px]">{h.status}</Badge>
                                <span className="text-foreground">{h.ride?.title || h.training?.title || "—"}</span>
                                <span className="text-muted">{formatPrice(h.amount)}</span>
                                <span className="text-muted">{new Date(h.createdAt).toLocaleDateString()}</span>
                                {h.notes && <span className="text-muted italic truncate max-w-[200px]" title={h.notes}>Note: {h.notes}</span>}
                              </div>
                            ))}
                            {riderHistory[reg.user.id].registrations.length === 0 && (
                              <p className="text-xs text-muted">No history found.</p>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  )}
                </>
              ))}
              {latestPerRider.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-5 py-12 text-center text-muted">No registrations yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showNotifyModal && (
        <NotifyRidersModal
          rideId={ride.id}
          rideTitle={ride.title}
          onClose={() => setShowNotifyModal(false)}
        />
      )}

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-surface border border-border rounded-sm max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-heading text-lg font-semibold text-error">Delete Ride</h3>
              <button onClick={() => setShowDeleteConfirm(false)} className="text-muted hover:text-foreground transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-muted">
              Are you sure you want to delete <strong className="text-foreground">{ride.title}</strong>?
            </p>
            {confirmedCount > 0 && new Date(ride.startDate) > new Date() && (
              <div className="bg-error/10 border border-error/30 rounded-sm p-3">
                <p className="text-error text-sm font-medium">{confirmedCount} confirmed rider(s) will be notified via email about the cancellation.</p>
              </div>
            )}
            <p className="text-xs text-muted">This action cannot be undone. All registrations for this ride will also be deleted.</p>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" size="sm" onClick={() => setShowDeleteConfirm(false)} disabled={deleting}>
                Cancel
              </Button>
              <Button
                size="sm"
                variant="danger"
                loading={deleting}
                onClick={async () => {
                  setDeleting(true);
                  await fetch(`/api/admin/rides/${rideId}`, { method: "DELETE" });
                  router.push("/admin/rides");
                }}
              >
                Delete Ride
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
