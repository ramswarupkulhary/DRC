"use client";

import { useState, useEffect } from "react";
import { formatPrice } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { X, UserPlus } from "lucide-react";

interface Registration {
  id: string;
  amount: number;
  status: string;
  paymentStatus: string;
  createdAt: string;
  user: { name: string | null; email: string; phone: string | null };
  ride: { title: string; startDate: string } | null;
  training: { title: string } | null;
}

interface RideOption {
  id: string;
  title: string;
}

export default function AdminRegistrationsPage() {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [showManualForm, setShowManualForm] = useState(false);
  const [rides, setRides] = useState<RideOption[]>([]);
  const [manualForm, setManualForm] = useState({ rideId: "", name: "", email: "", phone: "" });
  const [submitting, setSubmitting] = useState(false);
  const [manualError, setManualError] = useState("");
  const [manualSuccess, setManualSuccess] = useState("");

  useEffect(() => {
    fetch("/api/admin/registrations")
      .then((r) => r.json())
      .then((data) => { setRegistrations(data); setLoading(false); });
  }, []);

  async function loadRides() {
    const res = await fetch("/api/admin/rides/list");
    if (res.ok) {
      const data = await res.json();
      setRides(data.rides || []);
    }
  }

  async function updateStatus(id: string, field: "status" | "paymentStatus", value: string) {
    await fetch(`/api/admin/registrations/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [field]: value }),
    });
    setRegistrations((prev) =>
      prev.map((r) => (r.id === id ? { ...r, [field]: value } : r))
    );
  }

  async function handleManualSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setManualError("");
    setManualSuccess("");

    const res = await fetch("/api/admin/registrations/manual", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(manualForm),
    });

    const data = await res.json();
    setSubmitting(false);

    if (!res.ok) {
      setManualError(data.error || "Failed to register");
      return;
    }

    setManualSuccess(`Rider registered successfully! Confirmation email sent to ${manualForm.email}`);
    setManualForm({ rideId: "", name: "", email: "", phone: "" });

    fetch("/api/admin/registrations")
      .then((r) => r.json())
      .then((data) => setRegistrations(data));
  }

  const statusVariant: Record<string, "success" | "warning" | "error" | "muted" | "orange"> = {
    confirmed: "success",
    pending: "warning",
    cancelled: "error",
    waitlist: "muted",
    checked_in: "success",
  };

  if (loading) return <div className="text-muted py-12 text-center">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-3xl font-bold">Registrations</h1>
          <p className="text-muted mt-1">{registrations.length} total registrations</p>
        </div>
        <Button
          onClick={() => {
            setShowManualForm(!showManualForm);
            if (!showManualForm && rides.length === 0) loadRides();
          }}
        >
          <UserPlus className="w-4 h-4 mr-2" />
          Manual Registration
        </Button>
      </div>

      {showManualForm && (
        <div className="bg-surface border border-border rounded-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-heading text-lg font-semibold text-tan">Register Rider Manually</h3>
            <button onClick={() => setShowManualForm(false)} className="p-1 text-muted hover:text-foreground">
              <X className="w-5 h-5" />
            </button>
          </div>
          {manualError && <div className="bg-error/10 border border-error/30 text-error text-sm p-3 rounded-sm mb-4">{manualError}</div>}
          {manualSuccess && <div className="bg-success/10 border border-success/30 text-success text-sm p-3 rounded-sm mb-4">{manualSuccess}</div>}
          <form onSubmit={handleManualSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              id="rideId"
              label="Select Ride"
              options={[{ value: "", label: "Choose a ride..." }, ...rides.map((r) => ({ value: r.id, label: r.title }))]}
              value={manualForm.rideId}
              onChange={(e) => setManualForm((p) => ({ ...p, rideId: e.target.value }))}
              required
            />
            <Input id="manualName" label="Rider Name" value={manualForm.name} onChange={(e) => setManualForm((p) => ({ ...p, name: e.target.value }))} required />
            <Input id="manualEmail" label="Email" type="email" value={manualForm.email} onChange={(e) => setManualForm((p) => ({ ...p, email: e.target.value }))} required />
            <Input id="manualPhone" label="Phone" type="tel" value={manualForm.phone} onChange={(e) => setManualForm((p) => ({ ...p, phone: e.target.value }))} />
            <div className="sm:col-span-2">
              <Button type="submit" loading={submitting}>Register & Send Email</Button>
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
                <th className="px-5 py-3">Event</th>
                <th className="px-5 py-3">Amount</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Payment</th>
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
                  <td className="px-5 py-3">{reg.ride?.title || reg.training?.title || "—"}</td>
                  <td className="px-5 py-3 font-semibold text-orange">{formatPrice(reg.amount)}</td>
                  <td className="px-5 py-3">
                    <Badge variant={statusVariant[reg.status] || "muted"}>{reg.status}</Badge>
                  </td>
                  <td className="px-5 py-3">
                    <Badge variant={reg.paymentStatus === "paid" ? "success" : "warning"}>
                      {reg.paymentStatus}
                    </Badge>
                  </td>
                  <td className="px-5 py-3 text-muted text-xs">{new Date(reg.createdAt).toLocaleDateString()}</td>
                  <td className="px-5 py-3">
                    <div className="flex gap-2">
                      {reg.status === "pending" && (
                        <Button size="sm" variant="primary" onClick={() => updateStatus(reg.id, "status", "confirmed")}>
                          Confirm
                        </Button>
                      )}
                      {reg.status !== "cancelled" && (
                        <Button size="sm" variant="outline" onClick={() => updateStatus(reg.id, "status", "cancelled")}>
                          Cancel
                        </Button>
                      )}
                      {reg.paymentStatus !== "paid" && (
                        <Button size="sm" variant="secondary" onClick={() => updateStatus(reg.id, "paymentStatus", "paid")}>
                          Mark Paid
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {registrations.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-muted">
                    No registrations yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
