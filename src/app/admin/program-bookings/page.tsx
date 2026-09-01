"use client";

import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Clock3, CheckCircle2, XCircle, User, Phone, Mail } from "lucide-react";

interface Companion {
    id: string;
    type: string;
    firstName: string;
    lastName: string | null;
    phone: string | null;
}

interface Booking {
    id: string;
    programName: string;
    friends: number;
    familyOption: string | null;
    lunch: boolean;
    amount: number;
    status: string;
    paymentId: string | null;
    rejectionNote: string | null;
    createdAt: string;
    companions: Companion[];
    user: { name: string | null; email: string; phone: string | null };
}

function badge(status: string) {
    if (status === "approved") return <Badge variant="success"><CheckCircle2 className="w-3.5 h-3.5 mr-1" />Approved</Badge>;
    if (status === "rejected") return <Badge variant="error"><XCircle className="w-3.5 h-3.5 mr-1" />Rejected</Badge>;
    return <Badge variant="warning"><Clock3 className="w-3.5 h-3.5 mr-1" />Awaiting</Badge>;
}

export default function AdminProgramBookingsPage() {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<"all" | "awaiting_approval" | "approved" | "rejected">("all");
    const [busy, setBusy] = useState<string | null>(null);

    const load = useCallback(() => {
        fetch("/api/admin/program-bookings")
            .then((r) => r.json())
            .then((d) => setBookings(d.bookings || []))
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => load(), [load]);

    async function act(id: string, action: "approve" | "reject") {
        let rejectionNote: string | undefined;
        if (action === "reject") {
            rejectionNote = window.prompt("Reason for rejection (shown to the rider):") || undefined;
        }
        setBusy(id);
        try {
            const res = await fetch(`/api/admin/program-bookings/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action, rejectionNote }),
            });
            if (res.ok) load();
        } finally {
            setBusy(null);
        }
    }

    const shown = filter === "all" ? bookings : bookings.filter((b) => b.status === filter);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-3">
                <h1 className="font-heading text-2xl font-bold">Program Bookings</h1>
                <div className="flex gap-2">
                    {(["all", "awaiting_approval", "approved", "rejected"] as const).map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`text-xs px-3 py-1.5 rounded-sm border transition-colors ${filter === f ? "border-orange text-orange bg-orange/10" : "border-border text-muted hover:border-orange/40"}`}
                        >
                            {f === "awaiting_approval" ? "Awaiting" : f.charAt(0).toUpperCase() + f.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            {loading ? (
                <p className="text-muted">Loading…</p>
            ) : shown.length === 0 ? (
                <p className="text-muted">No bookings.</p>
            ) : (
                <div className="space-y-4">
                    {shown.map((b) => (
                        <div key={b.id} className="bg-surface border border-border rounded-sm p-5">
                            <div className="flex items-start justify-between gap-4 flex-wrap">
                                <div>
                                    <div className="flex items-center gap-3">
                                        <h3 className="font-heading text-lg font-bold">{b.programName}</h3>
                                        {badge(b.status)}
                                    </div>
                                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-sm text-muted">
                                        <span className="inline-flex items-center gap-1"><User className="w-3.5 h-3.5" />{b.user.name || "—"}</span>
                                        <span className="inline-flex items-center gap-1"><Mail className="w-3.5 h-3.5" />{b.user.email}</span>
                                        {b.user.phone && <span className="inline-flex items-center gap-1"><Phone className="w-3.5 h-3.5" />{b.user.phone}</span>}
                                    </div>
                                    <p className="text-xs text-muted mt-1">
                                        {new Date(b.createdAt).toLocaleString("en-IN")} · Payment: {b.paymentId || "—"}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <div className="font-heading text-xl font-bold text-orange">₹{b.amount.toLocaleString("en-IN")}</div>
                                    {(b.friends > 0 || b.familyOption) && (
                                        <p className="text-xs text-muted mt-1">
                                            {b.familyOption ? b.familyOption.replace(/_/g, " ") : ""}{b.friends > 0 ? ` · ${b.friends} friend(s)` : ""}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {b.companions.length > 0 && (
                                <div className="mt-4 border-t border-border pt-3">
                                    <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">Companions</p>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                        {b.companions.map((c) => (
                                            <div key={c.id} className="text-sm bg-background border border-border rounded-sm px-3 py-1.5">
                                                <span className="text-foreground">{c.firstName} {c.lastName || ""}</span>
                                                <span className="text-xs text-muted ml-2 capitalize">({c.type})</span>
                                                {c.phone && <span className="text-xs text-muted ml-2">{c.phone}</span>}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {b.status === "awaiting_approval" && (
                                <div className="mt-4 flex gap-2">
                                    <Button size="sm" loading={busy === b.id} onClick={() => act(b.id, "approve")}>Approve</Button>
                                    <Button size="sm" variant="danger" disabled={busy === b.id} onClick={() => act(b.id, "reject")}>Reject</Button>
                                </div>
                            )}
                            {b.status === "rejected" && b.rejectionNote && (
                                <p className="mt-3 text-sm text-error">Reason: {b.rejectionNote}</p>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
