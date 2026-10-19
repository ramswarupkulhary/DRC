"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Download, Files, Ban } from "lucide-react";

interface EventRegistrationRow {
    id: string;
    eventSlug: string;
    category: string;
    categoryName: string;
    amount: number;
    membershipDiscount: number;
    currency: string;
    paymentStatus: string;
    status: string;
    cancellationReason: string | null;
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
    stayBooked: boolean;
    stayAmount: number;
    registrationType: string;
    attendanceDays: string | null;
    foodPackage: string | null;
    foodAmount: number;
    createdAt: string;
    user: { id: string; name: string | null; email: string; phone: string | null } | null;
}

const PAYMENT_VARIANTS: Record<string, "success" | "warning" | "error"> = {
    paid: "success",
    pending: "warning",
    cancelled: "error",
};

export default function AdminEventRegistrationsPage() {
    const [rows, setRows] = useState<EventRegistrationRow[]>([]);
    const [loading, setLoading] = useState(false);
    const [events, setEvents] = useState<{ id: string; slug: string; title: string }[]>([]);
    const [eventSlug, setEventSlug] = useState("");
    const [categories, setCategories] = useState<{ slug: string; name: string }[]>([]);
    const [typeFilter, setTypeFilter] = useState("");
    const [error, setError] = useState("");
    const [exporting, setExporting] = useState(false);
    const [bookingStatusFilter, setBookingStatusFilter] = useState("");
    const [cancelling, setCancelling] = useState<EventRegistrationRow | null>(null);
    const [cancelReason, setCancelReason] = useState("");
    const [savingCancellation, setSavingCancellation] = useState(false);
    const [statusFilter, setStatusFilter] = useState<string>("");
    const [categoryFilter, setCategoryFilter] = useState<string>("");

    useEffect(() => {
        const controller = new AbortController();
        fetch("/api/admin/events", { signal: controller.signal }).then((response) => {
            if (!response.ok) throw new Error("Could not load events.");
            return response.json();
        }).then((data) => setEvents(Array.isArray(data) ? data : [])).catch((failure) => { if (!controller.signal.aborted) setError(failure.message); });
        return () => controller.abort();
    }, []);

    useEffect(() => {
        if (!eventSlug) return;
        const controller = new AbortController();
        const qs = new URLSearchParams();
        qs.set("eventSlug", eventSlug);
        if (typeFilter) qs.set("registrationType", typeFilter);
        if (statusFilter) qs.set("paymentStatus", statusFilter);
        if (categoryFilter) qs.set("category", categoryFilter);
        if (bookingStatusFilter) qs.set("status", bookingStatusFilter);
        const event = events.find((item) => item.slug === eventSlug);
        if (!event) return;
        Promise.all([
            fetch(`/api/admin/event-registrations?${qs}`, { signal: controller.signal }),
            fetch(`/api/admin/events/${event.id}/categories`, { signal: controller.signal }),
        ]).then(async ([registrationResponse, categoryResponse]) => {
            if (!registrationResponse.ok || !categoryResponse.ok) throw new Error("Could not load event registrations.");
            const [data, eventCategories] = await Promise.all([registrationResponse.json(), categoryResponse.json()]);
            if (!controller.signal.aborted) { setRows(data); setCategories(eventCategories); }
        }).catch((failure) => { if (!controller.signal.aborted) setError(failure.message); })
            .finally(() => { if (!controller.signal.aborted) setLoading(false); });
        return () => controller.abort();
    }, [eventSlug, typeFilter, statusFilter, categoryFilter, bookingStatusFilter, events]);

    function changeFilter(update: () => void) {
        setRows([]);
        setError("");
        setLoading(true);
        update();
    }

    async function exportExcel(format = "xlsx") {
        if (!eventSlug) return;
        setExporting(true);
        setError("");
        try {
            const query = new URLSearchParams({ eventSlug, format });
            if (typeFilter) query.set("registrationType", typeFilter);
            if (statusFilter) query.set("paymentStatus", statusFilter);
            if (categoryFilter) query.set("category", categoryFilter);
            if (bookingStatusFilter) query.set("status", bookingStatusFilter);
            const response = await fetch(`/api/admin/event-registrations?${query}`);
            if (!response.ok) throw new Error("Could not export registrations.");
            const url = URL.createObjectURL(await response.blob());
            const link = document.createElement("a");
            link.href = url;
            link.download = `${eventSlug}-${typeFilter || "all"}-registrations.${format === "category-zip" ? "zip" : "xlsx"}`;
            link.click();
            URL.revokeObjectURL(url);
        } catch (failure) { setError(failure instanceof Error ? failure.message : "Export failed."); }
        finally { setExporting(false); }
    }

    async function cancelRegistration() {
        if (!cancelling) return;
        setSavingCancellation(true);
        try {
            const response = await fetch(`/api/admin/event-registrations/${cancelling.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "cancel", eventSlug, reason: cancelReason }) });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || "Could not cancel registration.");
            setRows((current) => current.map((row) => row.id === cancelling.id ? { ...row, ...data.registration } : row).filter((row) => !bookingStatusFilter || row.status === bookingStatusFilter));
            if (data.notificationSent === false) setError("Registration cancelled without refund, but its email notification failed.");
            setCancelling(null);
        } catch (failure) { setError(failure instanceof Error ? failure.message : "Cancellation failed."); }
        finally { setSavingCancellation(false); }
    }

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
                    <p className="text-sm text-muted mt-1">{events.find((event) => event.slug === eventSlug)?.title || "Select an event"}</p>
                </div>

                <div className="flex flex-wrap gap-2">
                    <select aria-label="Event" value={eventSlug} onChange={(e) => { changeFilter(() => { setEventSlug(e.target.value); setCategoryFilter(""); setTypeFilter(""); setStatusFilter(""); setBookingStatusFilter(""); setCategories([]); }); if (!e.target.value) setLoading(false); }} className="bg-background border border-border px-3 py-2 text-sm max-w-full">
                        <option value="">Select event</option>
                        {events.map((event) => <option key={event.id} value={event.slug}>{event.title}</option>)}
                    </select>
                    <select aria-label="Registration type" disabled={!eventSlug} value={typeFilter} onChange={(e) => changeFilter(() => { setTypeFilter(e.target.value); setCategoryFilter(""); })} className="bg-background border border-border px-3 py-2 text-sm">
                        <option value="">Riders & spectators</option><option value="rider">Riders</option><option value="spectator">Spectators</option>
                    </select>
                    <select
                        aria-label="Category"
                        disabled={!eventSlug || typeFilter === "spectator"}
                        value={categoryFilter}
                        onChange={(e) => changeFilter(() => setCategoryFilter(e.target.value))}
                        className="bg-background border border-border px-3 py-2 text-sm"
                    >
                        <option value="">All categories</option>
                        {categories.map((category) => <option key={category.slug} value={category.slug}>{category.name}</option>)}
                    </select>
                    <select
                        aria-label="Payment status"
                        disabled={!eventSlug}
                        value={statusFilter}
                        onChange={(e) => changeFilter(() => setStatusFilter(e.target.value))}
                        className="bg-background border border-border px-3 py-2 text-sm"
                    >
                        <option value="">All statuses</option>
                        <option value="paid">Paid</option>
                        <option value="pending">Pending</option>
                        <option value="cancelled">Cancelled</option>
                    </select>
                    <select aria-label="Booking status" disabled={!eventSlug} value={bookingStatusFilter} onChange={(e) => changeFilter(() => setBookingStatusFilter(e.target.value))} className="bg-background border border-border px-3 py-2 text-sm"><option value="">All bookings</option><option value="active">Active</option><option value="cancelled">Cancelled</option></select>
                    <Button onClick={() => exportExcel()} disabled={!eventSlug || loading || exporting} loading={exporting}><Download className="h-4 w-4" />Export Excel</Button>
                    <Button variant="outline" onClick={() => exportExcel("category-zip")} disabled={!eventSlug || loading || exporting}><Files className="h-4 w-4" />Separate category Excels</Button>
                </div>
            </div>

            {error && <p role="alert" className="mb-4 text-error">{error}</p>}
            {eventSlug && <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                <SummaryTile label="Total" value={String(totals.all)} />
                <SummaryTile label="Paid" value={String(totals.paid)} accent />
                <SummaryTile label="Pending" value={String(totals.pending)} />
                <SummaryTile label="Revenue (paid)" value={formatPrice(totals.revenue)} accent />
            </div>}

            {!eventSlug ? <p className="border border-border p-8 text-center text-muted">Select an event to view its registrations.</p> : loading ? (
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
                                <Th>Attendee</Th>
                                <Th>Contact</Th>
                                <Th>Category</Th>
                                <Th>Registration</Th>
                                <Th>Food</Th>
                                <Th>Stay</Th>
                                <Th>Amount</Th>
                                <Th>Booking / Payment</Th>
                                <Th>Bike</Th>
                                <Th>Payment ID</Th>
                                <Th>Actions</Th>
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
                                        <div className="capitalize">{r.registrationType}</div>
                                        {r.attendanceDays && <div className="text-xs text-muted mt-1">{r.attendanceDays}</div>}
                                    </Td>
                                    <Td>
                                        {r.foodPackage ? (
                                            <>
                                                <div>{r.foodPackage}</div>
                                                <div className="text-xs text-muted mt-1">{formatPrice(r.foodAmount)}</div>
                                            </>
                                        ) : <span className="text-xs text-muted">No food</span>}
                                    </Td>
                                    <Td>
                                        {r.stayBooked ? (
                                            <>
                                                <Badge variant="success">Tent booked</Badge>
                                                <div className="text-xs text-muted mt-1">{formatPrice(r.stayAmount)}</div>
                                            </>
                                        ) : <span className="text-xs text-muted">No stay</span>}
                                    </Td>
                                    <Td>
                                        <span className="font-heading font-bold">{formatPrice(r.amount)}</span>
                                        {r.membershipDiscount > 0 && <div className="text-xs text-success mt-1">Member −{formatPrice(r.membershipDiscount)}</div>}
                                    </Td>
                                    <Td>
                                        <div className="mb-1"><Badge variant={r.status === "cancelled" ? "error" : "success"}>{r.status}</Badge></div>
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
                                    <Td>{r.status === "cancelled" ? <span className="text-xs text-muted">Cancelled{r.cancellationReason ? `: ${r.cancellationReason}` : ""}</span> : <button title="Cancel registration without refund" onClick={() => { setCancelling(r); setCancelReason(""); setError(""); }} className="inline-flex items-center gap-1 text-error text-xs"><Ban className="h-4 w-4" />Cancel</button>}</Td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            {cancelling && <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"><div role="dialog" aria-modal="true" aria-labelledby="cancel-registration-title" className="w-full max-w-lg border border-border bg-background p-6 space-y-4"><h2 id="cancel-registration-title" className="font-heading text-xl">Cancel registration?</h2><p>{cancelling.name} · {cancelling.categoryName}</p><p className="text-sm text-warning">This cancels the booking only. No refund will be issued and the payment record will remain unchanged.</p><label className="block text-sm">Reason (optional)<textarea value={cancelReason} onChange={(e) => setCancelReason(e.target.value)} maxLength={2000} className="mt-2 w-full border border-border bg-background p-3" rows={3} /></label><div className="flex flex-wrap gap-3"><Button onClick={cancelRegistration} loading={savingCancellation}><Ban className="h-4 w-4" />Cancel without refund</Button><Button variant="outline" onClick={() => setCancelling(null)} disabled={savingCancellation}>Keep registration</Button></div></div></div>}
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
