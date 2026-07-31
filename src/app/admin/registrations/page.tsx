"use client";

import { useState, useEffect } from "react";
import { formatPrice } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

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

export default function AdminRegistrationsPage() {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/registrations")
      .then((r) => r.json())
      .then((data) => { setRegistrations(data); setLoading(false); });
  }, []);

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
      <div>
        <h1 className="font-heading text-3xl font-bold">Registrations</h1>
        <p className="text-muted mt-1">{registrations.length} total registrations</p>
      </div>

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
