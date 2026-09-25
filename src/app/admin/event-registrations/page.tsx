"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { formatPrice } from "@/lib/utils";

interface EventRegistrationRow {
  id: string;
  eventSlug: string;
  category: string;
  categoryName: string;
  amount: number;
  currency: string;
  paymentStatus: string;
  razorpayOrderId: string | null;
  razorpayPaymentId: string | null;
  name: string;
  email: string;
  phone: string;
  city: string | null;
  bikeMake: string | null;
  bikeModel: string | null;
  experience: string | null;
  notes: string | null;
  createdAt: string;
  user: { id: string; name: string | null; email: string; phone: string | null };
}

const PAYMENT_VARIANTS: Record<string, "success" | "warning" | "error"> = {
  paid: "success",
  pending: "warning",
  cancelled: "error",
};

export default function AdminEventRegistrationsPage() {
  const [rows, setRows] = useState<EventRegistrationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [categoryFilter, setCategoryFilter] = useState<string>("");

  useEffect(() => {
    const qs = new URLSearchParams();
    if (statusFilter) qs.set("paymentStatus", statusFilter);
    if (categoryFilter) qs.set("category", categoryFilter);
    setLoading(true);
    fetch(`/api/admin/event-registrations?${qs}`)
      .then((r) => r.json())
      .then((data) => {
        setRows(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [statusFilter, categoryFilter]);

  const totals = {
    all: rows.length,
    paid: rows.filter((r) => r.paymentStatus === "paid").length,
    pending: rows.filter((r) => r.paymentStatus === "pending").length,
    revenue: rows.filter((r) => r.paymentStatus === "paid").reduce((s, r) => s + r.amount, 0),
  };

  return (
    <div className="p-6 sm:p-8">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-heading text-2xl sm:text-3xl font-bold uppercase tracking-tight">
            Event Registrations
          </h1>
          <p className="text-sm text-muted mt-1">All race and event entries — Ultimate Rider first.</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-background border border-border px-3 py-2 text-sm"
          >
            <option value="">All categories</option>
            <option value="amateurs">Amateurs</option>
            <option value="professionals">Professionals</option>
            <option value="women">Women Category</option>
            <option value="big-bikes">Big Bikes</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-background border border-border px-3 py-2 text-sm"
          >
            <option value="">All statuses</option>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Summary tiles */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <SummaryTile label="Total" value={String(totals.all)} />
        <SummaryTile label="Paid" value={String(totals.paid)} accent />
        <SummaryTile label="Pending" value={String(totals.pending)} />
        <SummaryTile label="Revenue (paid)" value={formatPrice(totals.revenue)} accent />
      </div>

      {loading ? (
        <p className="text-muted">Loading registrations…</p>
      ) : rows.length === 0 ? (
        <div className="border border-border p-8 text-center text-muted">
          No registrations yet.
        </div>
      ) : (
        <div className="border border-border overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-surface border-b border-border">
              <tr className="text-left">
                <Th>Date</Th>
                <Th>Rider</Th>
                <Th>Contact</Th>
                <Th>Category</Th>
                <Th>Amount</Th>
                <Th>Status</Th>
                <Th>Bike</Th>
                <Th>Payment ID</Th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-b border-border hover:bg-surface/50">
                  <Td>
                    <span className="font-mono text-xs">
                      {new Date(r.createdAt).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "2-digit",
                      })}
                      <br />
                      <span className="text-muted">
                        {new Date(r.createdAt).toLocaleTimeString("en-IN", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </span>
                  </Td>
                  <Td>
                    <div className="font-semibold">{r.name}</div>
                    <div className="text-xs text-muted">{r.city ?? "—"}</div>
                  </Td>
                  <Td>
                    <div className="text-xs">{r.email}</div>
                    <div className="text-xs text-muted">{r.phone}</div>
                  </Td>
                  <Td>
                    <Badge variant="orange">{r.categoryName}</Badge>
                    <div className="text-xs text-muted mt-1">{r.experience ?? "—"}</div>
                  </Td>
                  <Td>
                    <span className="font-heading font-bold">{formatPrice(r.amount)}</span>
                  </Td>
                  <Td>
                    <Badge variant={PAYMENT_VARIANTS[r.paymentStatus] ?? "muted"}>
                      {r.paymentStatus}
                    </Badge>
                  </Td>
                  <Td>
                    <div className="text-xs">{r.bikeMake ?? "—"}</div>
                    <div className="text-xs text-muted">{r.bikeModel ?? ""}</div>
                  </Td>
                  <Td>
                    <span className="font-mono text-[10px] break-all text-muted">
                      {r.razorpayPaymentId ?? "—"}
                    </span>
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function SummaryTile({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="border border-border p-4 bg-background">
      <div className="font-mono text-[10px] uppercase tracking-widest text-muted">{label}</div>
      <div className={`font-heading text-2xl font-bold mt-2 ${accent ? "text-orange" : ""}`}>
        {value}
      </div>
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="px-4 py-3 font-mono text-[10px] uppercase tracking-widest text-muted font-medium">
      {children}
    </th>
  );
}

function Td({ children }: { children: React.ReactNode }) {
  return <td className="px-4 py-3 align-top">{children}</td>;
}
