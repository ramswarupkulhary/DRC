"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { X, CheckCircle2, Clock3, IdCard, Users, Bike } from "lucide-react";
import { CouponInput, type AppliedCoupon } from "@/components/payments/CouponInput";
import { IndemnityWaiverModal } from "@/components/waiver/IndemnityWaiverModal";
import {
    formatINR,
    computeProgramPrice,
    type Program,
} from "@/lib/programs";

declare global {
    interface Window {
        Razorpay: new (options: Record<string, unknown>) => { open: () => void };
    }
}

interface Props {
    program: Program;
    onClose: () => void;
}

interface CompanionRow {
    label: string;
    type: "person" | "kid";
    firstName: string;
    lastName: string;
    phone: string;
}

export function ProgramBookingModal({ program, onClose }: Props) {
    const { status: authStatus } = useSession();
    const router = useRouter();

    const [persons, setPersons] = useState(0);
    const [kids, setKids] = useState(0);
    const [lunch, setLunch] = useState(false);
    const [paying, setPaying] = useState(false);
    const [error, setError] = useState("");
    const [bookingId, setBookingId] = useState<string | null>(null);

    const [companions, setCompanions] = useState<CompanionRow[]>([]);
    const [savingCompanions, setSavingCompanions] = useState(false);
    const [companionsSaved, setCompanionsSaved] = useState(false);
    const [showWaiver, setShowWaiver] = useState(false);
    const [waiverSigned, setWaiverSigned] = useState(false);
    const [coupon, setCoupon] = useState<AppliedCoupon | null>(null);
    const [bikes, setBikes] = useState<{ id: string; name: string; price: number }[]>([]);
    const [bikeId, setBikeId] = useState<string | null>(null); // null = own bike

    useEffect(() => {
        fetch("/api/programs/bikes")
            .then((r) => r.json())
            .then((d) => setBikes(d.bikes || []))
            .catch(() => { });
    }, []);

    const bikePrice = bikes.find((b) => b.id === bikeId)?.price ?? 0;

    const total = useMemo(
        () => computeProgramPrice(program, { persons, kids, lunch, bikePrice }),
        [program, persons, kids, lunch, bikePrice]
    );
    const payable = coupon?.finalAmount ?? total;

    const buildCompanionRows = useCallback((): CompanionRow[] => {
        const rows: CompanionRow[] = [];
        for (let i = 0; i < persons; i++) {
            rows.push({ label: `Person ${i + 1}`, type: "person", firstName: "", lastName: "", phone: "" });
        }
        for (let i = 0; i < kids; i++) {
            rows.push({ label: `Kid ${i + 1}`, type: "kid", firstName: "", lastName: "", phone: "" });
        }
        return rows;
    }, [persons, kids]);

    const totalCompanions = persons + kids;

    const handlePay = useCallback(async () => {
        setPaying(true);
        setError("");
        try {
            // 100%-off coupon → no payment needed, book directly.
            if (payable === 0) {
                const res = await fetch("/api/programs/free-checkout", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ programSlug: program.slug, persons, kids, lunch, couponCode: coupon?.code ?? null, bikeId }),
                });
                const data = await res.json();
                if (res.ok) {
                    setBookingId(data.bookingId);
                    setCompanions(buildCompanionRows());
                } else {
                    setError(data.error || "Could not complete booking.");
                }
                setPaying(false);
                return;
            }

            const orderRes = await fetch("/api/programs/create-order", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ programSlug: program.slug, persons, kids, lunch, couponCode: coupon?.code ?? null, bikeId }),
            });
            if (!orderRes.ok) {
                const err = await orderRes.json();
                setError(err.error || "Could not start payment.");
                setPaying(false);
                return;
            }
            const { orderId, amount: finalAmount, key } = await orderRes.json();

            if (!window.Razorpay) {
                const script = document.createElement("script");
                script.src = "https://checkout.razorpay.com/v1/checkout.js";
                script.async = true;
                await new Promise((resolve, reject) => {
                    script.onload = resolve;
                    script.onerror = reject;
                    document.body.appendChild(script);
                });
            }

            const options = {
                key,
                amount: finalAmount * 100,
                currency: "INR",
                name: "Dirt Ride Camp",
                description: program.name,
                order_id: orderId,
                theme: { color: "#E8622C" },
                handler: async (response: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => {
                    const verifyRes = await fetch("/api/programs/verify", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ ...response, programSlug: program.slug, persons, kids, lunch, couponCode: coupon?.code ?? null, bikeId }),
                    });
                    if (verifyRes.ok) {
                        const { bookingId: id } = await verifyRes.json();
                        setBookingId(id);
                        setCompanions(buildCompanionRows());
                    } else {
                        setError("Payment verification failed. Please contact support with your payment ID.");
                        setPaying(false);
                    }
                },
                modal: { ondismiss: () => setPaying(false) },
            };

            const rzp = new window.Razorpay(options);
            rzp.open();
        } catch {
            setError("Payment failed. Please try again.");
            setPaying(false);
        }
    }, [program, persons, kids, lunch, coupon, payable, bikeId, buildCompanionRows]);

    const saveCompanions = useCallback(async () => {
        if (!bookingId) return;
        setSavingCompanions(true);
        try {
            const res = await fetch(`/api/programs/${bookingId}/companions`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    companions: companions
                        .filter((c) => c.firstName.trim())
                        .map((c) => ({ firstName: c.firstName, lastName: c.lastName, phone: c.phone, type: c.type })),
                }),
            });
            if (res.ok) setCompanionsSaved(true);
        } finally {
            setSavingCompanions(false);
        }
    }, [bookingId, companions]);

    function updateCompanion(i: number, field: keyof CompanionRow, value: string) {
        setCompanions((prev) => prev.map((c, idx) => (idx === i ? { ...c, [field]: value } : c)));
    }

    return (
        <div className="fixed inset-x-0 bottom-0 top-16 sm:top-20 z-40 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={onClose}>
            <div className="bg-surface border border-border rounded-sm w-full max-w-2xl max-h-full overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between px-6 py-4 border-b border-border sticky top-0 bg-surface z-10">
                    <div>
                        <p className="text-xs text-muted uppercase tracking-wider">Book a Program</p>
                        <h3 className="font-heading text-lg font-bold text-foreground">{program.name}</h3>
                    </div>
                    <button onClick={onClose} className="p-1 text-muted hover:text-foreground transition-colors" aria-label="Close">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="px-6 py-6 space-y-5">
                    {error && <div className="bg-error/10 border border-error/30 text-error text-sm p-3 rounded-sm">{error}</div>}

                    {authStatus !== "authenticated" && !bookingId && (
                        <div className="text-center space-y-4 py-6">
                            <Users className="w-12 h-12 text-orange mx-auto" />
                            <h4 className="font-heading text-xl font-bold">Log in to book</h4>
                            <p className="text-sm text-muted max-w-sm mx-auto">
                                Bookings are tied to your DRC account so we already have your rider details. Please log in or create an account to continue.
                            </p>
                            <Button size="lg" onClick={() => router.push("/login?redirect=/programs")}>Log in / Sign up</Button>
                        </div>
                    )}

                    {authStatus === "authenticated" && !bookingId && (
                        <>
                            <div className="bg-background border border-border rounded-sm p-4">
                                <p className="text-xs text-muted uppercase tracking-wider">Rider fee</p>
                                <p className="text-sm text-foreground/70 mt-1">{program.duration} · {program.difficulty}</p>
                            </div>

                            {program.supportsCompanions && (
                                <div className="space-y-4">
                                    <p className="text-sm font-medium text-tan-light">Bring family & friends (optional)</p>

                                    {program.note && (
                                        <div className="flex items-start gap-2 bg-orange/10 border border-orange/30 rounded-sm p-3 text-xs text-foreground/85">
                                            <IdCard className="w-4 h-4 text-orange shrink-0 mt-0.5" />
                                            <span>{program.note}</span>
                                        </div>
                                    )}

                                    <div className="flex items-center justify-between gap-3 bg-background border border-border rounded-sm p-3">
                                        <div>
                                            <p className="text-sm text-foreground">Persons (adults, above 8 yrs)</p>
                                            <p className="text-xs text-muted">{formatINR(program.personPrice ?? 0)} each</p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <button type="button" onClick={() => setPersons((n) => Math.max(0, n - 1))} className="w-10 h-10 rounded-sm border border-border text-lg hover:border-orange/50">−</button>
                                            <span className="font-heading text-xl font-bold w-8 text-center">{persons}</span>
                                            <button type="button" onClick={() => setPersons((n) => Math.min(30, n + 1))} className="w-10 h-10 rounded-sm border border-border text-lg hover:border-orange/50">+</button>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between gap-3 bg-background border border-border rounded-sm p-3">
                                        <div>
                                            <p className="text-sm text-foreground">Kids (8 yrs &amp; under)</p>
                                            <p className="text-xs text-muted">{formatINR(program.kidPrice ?? 0)} each</p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <button type="button" onClick={() => setKids((n) => Math.max(0, n - 1))} className="w-10 h-10 rounded-sm border border-border text-lg hover:border-orange/50">−</button>
                                            <span className="font-heading text-xl font-bold w-8 text-center">{kids}</span>
                                            <button type="button" onClick={() => setKids((n) => Math.min(30, n + 1))} className="w-10 h-10 rounded-sm border border-border text-lg hover:border-orange/50">+</button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {program.optionalLunch ? (
                                <label className="flex items-center gap-3 p-3 bg-background border border-border rounded-sm cursor-pointer">
                                    <input type="checkbox" checked={lunch} onChange={(e) => setLunch(e.target.checked)} className="w-4 h-4 accent-orange" />
                                    <span className="text-sm text-foreground">Add lunch (+{formatINR(program.optionalLunch)})</span>
                                </label>
                            ) : null}

                            {program.requiresRiding !== false && (
                                <div>
                                    <p className="text-sm font-medium text-tan-light mb-2 flex items-center gap-1.5"><Bike className="w-4 h-4 text-orange" /> Bike</p>
                                    <div className="grid grid-cols-1 gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setBikeId(null)}
                                            className={`flex items-center justify-between px-4 py-3 rounded-sm border text-left transition-colors ${bikeId === null ? "border-orange bg-orange/10" : "border-border bg-background hover:border-orange/40"}`}
                                        >
                                            <span className="text-sm text-foreground">I&apos;ll bring my own bike</span>
                                            <span className="font-heading font-bold text-success">Free</span>
                                        </button>
                                        {bikes.map((b) => (
                                            <button
                                                key={b.id}
                                                type="button"
                                                onClick={() => setBikeId(b.id)}
                                                className={`flex items-center justify-between px-4 py-3 rounded-sm border text-left transition-colors ${bikeId === b.id ? "border-orange bg-orange/10" : "border-border bg-background hover:border-orange/40"}`}
                                            >
                                                <span className="text-sm text-foreground">Rent {b.name}</span>
                                                <span className="font-heading font-bold text-orange">+{formatINR(b.price)}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <CouponInput amount={total} discountBase={program.price} onChange={setCoupon} />

                            <div className="border-t border-border pt-4 space-y-1">
                                {coupon && (
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-muted">Subtotal</span>
                                        <span className="text-muted line-through">{formatINR(total)}</span>
                                    </div>
                                )}
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted uppercase tracking-wider">Total</span>
                                    <span className="font-heading text-3xl font-bold text-orange">{formatINR(payable)}</span>
                                </div>
                            </div>

                            <Button size="lg" className="w-full" loading={paying} onClick={handlePay}>
                                {payable === 0 ? "Book for Free" : `Pay ${formatINR(payable)} & Book`}
                            </Button>
                            <p className="text-[11px] text-muted text-center">
                                Secure payment via Razorpay (GPay, PhonePe, Paytm, cards, UPI). Your booking is confirmed after payment and reviewed by our team.
                            </p>
                        </>
                    )}

                    {bookingId && (
                        <div className="space-y-5">
                            <div className="text-center space-y-2">
                                <CheckCircle2 className="w-14 h-14 text-success mx-auto" />
                                <h4 className="font-heading text-2xl font-bold">Payment Successful!</h4>
                                <div className="inline-flex items-center gap-2 text-sm text-warning bg-warning/10 border border-warning/30 rounded-sm px-3 py-1.5">
                                    <Clock3 className="w-4 h-4" /> Awaiting approval from admin
                                </div>
                            </div>

                            {totalCompanions > 0 && !companionsSaved && (
                                <div className="space-y-4">
                                    <div className="flex items-start gap-2 bg-orange/10 border border-orange/20 rounded-sm p-3 text-xs text-foreground/80">
                                        <IdCard className="w-4 h-4 text-orange shrink-0 mt-0.5" />
                                        <span>Please add your companions&apos; details. Everyone must carry a valid government ID — DigiLocker is also accepted.</span>
                                    </div>
                                    {companions.map((c, i) => (
                                        <div key={i} className="bg-background border border-border rounded-sm p-3 space-y-2">
                                            <p className="text-xs font-semibold text-orange uppercase tracking-wide">{c.label}</p>
                                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                                <Input id={`fn-${i}`} placeholder="First name" value={c.firstName} onChange={(e) => updateCompanion(i, "firstName", e.target.value)} />
                                                <Input id={`ln-${i}`} placeholder="Last name" value={c.lastName} onChange={(e) => updateCompanion(i, "lastName", e.target.value)} />
                                                <Input id={`ph-${i}`} placeholder="Phone (optional)" value={c.phone} onChange={(e) => updateCompanion(i, "phone", e.target.value)} />
                                            </div>
                                        </div>
                                    ))}
                                    <div className="flex gap-2">
                                        <Button className="flex-1" loading={savingCompanions} onClick={saveCompanions}>Save Companions</Button>
                                        <Button variant="outline" onClick={() => router.push("/my-programs")}>Do it later</Button>
                                    </div>
                                </div>
                            )}

                            {(companionsSaved || totalCompanions === 0) && (
                                <div className="text-center space-y-3">
                                    <p className="text-sm text-muted">
                                        {companionsSaved ? "Companion details saved. " : ""}You can view your booking status anytime.
                                    </p>
                                    {!waiverSigned ? (
                                        <div className="bg-orange/10 border border-orange/30 rounded-sm p-4 space-y-3 text-left">
                                            <p className="text-sm text-foreground">
                                                One last step — please sign the <strong>liability waiver &amp; indemnity form</strong> before the program.
                                            </p>
                                            <Button className="w-full" onClick={() => setShowWaiver(true)}>Sign Indemnity Waiver</Button>
                                            <button className="text-xs text-muted hover:text-foreground w-full" onClick={() => router.push("/my-programs")}>
                                                I&apos;ll sign it later
                                            </button>
                                        </div>
                                    ) : (
                                        <Button onClick={() => router.push("/my-programs")}>View My Bookings</Button>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {showWaiver && (
                        <IndemnityWaiverModal
                            context={`Program: ${program.name}`}
                            programBookingId={bookingId ?? undefined}
                            onClose={() => setShowWaiver(false)}
                            onSigned={() => {
                                setWaiverSigned(true);
                                setShowWaiver(false);
                            }}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}
