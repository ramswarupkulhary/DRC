"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { Clock3, CheckCircle2, XCircle, IdCard } from "lucide-react";
import { formatINR, FAMILY_PACKAGES, familyCompanionCount, type FamilyOption } from "@/lib/programs";

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
    rejectionNote: string | null;
    createdAt: string;
    companions: Companion[];
}

interface Row { label: string; type: "friend" | "family"; firstName: string; lastName: string; phone: string }

function statusBadge(status: string) {
    if (status === "approved") return <Badge variant="success"><CheckCircle2 className="w-3.5 h-3.5 mr-1" />Approved</Badge>;
    if (status === "rejected") return <Badge variant="error"><XCircle className="w-3.5 h-3.5 mr-1" />Not Approved</Badge>;
    return <Badge variant="warning"><Clock3 className="w-3.5 h-3.5 mr-1" />Awaiting Approval</Badge>;
}

function buildRows(booking: Booking): Row[] {
    const rows: Row[] = [];
    const fam = booking.familyOption as FamilyOption | null;
    if (fam === "rider_wife" || fam === "rider_wife_children") rows.push({ label: "Spouse", type: "family", firstName: "", lastName: "", phone: "" });
    if (fam === "rider_wife_children") {
        rows.push({ label: "Child 1", type: "family", firstName: "", lastName: "", phone: "" });
        rows.push({ label: "Child 2 (optional)", type: "family", firstName: "", lastName: "", phone: "" });
    }
    for (let i = 0; i < booking.friends; i++) rows.push({ label: `Friend ${i + 1}`, type: "friend", firstName: "", lastName: "", phone: "" });
    // Prefill from saved companions in order.
    booking.companions.forEach((c, i) => {
        if (rows[i]) {
            rows[i].firstName = c.firstName;
            rows[i].lastName = c.lastName || "";
            rows[i].phone = c.phone || "";
        }
    });
    return rows;
}

function CompanionEditor({ booking, onSaved }: { booking: Booking; onSaved: () => void }) {
    const [rows, setRows] = useState<Row[]>(() => buildRows(booking));
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    async function save() {
        setSaving(true);
        try {
            const res = await fetch(`/api/programs/${booking.id}/companions`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    companions: rows.filter((r) => r.firstName.trim()).map((r) => ({ firstName: r.firstName, lastName: r.lastName, phone: r.phone, type: r.type })),
                }),
            });
            if (res.ok) {
                setSaved(true);
                onSaved();
            }
        } finally {
            setSaving(false);
        }
    }

    return (
        <div className="mt-4 border-t border-border pt-4 space-y-3">
            <div className="flex items-start gap-2 bg-orange/10 border border-orange/20 rounded-sm p-3 text-xs text-foreground/80">
                <IdCard className="w-4 h-4 text-orange shrink-0 mt-0.5" />
                <span>Everyone must carry a valid government ID — DigiLocker is also accepted.</span>
            </div>
            {rows.map((r, i) => (
                <div key={i} className="bg-background border border-border rounded-sm p-3 space-y-2">
                    <p className="text-xs font-semibold text-orange uppercase tracking-wide">{r.label}</p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <Input id={`fn-${booking.id}-${i}`} placeholder="First name" value={r.firstName} onChange={(e) => setRows((p) => p.map((x, idx) => idx === i ? { ...x, firstName: e.target.value } : x))} />
                        <Input id={`ln-${booking.id}-${i}`} placeholder="Last name" value={r.lastName} onChange={(e) => setRows((p) => p.map((x, idx) => idx === i ? { ...x, lastName: e.target.value } : x))} />
                        <Input id={`ph-${booking.id}-${i}`} placeholder="Phone (optional)" value={r.phone} onChange={(e) => setRows((p) => p.map((x, idx) => idx === i ? { ...x, phone: e.target.value } : x))} />
                    </div>
                </div>
            ))}
            <Button onClick={save} loading={saving}>{saved ? "Saved" : "Save Companion Details"}</Button>
        </div>
    );
}

export default function MyProgramsPage() {
    const { status } = useSession();
    const router = useRouter();
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);

    const load = useCallback(() => {
        fetch("/api/programs/mine")
            .then((r) => r.json())
            .then((d) => setBookings(d.bookings || []))
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        if (status === "unauthenticated") router.push("/login?redirect=/my-programs");
        if (status === "authenticated") load();
    }, [status, router, load]);

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
            <SectionHeader accent="Your adventures" title="My Program Bookings" align="center" />

            {loading ? (
                <p className="text-center text-muted mt-10">Loading…</p>
            ) : bookings.length === 0 ? (
                <div className="text-center mt-10 space-y-4">
                    <p className="text-muted">You haven&apos;t booked any programs yet.</p>
                    <Button onClick={() => router.push("/programs")}>Browse Programs</Button>
                </div>
            ) : (
                <div className="mt-10 space-y-5">
                    {bookings.map((b) => {
                        const maxCompanions = b.friends + familyCompanionCount(b.familyOption as FamilyOption | null);
                        const famLabel = b.familyOption ? FAMILY_PACKAGES[b.familyOption as FamilyOption]?.label : null;
                        return (
                            <div key={b.id} className="bg-surface border border-border rounded-sm p-6">
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <h3 className="font-heading text-xl font-bold">{b.programName}</h3>
                                        <p className="text-sm text-muted mt-1">
                                            {new Date(b.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                                            {famLabel && ` · ${famLabel}`}
                                            {b.friends > 0 && ` · ${b.friends} friend${b.friends > 1 ? "s" : ""}`}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-heading text-xl font-bold text-orange">{formatINR(b.amount)}</div>
                                        <div className="mt-1">{statusBadge(b.status)}</div>
                                    </div>
                                </div>

                                {b.status === "rejected" && b.rejectionNote && (
                                    <p className="mt-3 text-sm text-error bg-error/10 border border-error/30 rounded-sm p-3">{b.rejectionNote}</p>
                                )}

                                {maxCompanions > 0 && <CompanionEditor booking={b} onSaved={load} />}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
