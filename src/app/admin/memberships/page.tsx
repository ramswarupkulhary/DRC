"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { X, UserPlus } from "lucide-react";

interface MembershipUser {
  id: string;
  name: string | null;
  email: string;
  phone: string | null;
  image: string | null;
}

interface MembershipPlan {
  id: string;
  name: string;
  duration: number;
}

interface Membership {
  id: string;
  status: string;
  tshirtSize: string | null;
  paymentProof: string | null;
  rejectionNote?: string | null;
  createdAt: string;
  startDate: string | null;
  endDate: string | null;
  plan: MembershipPlan;
  users: MembershipUser[];
}

const statusVariant: Record<string, "orange" | "success" | "error" | "muted"> = {
  pending: "orange",
  active: "success",
  rejected: "error",
  expired: "muted",
};

export default function AdminMembershipsPage() {
  const searchParams = useSearchParams();
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [loading, setLoading] = useState(true);
  const [rejectionModal, setRejectionModal] = useState<{ id: string; name: string } | null>(null);
  const [rejectionNote, setRejectionNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showAssignForm, setShowAssignForm] = useState(false);
  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [assignForm, setAssignForm] = useState({ email: "", name: "", phone: "", planId: "", durationType: "1year", customDays: "" });
  const [assignError, setAssignError] = useState("");
  const [assignSuccess, setAssignSuccess] = useState("");

  function fetchMemberships() {
    fetch("/api/admin/memberships")
      .then((r) => r.json())
      .then((data) => {
        setMemberships(data.memberships);
        setLoading(false);
      });
  }

  useEffect(() => {
    fetchMemberships();
    if (searchParams.get("assign") === "true") {
      setAssignForm((prev) => ({
        ...prev,
        email: searchParams.get("email") || "",
        name: searchParams.get("name") || "",
        phone: searchParams.get("phone") || "",
      }));
      setShowAssignForm(true);
      fetch("/api/membership/plans").then((r) => r.json()).then((d) => setPlans(d.plans || []));
    }
  }, [searchParams]);

  async function handleApprove(id: string) {
    await fetch("/api/admin/memberships", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status: "active" }),
    });
    fetchMemberships();
  }

  async function handleReject() {
    if (!rejectionModal) return;
    setSubmitting(true);
    await fetch("/api/admin/memberships", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: rejectionModal.id,
        status: "rejected",
        rejectionNote: rejectionNote.trim(),
      }),
    });
    setRejectionModal(null);
    setRejectionNote("");
    setSubmitting(false);
    fetchMemberships();
  }

  async function handleAssign(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setAssignError("");
    setAssignSuccess("");

    const res = await fetch("/api/admin/memberships/assign", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...assignForm,
        customDays: assignForm.customDays ? parseInt(assignForm.customDays) : undefined,
      }),
    });

    const data = await res.json();
    setSubmitting(false);

    if (!res.ok) {
      setAssignError(data.error || "Failed to assign");
      return;
    }

    setAssignSuccess(`Membership assigned to ${assignForm.email}!`);
    setAssignForm({ email: "", name: "", phone: "", planId: "", durationType: "1year", customDays: "" });
    fetchMemberships();
  }

  if (loading) return <div className="text-muted py-12 text-center">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <SectionHeader title="Membership Requests" align="left" />
        <Button
          onClick={() => {
            setShowAssignForm(!showAssignForm);
            if (!showAssignForm && plans.length === 0) {
              fetch("/api/membership/plans").then((r) => r.json()).then((d) => setPlans(d.plans || []));
            }
          }}
        >
          <UserPlus className="w-4 h-4 mr-2" />
          Assign Membership
        </Button>
      </div>

      {showAssignForm && (
        <div className="bg-surface border border-border rounded-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-heading text-lg font-semibold text-tan">Assign Membership</h3>
            <button onClick={() => setShowAssignForm(false)} className="p-1 text-muted hover:text-foreground">
              <X className="w-5 h-5" />
            </button>
          </div>
          {assignError && <div className="bg-error/10 border border-error/30 text-error text-sm p-3 rounded-sm mb-4">{assignError}</div>}
          {assignSuccess && <div className="bg-success/10 border border-success/30 text-success text-sm p-3 rounded-sm mb-4">{assignSuccess}</div>}
          <form onSubmit={handleAssign} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input id="assignName" label="Name" value={assignForm.name} onChange={(e) => setAssignForm((p) => ({ ...p, name: e.target.value }))} required />
            <Input id="assignEmail" label="Email" type="email" value={assignForm.email} onChange={(e) => setAssignForm((p) => ({ ...p, email: e.target.value }))} required />
            <Input id="assignPhone" label="Phone" type="tel" value={assignForm.phone} onChange={(e) => setAssignForm((p) => ({ ...p, phone: e.target.value }))} />
            <Select
              id="assignPlan"
              label="Plan"
              options={[{ value: "", label: "Select plan..." }, ...plans.map((p) => ({ value: p.id, label: p.name }))]}
              value={assignForm.planId}
              onChange={(e) => setAssignForm((p) => ({ ...p, planId: e.target.value }))}
              required
            />
            <Select
              id="assignDuration"
              label="Duration"
              options={[
                { value: "1day", label: "1 Day" },
                { value: "1month", label: "1 Month" },
                { value: "1year", label: "1 Year" },
                { value: "lifetime", label: "Lifetime" },
                { value: "custom", label: "Custom (days)" },
              ]}
              value={assignForm.durationType}
              onChange={(e) => setAssignForm((p) => ({ ...p, durationType: e.target.value }))}
            />
            {assignForm.durationType === "custom" && (
              <Input id="assignCustomDays" label="Custom Days" type="number" value={assignForm.customDays} onChange={(e) => setAssignForm((p) => ({ ...p, customDays: e.target.value }))} required />
            )}
            <div className="sm:col-span-2">
              <Button type="submit" loading={submitting}>Assign & Send Email</Button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-surface border border-border rounded-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-surface-light text-left text-muted text-xs uppercase tracking-wider">
                <th className="px-5 py-3">Rider</th>
                <th className="px-5 py-3">Plan</th>
                <th className="px-5 py-3">T-Shirt Size</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Payment Proof</th>
                <th className="px-5 py-3">Date</th>
                <th className="px-5 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {memberships.map((m) => {
                const user = m.users[0];
                return (
                  <tr key={m.id} className="hover:bg-surface-light/50">
                    <td className="px-5 py-3">
                      <div className="font-medium">{user?.name || "—"}</div>
                      <div className="text-xs text-muted">{user?.email || "—"}</div>
                    </td>
                    <td className="px-5 py-3">{m.plan.name}</td>
                    <td className="px-5 py-3">{m.tshirtSize || "—"}</td>
                    <td className="px-5 py-3">
                      <Badge variant={statusVariant[m.status] || "muted"}>{m.status}</Badge>
                      {m.rejectionNote && (
                        <div className="text-xs text-muted mt-1 max-w-xs truncate" title={m.rejectionNote}>
                          Reason: {m.rejectionNote}
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      {m.paymentProof ? (
                        <a href={m.paymentProof} target="_blank" rel="noopener noreferrer">
                          <img
                            src={m.paymentProof}
                            alt="Payment proof"
                            className="w-12 h-12 object-cover rounded-sm border border-border hover:opacity-80 transition-opacity"
                          />
                        </a>
                      ) : (
                        <span className="text-muted">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-muted text-xs">
                      {new Date(m.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-3">
                      {m.status === "pending" && (
                        <div className="flex gap-2">
                          <Button size="sm" variant="primary" onClick={() => handleApprove(m.id)}>
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setRejectionModal({ id: m.id, name: user?.name || "User" })}
                          >
                            Reject
                          </Button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
              {memberships.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-muted">
                    No membership requests yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Rejection Modal */}
      {rejectionModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-surface border border-border rounded-sm max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-heading text-lg font-semibold">Reject Membership</h3>
              <button
                onClick={() => {
                  setRejectionModal(null);
                  setRejectionNote("");
                }}
                className="text-muted hover:text-foreground transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-sm text-muted">
              Are you sure you want to reject {rejectionModal.name}'s membership application?
            </p>

            <div>
              <label className="text-sm font-medium text-foreground block mb-2">Rejection Reason (Optional)</label>
              <textarea
                value={rejectionNote}
                onChange={(e) => setRejectionNote(e.target.value)}
                placeholder="Let them know why their application was rejected..."
                className="w-full px-3 py-2 bg-background border border-border rounded-sm text-sm text-foreground focus:border-orange focus:outline-none resize-none"
                rows={3}
              />
            </div>

            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setRejectionModal(null);
                  setRejectionNote("");
                }}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button size="sm" variant="danger" onClick={handleReject} loading={submitting}>
                Reject
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
