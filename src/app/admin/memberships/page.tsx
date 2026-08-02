"use client";

import { useState, useEffect } from "react";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

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
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [loading, setLoading] = useState(true);

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
  }, []);

  async function handleAction(id: string, status: "active" | "rejected") {
    await fetch("/api/admin/memberships", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    fetchMemberships();
  }

  if (loading) return <div className="text-muted py-12 text-center">Loading...</div>;

  return (
    <div className="space-y-6">
      <SectionHeader title="Membership Requests" align="left" />

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
                          <Button size="sm" variant="primary" onClick={() => handleAction(m.id, "active")}>
                            Approve
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleAction(m.id, "rejected")}>
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
    </div>
  );
}
