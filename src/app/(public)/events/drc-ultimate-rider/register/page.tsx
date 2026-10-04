"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/Button";
import { ArrowRight, Check } from "lucide-react";

interface Category {
    id: string;
    slug: string;
    name: string;
    fee: number;
    description: string | null;
}

interface StayOption {
    enabled: boolean;
    price: number;
    totalTents: number;
    availableTents: number;
}

interface SpectatorFees {
    saturdayFee: number;
    sundayFee: number;
    weekendFee: number;
    fullMeal: { name: string; details: string; fee: number };
    dayMeal: { name: string; details: string; fee: number };
}

type Status = "idle" | "paying" | "success-paid" | "success-registered" | "error";
type RegistrationType = "rider" | "spectator";
type AttendanceDays = "saturday" | "sunday" | "both";
type FoodSelection = "none" | "full" | "day";

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

    const [categories, setCategories] = useState<Category[]>([]);
    const [stay, setStay] = useState<StayOption | null>(null);
    const [spectatorFees, setSpectatorFees] = useState<SpectatorFees>({
        saturdayFee: 499,
        sundayFee: 499,
        weekendFee: 999,
        fullMeal: { name: "Two-day meal package", details: "2 breakfasts, 2 lunches and 1 dinner", fee: 1999 },
        dayMeal: { name: "Day meal package", details: "1 breakfast and 1 lunch", fee: 599 },
    });
    const [category, setCategory] = useState<string>("");
    const [registrationType, setRegistrationType] = useState<RegistrationType>("rider");
    const [attendanceDays, setAttendanceDays] = useState<AttendanceDays>("both");
    const [foodSelection, setFoodSelection] = useState<FoodSelection>("none");
    const [bookStay, setBookStay] = useState(false);
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

    // Fetch categories from DB so admin edits (name/fee/order) propagate here instantly.
    useEffect(() => {
        fetch("/api/events/drc-ultimate-rider/categories", { cache: "no-store" })
            .then((r) => (r.ok ? r.json() : Promise.reject()))
            .then((data) => {
                setCategories((data?.categories ?? []).map((c: { id: string; slug: string; name: string; fee: number; description: string | null }) => c));
                setStay(data?.stay ?? null);
                if (data?.spectator) setSpectatorFees(data.spectator);
            })
            .catch(() => { setCategories([]); setStay(null); });
    }, []);

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

    const selected = categories.find((c) => c.slug === category);
    const spectatorFee = attendanceDays === "saturday"
        ? spectatorFees.saturdayFee
        : attendanceDays === "sunday" ? spectatorFees.sundayFee : spectatorFees.weekendFee;
    const entryFee = registrationType === "rider" ? selected?.fee ?? 0 : spectatorFee;
    const selectedFood = foodSelection === "full"
        ? spectatorFees.fullMeal
        : foodSelection === "day" ? spectatorFees.dayMeal : null;
    const foodAmount = registrationType === "spectator" ? selectedFood?.fee ?? 0 : 0;
    const total = entryFee + foodAmount + (bookStay && stay ? stay.price : 0);
    const attendanceLabel = attendanceDays === "both" ? "Saturday + Sunday" : attendanceDays === "saturday" ? "Saturday only" : "Sunday only";

    function validate(): string | null {
        if (registrationType === "rider" && !category) return "Please select a race category.";
        if (registrationType === "spectator" && !attendanceDays) return "Please select the day or days you will attend.";
        if (bookStay && (!stay?.enabled || stay.availableTents < 1)) return "Tent stay is no longer available. Please refresh and try again.";
        if (!form.name || !form.email || !form.phone || !form.city) return "Please fill in all contact details.";
        if (registrationType === "rider" && (!form.bikeMake || !form.bikeModel)) return "Please add your bike make and model.";
        if (registrationType === "rider" && !form.experience) return "Please select your experience level.";
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
        if (registrationType === "rider" && !selected) return;
        setStatus("paying");
        setErrorMessage("");

        try {
            const orderRes = await fetch("/api/events/ultimate-rider/create-order", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...form,
                    registrationType,
                    attendanceDays: registrationType === "spectator" ? attendanceDays : null,
                    foodPackage: registrationType === "spectator" ? foodSelection : "none",
                    category: registrationType === "rider" ? category : null,
                    stayBooked: bookStay,
                }),
            });
            if (!orderRes.ok) {
                const data = await orderRes.json().catch(() => ({}));
                throw new Error(data?.error || "Could not create payment order.");
            }
            const { orderId, amount, key, categoryName, freeBooking } = await orderRes.json();

            if (freeBooking) {
                setStatus("success-registered");
                return;
            }

            const ready = await ensureRazorpay();
            if (!ready) throw new Error("Payment library failed to load. Please try again or check your connection.");

            const options: Record<string, unknown> = {
                key,
                amount: amount * 100,
                currency: "INR",
                name: "DRC Motorsports",
                description: `DRC Ultimate Rider — ${registrationType === "spectator" ? `Spectator ${attendanceLabel}` : categoryName}${bookStay ? " + Tent Stay" : ""}`,
                order_id: orderId,
                theme: { color: "#E8622C" },
                prefill: {
                    name: form.name,
                    email: form.email,
                    contact: form.phone,
                },
                notes: {
                    event: "drc-ultimate-rider",
                    category: registrationType === "rider" ? category : "spectator",
                    registrationType,
                    attendanceDays: registrationType === "spectator" ? attendanceDays : null,
                    stayBooked: String(bookStay),
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
                                category: registrationType === "rider" ? category : "spectator",
                                registrationType,
                                attendanceDays: registrationType === "spectator" ? attendanceDays : null,
                                foodPackage: registrationType === "spectator" ? foodSelection : "none",
                                stayBooked: bookStay,
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

    if (status === "success-paid" || status === "success-registered") {
        const paid = status === "success-paid";
        const confirmation = registrationType === "spectator"
            ? `Spectator pass for ${attendanceLabel}`
            : `race entry in ${selected?.name ?? "your selected category"}`;
        return (
            <div className="max-w-3xl mx-auto px-6 lg:px-10 py-20 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-orange/10 mb-6">
                    <Check className="w-8 h-8 text-orange" strokeWidth={2.5} />
                </div>
                <h1 className="font-heading font-bold uppercase text-3xl sm:text-4xl leading-[1] tracking-[-0.01em]">
                    {registrationType === "spectator" ? "Spectator pass confirmed." : paid ? "You're in." : "Registration received."}
                </h1>
                <p className="mt-4 text-muted leading-relaxed max-w-xl mx-auto">
                    {paid ? "Payment received. " : "Thank you. "}
                    <span className="text-foreground font-semibold">{form.name}</span>, your{" "}
                    <span className="text-orange font-semibold">{confirmation}</span> for DRC Ultimate Rider is confirmed
                    {selectedFood ? ` with ${selectedFood.name}` : ""}{bookStay ? ", including your tent stay" : ""}. {paid ? `A receipt has been sent to ${form.email}.` : ""}
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
                        <span className="text-orange">Event</span> registration.
                    </h1>
                    <p className="mt-6 max-w-2xl text-lg text-muted">
                        Choose a race entry or spectator pass, then confirm your booking.
                    </p>
                </div>
            </section>

            <form onSubmit={(e) => { e.preventDefault(); handlePayNow(); }} className="max-w-7xl mx-auto px-6 lg:px-10 py-16 grid grid-cols-1 lg:grid-cols-12 gap-12">
                {/* Booking type and pass selection */}
                <div className="lg:col-span-7 space-y-10">
                    <fieldset>
                        <legend className="flex items-center gap-3 mb-6">
                            <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-orange">Step 01</span>
                            <span className="h-px w-10 bg-orange" />
                            <span className="font-heading text-lg font-bold uppercase tracking-tight">Choose your booking</span>
                        </legend>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {(["rider", "spectator"] as const).map((type) => (
                                <label key={type} className={`border p-5 cursor-pointer ${registrationType === type ? "border-orange bg-orange/5" : "border-border"}`}>
                                    <input type="radio" name="registrationType" value={type} checked={registrationType === type} onChange={() => setRegistrationType(type)} className="sr-only" />
                                    <span className="font-heading text-lg font-bold uppercase">{type === "rider" ? "Race rider" : "Spectator"}</span>
                                    <span className="block text-sm text-muted mt-1">{type === "rider" ? "Enter a race category" : "Choose your event day pass"}</span>
                                </label>
                            ))}
                        </div>
                    </fieldset>

                    {registrationType === "rider" ? (
                    <fieldset>
                        <legend className="flex items-center gap-3 mb-6">
                            <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-orange">Step 02</span>
                            <span className="h-px w-10 bg-orange" />
                            <span className="font-heading text-lg font-bold uppercase tracking-tight">Select category</span>
                        </legend>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {categories.map((c) => {
                                const isSelected = category === c.slug;
                                return (
                                    <label
                                        key={c.slug}
                                        className={`block p-6 border cursor-pointer transition-colors ${isSelected
                                            ? "border-orange bg-orange/5"
                                            : "border-border bg-background hover:border-tan-dark"
                                            }`}
                                    >
                                        <input
                                            type="radio"
                                            name="category"
                                            value={c.slug}
                                            checked={isSelected}
                                            onChange={() => setCategory(c.slug)}
                                            className="sr-only"
                                        />
                                        <div className="flex items-start justify-between gap-4">
                                            <div>
                                                <h3 className="font-heading text-xl font-bold uppercase leading-tight">{c.name}</h3>
                                                <p className="text-sm text-muted mt-2 leading-relaxed">{c.description}</p>
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
                    ) : (
                        <fieldset>
                            <legend className="flex items-center gap-3 mb-6">
                                <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-orange">Step 02</span>
                                <span className="h-px w-10 bg-orange" />
                                <span className="font-heading text-lg font-bold uppercase tracking-tight">Select spectator pass</span>
                            </legend>
                            <p className="font-mono text-[10px] uppercase tracking-widest text-orange mb-3">Early Bird</p>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                {([
                                    { days: "saturday", label: "Saturday only", fee: spectatorFees.saturdayFee },
                                    { days: "sunday", label: "Sunday only", fee: spectatorFees.sundayFee },
                                    { days: "both", label: "Both days", fee: spectatorFees.weekendFee },
                                ] as const).map((option) => (
                                    <label key={option.days} className={`border p-5 cursor-pointer ${attendanceDays === option.days ? "border-orange bg-orange/5" : "border-border"}`}>
                                        <input type="radio" name="attendanceDays" value={option.days} checked={attendanceDays === option.days} onChange={() => setAttendanceDays(option.days)} className="sr-only" />
                                        <span className="block font-heading text-base font-bold uppercase">{option.label}</span>
                                        <span className="block font-heading text-2xl font-bold text-orange mt-3">₹{option.fee.toLocaleString("en-IN")}</span>
                                        <span className="block font-mono text-[10px] uppercase tracking-widest text-muted mt-1">Early Bird</span>
                                    </label>
                                ))}
                            </div>
                        </fieldset>
                    )}

                    {registrationType === "spectator" && (
                        <fieldset>
                            <legend className="flex items-center gap-3 mb-6">
                                <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-orange">Optional</span>
                                <span className="h-px w-10 bg-orange" />
                                <span className="font-heading text-lg font-bold uppercase tracking-tight">Food packages</span>
                            </legend>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <label className={`border p-5 cursor-pointer ${foodSelection === "none" ? "border-orange bg-orange/5" : "border-border"}`}>
                                    <input type="radio" name="foodPackage" checked={foodSelection === "none"} onChange={() => setFoodSelection("none")} className="sr-only" />
                                    <span className="block font-heading text-base font-bold uppercase">No food package</span>
                                    <span className="block font-heading text-2xl font-bold mt-3">No charge</span>
                                </label>
                                <label className={`border p-5 cursor-pointer ${foodSelection === "full" ? "border-orange bg-orange/5" : "border-border"}`}>
                                    <input type="radio" name="foodPackage" checked={foodSelection === "full"} onChange={() => setFoodSelection("full")} className="sr-only" />
                                    <span className="block font-heading text-base font-bold uppercase">{spectatorFees.fullMeal.name}</span>
                                    <span className="block text-sm text-muted mt-2">{spectatorFees.fullMeal.details}</span>
                                    <span className="block font-heading text-2xl font-bold text-orange mt-3">₹{spectatorFees.fullMeal.fee.toLocaleString("en-IN")}</span>
                                </label>
                                <label className={`border p-5 cursor-pointer ${foodSelection === "day" ? "border-orange bg-orange/5" : "border-border"}`}>
                                    <input type="radio" name="foodPackage" checked={foodSelection === "day"} onChange={() => setFoodSelection("day")} className="sr-only" />
                                    <span className="block font-heading text-base font-bold uppercase">{spectatorFees.dayMeal.name}</span>
                                    <span className="block text-sm text-muted mt-2">{spectatorFees.dayMeal.details}</span>
                                    <span className="block font-heading text-2xl font-bold text-orange mt-3">₹{spectatorFees.dayMeal.fee.toLocaleString("en-IN")}</span>
                                </label>
                            </div>
                        </fieldset>
                    )}

                    {stay?.enabled && (
                        <fieldset>
                            <legend className="flex items-center gap-3 mb-6">
                                <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-orange">Optional</span>
                                <span className="h-px w-10 bg-orange" />
                                <span className="font-heading text-lg font-bold uppercase tracking-tight">Tent stay</span>
                            </legend>
                            <label className={`flex items-start justify-between gap-4 border p-5 ${bookStay ? "border-orange bg-orange/5" : "border-border"} ${stay.availableTents < 1 ? "opacity-60" : "cursor-pointer"}`}>
                                <span className="flex items-start gap-3">
                                    <input
                                        type="checkbox"
                                        checked={bookStay}
                                        disabled={stay.availableTents < 1}
                                        onChange={(e) => setBookStay(e.target.checked)}
                                        className="mt-1 accent-orange w-4 h-4"
                                    />
                                    <span>
                                        <span className="block font-heading text-lg font-bold uppercase">Reserve one tent</span>
                                        <span className="block text-sm text-muted mt-1">
                                            {stay.availableTents > 0 ? `${stay.availableTents} of ${stay.totalTents} tents available` : "Sold out"}
                                        </span>
                                    </span>
                                </span>
                                <span className="font-heading text-xl font-bold text-orange whitespace-nowrap">₹{stay.price.toLocaleString("en-IN")}</span>
                            </label>
                        </fieldset>
                    )}

                    {/* Rider details */}
                    <fieldset>
                        <legend className="flex items-center gap-3 mb-6">
                            <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-orange">Step 03</span>
                            <span className="h-px w-10 bg-orange" />
                            <span className="font-heading text-lg font-bold uppercase tracking-tight">{registrationType === "rider" ? "Rider details" : "Spectator details"}</span>
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
                            {registrationType === "rider" && <Field
                                label="Bike make"
                                required
                                value={form.bikeMake}
                                onChange={(v) => setForm({ ...form, bikeMake: v })}
                                placeholder="e.g. KTM, Husqvarna, Royal Enfield"
                            />}
                            {registrationType === "rider" && <Field
                                label="Bike model"
                                required
                                value={form.bikeModel}
                                onChange={(v) => setForm({ ...form, bikeModel: v })}
                                placeholder="e.g. 390 Adventure, Himalayan 450"
                            />}
                        </div>

                        {registrationType === "rider" && <div className="mt-4">
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
                        </div>}

                        {registrationType === "rider" && <div className="mt-4">
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
                        </div>}
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
                            <Row k={registrationType === "rider" ? "Category" : "Spectator pass"} v={registrationType === "rider" ? selected?.name ?? "—" : attendanceLabel} />
                            <Row k={registrationType === "rider" ? "Entry fee" : "Early Bird pass"} v={`₹${entryFee.toLocaleString("en-IN")}`} highlight />
                            {selectedFood && <Row k={selectedFood.name} v={`₹${foodAmount.toLocaleString("en-IN")}`} />}
                            {bookStay && stay && <Row k="Tent stay" v={`₹${stay.price.toLocaleString("en-IN")}`} />}
                            <Row k="Format" v="2 days · Sat + Sun" />
                            <Row k="Prize pool" v="₹5,00,000 overall" />
                            <div className="pt-4 border-t border-border">
                                <Row k="Total" v={`₹${total.toLocaleString("en-IN")}`} highlight />
                            </div>
                        </div>

                        <label className="flex items-start gap-3 mt-8 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={form.agree}
                                onChange={(e) => setForm({ ...form, agree: e.target.checked })}
                                className="mt-1 accent-orange w-4 h-4"
                            />
                            <span className="text-xs text-muted leading-relaxed">
                                I confirm these details are correct and understand my booking is confirmed after payment.
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
                            {authStatus === "authenticated"
                                ? <>{total > 0 ? `Pay ₹${total.toLocaleString("en-IN")}` : "Confirm booking"} &amp; continue</>
                                : <>Sign in to book · ₹{total.toLocaleString("en-IN")}</>}
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

