"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/Button";
import { ArrowRight, Check, Lock } from "lucide-react";

const categories = [
    { id: "amateurs", name: "Amateurs", fee: 4999, note: "First-timers & club-level riders." },
    { id: "professionals", name: "Professionals", fee: 7999, note: "Championship & podium-level riders." },
    { id: "women", name: "Women Category", fee: 4999, note: "Open to all women riders across skill levels." },
    { id: "big-bikes", name: "Big Bikes", fee: 7999, note: "Adventure & big-capacity motorcycles." },
];

type Status = "idle" | "paying" | "success-paid" | "error";

declare global {
    interface Window {
        Razorpay: new (options: Record<string, unknown>) => { open: () => void };
    }
}

async function ensureRazorpay(): Promise<boolean> {
    if (typeof window === "undefined") return false;
    if (window.Razorpay) return true;
    return new Promise((resolve) => {
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.async = true;
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
    });
}

export default function UltimateRiderRegisterPage() {
    const { data: session, status: authStatus } = useSession();
    const router = useRouter();
    const callbackUrl = "/events/drc-ultimate-rider/register";

    const [category, setCategory] = useState<string>("");
    const [form, setForm] = useState({
        name: "",
        email: "",
        phone: "",
        city: "",
        bikeMake: "",
        bikeModel: "",
        experience: "",
        notes: "",
        agree: false,
    });
    const [status, setStatus] = useState<Status>("idle");
    const [errorMessage, setErrorMessage] = useState<string>("");

    // Prefill name/email from the session so riders don't retype them.
    useEffect(() => {
        if (session?.user) {
            setForm((f) => ({
                ...f,
                name: f.name || session.user?.name || "",
                email: f.email || session.user?.email || "",
            }));
        }
    }, [session]);

    const selected = categories.find((c) => c.id === category);

    function validate(): string | null {
        if (!category) return "Please select a category.";
        if (!form.name || !form.email || !form.phone || !form.city) return "Please fill in all rider details.";
        if (!form.bikeMake || !form.bikeModel) return "Please add your bike make and model.";
        if (!form.experience) return "Please select your experience level.";
        if (!form.agree) return "Please acknowledge the entry terms to continue.";
        return null;
    }

    async function handlePayNow() {
        if (authStatus !== "authenticated") {
            router.push(`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`);
            return;
        }
        const err = validate();
        if (err) {
            setErrorMessage(err);
            return;
        }
        if (!selected) return;
        setStatus("paying");
        setErrorMessage("");

        try {
            const orderRes = await fetch("/api/events/ultimate-rider/create-order", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ category, name: form.name, email: form.email, phone: form.phone }),
            });
            if (!orderRes.ok) {
                const data = await orderRes.json().catch(() => ({}));
                throw new Error(data?.error || "Could not create payment order.");
            }
            const { orderId, amount, key, categoryName } = await orderRes.json();

            const ready = await ensureRazorpay();
            if (!ready) throw new Error("Payment library failed to load. Please try again or check your connection.");

            const options: Record<string, unknown> = {
                key,
                amount: amount * 100,
                currency: "INR",
                name: "DRC Motorsports",
                description: `DRC Ultimate Rider — ${categoryName}`,
                order_id: orderId,
                theme: { color: "#E8622C" },
                prefill: {
                    name: form.name,
                    email: form.email,
                    contact: form.phone,
                },
                notes: {
                    event: "drc-ultimate-rider",
                    category,
                },
                handler: async (response: {
                    razorpay_order_id: string;
                    razorpay_payment_id: string;
                    razorpay_signature: string;
                }) => {
                    try {
                        const verifyRes = await fetch("/api/events/ultimate-rider/verify", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                                ...response,
                                ...form,
                                category,
                            }),
                        });
                        if (!verifyRes.ok) {
                            const data = await verifyRes.json().catch(() => ({}));
                            throw new Error(data?.error || "Payment verification failed.");
                        }
                        setStatus("success-paid");
                    } catch (err) {
                        setStatus("error");
                        setErrorMessage(err instanceof Error ? err.message : "Payment verification failed.");
                    }
                },
                modal: {
                    ondismiss: () => {
                        setStatus("idle");
                    },
                },
            };

            const rzp = new window.Razorpay(options);
            rzp.open();
        } catch (err) {
            setStatus("error");
            setErrorMessage(err instanceof Error ? err.message : "Something went wrong.");
        }
    }

    // Login gate — riders must be signed in before they can register.
    if (authStatus === "loading") {
        return (
            <div className="max-w-3xl mx-auto px-6 lg:px-10 py-32 text-center">
                <p className="font-mono text-xs uppercase tracking-widest text-muted">Checking session…</p>
            </div>
        );
    }
    if (authStatus === "unauthenticated") {
        return (
            <div className="max-w-3xl mx-auto px-6 lg:px-10 py-24 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-orange/10 mb-6">
                    <Lock className="w-7 h-7 text-orange" strokeWidth={2} />
                </div>
                <div className="flex items-center justify-center gap-3 mb-4">
                    <span className="h-px w-10 bg-orange" />
                    <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-orange">Sign in required</span>
                    <span className="h-px w-10 bg-orange" />
                </div>
                <h1 className="font-heading font-bold uppercase text-3xl sm:text-5xl leading-[1] tracking-[-0.01em]">
                    Sign in to register.
                </h1>
                <p className="mt-5 text-muted leading-relaxed max-w-xl mx-auto">
                    Rider registration for <span className="text-foreground font-semibold">DRC Ultimate Rider</span> requires a
                    DRC account &mdash; it&rsquo;s how we confirm your slot, share race-week details and issue your receipt.
                </p>
                <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Link href={`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`}>
                        <Button size="lg" className="uppercase tracking-widest text-sm">
                            Sign in <ArrowRight className="w-4 h-4" />
                        </Button>
                    </Link>
                    <Link
                        href={`/signup?callbackUrl=${encodeURIComponent(callbackUrl)}`}
                        className="font-heading uppercase tracking-widest text-xs text-foreground/70 hover:text-orange transition-colors border-b border-transparent hover:border-orange pb-1"
                    >
                        Create an account &rarr;
                    </Link>
                </div>
            </div>
        );
    }

    if (status === "success-paid") {
        const paid = status === "success-paid";
        return (
            <div className="max-w-3xl mx-auto px-6 lg:px-10 py-20 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-orange/10 mb-6">
                    <Check className="w-8 h-8 text-orange" strokeWidth={2.5} />
                </div>
                <h1 className="font-heading font-bold uppercase text-3xl sm:text-4xl leading-[1] tracking-[-0.01em]">
                    {paid ? "You're in." : "Registration received."}
                </h1>
                <p className="mt-4 text-muted leading-relaxed max-w-xl mx-auto">
                    {paid ? (
                        <>
                            Payment received. Your slot for <span className="text-foreground font-semibold">DRC Ultimate Rider</span>{" "}
                            in the <span className="text-orange font-semibold">{selected?.name}</span> category is{" "}
                            <span className="text-foreground font-semibold">confirmed</span>. A receipt has been sent to{" "}
                            <span className="text-foreground">{form.email}</span>.
                        </>
                    ) : (
                        <>
                            Thank you, <span className="text-foreground font-semibold">{form.name}</span>. We&rsquo;ve received your entry
                            for <span className="text-foreground font-semibold">DRC Ultimate Rider</span> in the{" "}
                            <span className="text-orange font-semibold">{selected?.name}</span> category. Our team will confirm your
                            slot and share payment instructions via email and WhatsApp shortly.
                        </>
                    )}
                </p>
                <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Link href="/events/drc-ultimate-rider">
                        <Button size="lg" className="uppercase tracking-widest text-sm">
                            Back to race brief <ArrowRight className="w-4 h-4" />
                        </Button>
                    </Link>
                    <a
                        href="https://wa.me/919414870102"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-heading uppercase tracking-widest text-xs text-foreground/70 hover:text-orange transition-colors border-b border-transparent hover:border-orange pb-1"
                    >
                        WhatsApp us &rarr;
                    </a>
                </div>
            </div>
        );
    }

    return (
        <div>
            {/* Hero */}
            <section className="border-b border-border">
                <div className="max-w-7xl mx-auto px-6 lg:px-10 pt-20 sm:pt-28 pb-12">
                    <div className="flex items-center gap-3 mb-5">
                        <span className="h-px w-10 bg-orange" />
                        <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-foreground/70">
                            DRC Ultimate Rider &middot; 12&ndash;13 Dec 2026 &middot; Bengaluru
                        </span>
                    </div>
                    <h1 className="font-heading font-bold uppercase text-4xl sm:text-6xl leading-[0.95] tracking-[-0.02em] max-w-4xl">
                        Rider <span className="text-orange">registration</span>.
                    </h1>
                    <p className="mt-6 max-w-2xl text-lg text-muted">
                        Pick your category, fill in your details, and pay to confirm your slot instantly.
                    </p>
                </div>
            </section>

            <form onSubmit={(e) => { e.preventDefault(); handlePayNow(); }} className="max-w-7xl mx-auto px-6 lg:px-10 py-16 grid grid-cols-1 lg:grid-cols-12 gap-12">
                {/* Category selection */}
                <div className="lg:col-span-7 space-y-10">
                    <fieldset>
                        <legend className="flex items-center gap-3 mb-6">
                            <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-orange">Step 01</span>
                            <span className="h-px w-10 bg-orange" />
                            <span className="font-heading text-lg font-bold uppercase tracking-tight">Select category</span>
                        </legend>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {categories.map((c) => {
                                const isSelected = category === c.id;
                                return (
                                    <label
                                        key={c.id}
                                        className={`block p-6 border cursor-pointer transition-colors ${isSelected
                                                ? "border-orange bg-orange/5"
                                                : "border-border bg-background hover:border-tan-dark"
                                            }`}
                                    >
                                        <input
                                            type="radio"
                                            name="category"
                                            value={c.id}
                                            checked={isSelected}
                                            onChange={() => setCategory(c.id)}
                                            className="sr-only"
                                        />
                                        <div className="flex items-start justify-between gap-4">
                                            <div>
                                                <h3 className="font-heading text-xl font-bold uppercase leading-tight">{c.name}</h3>
                                                <p className="text-sm text-muted mt-2 leading-relaxed">{c.note}</p>
                                            </div>
                                            {isSelected && (
                                                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-orange text-white shrink-0">
                                                    <Check className="w-3.5 h-3.5" strokeWidth={3} />
                                                </span>
                                            )}
                                        </div>
                                        <div className="mt-5 pt-5 border-t border-border flex items-baseline justify-between">
                                            <span className="font-mono text-[10px] uppercase tracking-widest text-muted">Entry fee</span>
                                            <span className="font-heading text-2xl font-bold text-orange">
                                                ₹{c.fee.toLocaleString("en-IN")}
                                            </span>
                                        </div>
                                    </label>
                                );
                            })}
                        </div>
                    </fieldset>

                    {/* Rider details */}
                    <fieldset>
                        <legend className="flex items-center gap-3 mb-6">
                            <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-orange">Step 02</span>
                            <span className="h-px w-10 bg-orange" />
                            <span className="font-heading text-lg font-bold uppercase tracking-tight">Rider details</span>
                        </legend>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Field
                                label="Full name"
                                required
                                value={form.name}
                                onChange={(v) => setForm({ ...form, name: v })}
                                placeholder="Your full name"
                            />
                            <Field
                                label="Email"
                                type="email"
                                required
                                value={form.email}
                                onChange={(v) => setForm({ ...form, email: v })}
                                placeholder="you@example.com"
                            />
                            <Field
                                label="Phone (WhatsApp)"
                                type="tel"
                                required
                                value={form.phone}
                                onChange={(v) => setForm({ ...form, phone: v })}
                                placeholder="+91 …"
                            />
                            <Field
                                label="City"
                                required
                                value={form.city}
                                onChange={(v) => setForm({ ...form, city: v })}
                                placeholder="Where you ride from"
                            />
                            <Field
                                label="Bike make"
                                required
                                value={form.bikeMake}
                                onChange={(v) => setForm({ ...form, bikeMake: v })}
                                placeholder="e.g. KTM, Husqvarna, Royal Enfield"
                            />
                            <Field
                                label="Bike model"
                                required
                                value={form.bikeModel}
                                onChange={(v) => setForm({ ...form, bikeModel: v })}
                                placeholder="e.g. 390 Adventure, Himalayan 450"
                            />
                        </div>

                        <div className="mt-4">
                            <label className="block font-mono text-[10px] uppercase tracking-widest text-muted mb-2">
                                Riding experience
                            </label>
                            <select
                                value={form.experience}
                                onChange={(e) => setForm({ ...form, experience: e.target.value })}
                                required
                                className="w-full bg-background border border-border px-4 py-3 text-foreground font-body focus:outline-none focus:border-orange transition-colors"
                            >
                                <option value="">Select…</option>
                                <option value="beginner">Beginner — under 1 year</option>
                                <option value="intermediate">Intermediate — 1 to 3 years</option>
                                <option value="advanced">Advanced — 3+ years</option>
                                <option value="racer">Competitive / Race experience</option>
                            </select>
                        </div>

                        <div className="mt-4">
                            <label className="block font-mono text-[10px] uppercase tracking-widest text-muted mb-2">
                                Anything else we should know
                            </label>
                            <textarea
                                value={form.notes}
                                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                                rows={3}
                                placeholder="Previous races, medical notes, sponsorship interest…"
                                className="w-full bg-background border border-border px-4 py-3 text-foreground font-body focus:outline-none focus:border-orange transition-colors resize-none"
                            />
                        </div>
                    </fieldset>
                </div>

                {/* Summary sidebar */}
                <aside className="lg:col-span-5">
                    <div className="lg:sticky lg:top-24 p-8 border border-border bg-surface">
                        <div className="font-mono text-[10px] uppercase tracking-widest text-orange">Order summary</div>
                        <h3 className="font-heading text-2xl font-bold uppercase mt-3">DRC Ultimate Rider</h3>
                        <p className="font-mono text-[10px] uppercase tracking-widest text-muted mt-1">
                            12&ndash;13 December 2026 &middot; Bengaluru
                        </p>

                        <div className="mt-6 pt-6 border-t border-border space-y-4">
                            <Row k="Category" v={selected?.name ?? "—"} />
                            <Row k="Entry fee" v={selected ? `₹${selected.fee.toLocaleString("en-IN")}` : "—"} highlight />
                            <Row k="Format" v="2 days · Sat + Sun" />
                            <Row k="Prize pool" v="₹5,00,000 overall" />
                        </div>

                        <label className="flex items-start gap-3 mt-8 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={form.agree}
                                onChange={(e) => setForm({ ...form, agree: e.target.checked })}
                                className="mt-1 accent-orange w-4 h-4"
                            />
                            <span className="text-xs text-muted leading-relaxed">
                                I confirm the details above are correct and understand my slot is confirmed only after payment is received.
                            </span>
                        </label>

                        {errorMessage && (
                            <p className="mt-4 text-sm text-error font-medium">{errorMessage}</p>
                        )}

                        <Button
                            type="button"
                            size="lg"
                            className="w-full mt-6 uppercase tracking-widest text-sm"
                            loading={status === "paying"}
                            onClick={handlePayNow}
                        >
                            Pay {selected ? `₹${selected.fee.toLocaleString("en-IN")}` : "now"} &amp; confirm
                            <ArrowRight className="w-4 h-4" />
                        </Button>

                        <p className="mt-4 font-mono text-[10px] uppercase tracking-widest text-muted text-center">
                            Secure payment via Razorpay &middot; UPI, cards, netbanking
                        </p>
                    </div>
                </aside>
            </form>
        </div>
    );
}

function Field({
    label,
    value,
    onChange,
    type = "text",
    placeholder,
    required,
}: {
    label: string;
    value: string;
    onChange: (v: string) => void;
    type?: string;
    placeholder?: string;
    required?: boolean;
}) {
    return (
        <label className="block">
            <span className="block font-mono text-[10px] uppercase tracking-widest text-muted mb-2">
                {label}
                {required && <span className="text-orange"> *</span>}
            </span>
            <input
                type={type}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                required={required}
                className="w-full bg-background border border-border px-4 py-3 text-foreground font-body focus:outline-none focus:border-orange transition-colors"
            />
        </label>
    );
}

function Row({ k, v, highlight }: { k: string; v: string; highlight?: boolean }) {
    return (
        <div className="flex items-baseline justify-between gap-4">
            <span className="font-mono text-[10px] uppercase tracking-widest text-muted">{k}</span>
            <span className={`font-heading text-right ${highlight ? "text-2xl font-bold text-orange" : "text-base font-semibold"}`}>
                {v}
            </span>
        </div>
    );
}

