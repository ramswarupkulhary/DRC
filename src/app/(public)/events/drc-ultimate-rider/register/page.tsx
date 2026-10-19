"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/Button";
import { ArrowRight, Check, Download } from "lucide-react";

interface Category {
    id: string;
    slug: string;
    name: string;
    classLabel: string | null;
    fee: number;
    description: string | null;
}

interface StayOption {
    enabled: boolean;
    price: number;
    soldOut: boolean;
}

type Status = "idle" | "paying" | "success-paid" | "success-registered" | "error";
type RegistrationType = "rider" | "spectator";
type RaceClass = "amateur" | "professional" | null;

function getRaceClass(category: Category): RaceClass {
    const slug = category.slug.toLowerCase();
    const name = category.name.toLowerCase();
    if (slug.startsWith("amateurs-") || name.includes("amateur")) return "amateur";
    if (slug.startsWith("pro-") || name.includes("professional")) return "professional";
    return null;
}

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
    const formRef = useRef<HTMLFormElement>(null);

    const [categories, setCategories] = useState<Category[]>([]);
    const [stay, setStay] = useState<StayOption | null>(null);
    const [membershipDiscountPercent, setMembershipDiscountPercent] = useState(0);
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [registrationType, setRegistrationType] = useState<RegistrationType>("rider");
    const [bookStay, setBookStay] = useState(false);
    const [spectatorPassUrl, setSpectatorPassUrl] = useState<string | null>(null);
    const [passEmailSent, setPassEmailSent] = useState<boolean | null>(null);
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
        acknowledgeOrganiser: false,
    });

    function toggleCategory(slug: string) {
        const targetCategory = categories.find((category) => category.slug === slug);
        setSelectedCategories((prev) =>
            prev.includes(slug)
                ? prev.filter((selectedSlug) => selectedSlug !== slug)
                : targetCategory && getRaceClass(targetCategory) && prev.some((selectedSlug) => {
                    const selected = categories.find((category) => category.slug === selectedSlug);
                    const selectedClass = selected ? getRaceClass(selected) : null;
                    return selectedClass !== null && selectedClass !== getRaceClass(targetCategory);
                })
                    ? prev
                    : [...prev, slug],
        );
    }
    const [status, setStatus] = useState<Status>("idle");
    const [errorMessage, setErrorMessage] = useState<string>("");

    useEffect(() => {
        if (new URLSearchParams(window.location.search).get("type") === "spectator") {
            setRegistrationType("spectator");
        }
    }, []);

    // Fetch categories from DB so admin edits (name/fee/order) propagate here instantly.
    useEffect(() => {
        fetch("/api/events/drc-ultimate-rider/categories", { cache: "no-store" })
            .then((r) => (r.ok ? r.json() : Promise.reject()))
            .then((data) => {
                setCategories((data?.categories ?? []).map((c: Category) => c));
                setStay(data?.stay ?? null);
                setMembershipDiscountPercent(data?.memberDiscountPercent ?? 0);
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

    const selectedList = categories.filter((c) => selectedCategories.includes(c.slug));
    const selectedCategoryNames = selectedList.map((c) => c.name).join(", ");
    const hasSelectedAmateur = selectedList.some((category) => getRaceClass(category) === "amateur");
    const hasSelectedProfessional = selectedList.some((category) => getRaceClass(category) === "professional");
    const entryFee = registrationType === "rider"
        ? selectedList.reduce((sum, c) => sum + c.fee, 0)
        : 0;
    const memberSavings = Math.round(entryFee * membershipDiscountPercent / 100);
    const wantsStay = registrationType === "rider" && bookStay;
    const total = entryFee - memberSavings + (wantsStay && stay ? stay.price : 0);

    function validate(): { message: string; selector: string } | null {
        if (registrationType === "rider" && selectedCategories.length === 0) return { message: "Please select at least one race category.", selector: "#race-categories" };
        if (wantsStay && (!stay?.enabled || stay.soldOut)) return { message: "Tent stay is no longer available. Please refresh and try again.", selector: "#booking-summary" };
        for (const [value, label] of [[form.name, "Full name"], [form.email, "Email"], [form.phone, "Phone (WhatsApp)"], [form.city, "City"], ...(registrationType === "rider" ? [[form.bikeMake, "Bike make"], [form.bikeModel, "Bike model"]] : [])]) {
            if (!value.trim()) return { message: `Please fill in ${label.toLowerCase()}.`, selector: `[data-field="${label}"]` };
        }
        if (registrationType === "rider" && !form.experience) return { message: "Please select your experience level.", selector: '[name="experience"]' };
        if (registrationType === "rider" && !form.acknowledgeOrganiser) return { message: "Please acknowledge the Organiser's right to determine category of participation.", selector: '[name="acknowledgeOrganiser"]' };
        if (!form.agree) return { message: "Please acknowledge the entry terms to continue.", selector: '[name="agree"]' };
        const invalid = formRef.current?.querySelector<HTMLInputElement>('input[type="email"]:invalid');
        if (invalid) return { message: invalid.validationMessage, selector: 'input[type="email"]' };
        return null;
    }

    async function handlePayNow() {
        if (registrationType === "rider" && authStatus !== "authenticated") {
            router.push(`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`);
            return;
        }
        const err = validate();
        if (err) {
            setErrorMessage(err.message);
            const target = formRef.current?.querySelector<HTMLElement>(err.selector);
            target?.scrollIntoView({ behavior: "smooth", block: "center" });
            target?.focus({ preventScroll: true });
            return;
        }
        if (registrationType === "rider" && selectedCategories.length === 0) return;
        setStatus("paying");
        setErrorMessage("");

        try {
            const orderRes = await fetch("/api/events/ultimate-rider/create-order", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...form,
                    registrationType,
                    categories: registrationType === "rider" ? selectedCategories : null,
                    stayBooked: wantsStay,
                }),
            });
            if (!orderRes.ok) {
                const data = await orderRes.json().catch(() => ({}));
                throw new Error(data?.error || "Could not create payment order.");
            }
            const { orderId, amount, key, categoryName, freeBooking, passUrl, passEmailSent: emailSent } = await orderRes.json();

            if (freeBooking) {
                setSpectatorPassUrl(passUrl ?? null);
                setPassEmailSent(emailSent === true);
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
                description: `DRC Ultimate Rider — ${registrationType === "spectator" ? "Spectator pass" : categoryName}${wantsStay ? " + Tent Stay" : ""}`,
                order_id: orderId,
                theme: { color: "#E8622C" },
                prefill: {
                    name: form.name,
                    email: form.email,
                    contact: form.phone,
                },
                notes: {
                    event: "drc-ultimate-rider",
                    category: registrationType === "rider" ? selectedCategories.join(",") : "spectator",
                    registrationType,
                    stayBooked: String(wantsStay),
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
                                categories: registrationType === "rider" ? selectedCategories : null,
                                registrationType,
                                stayBooked: wantsStay,
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
            ? "spectator pass"
            : `race entry in ${selectedCategoryNames || "your selected categories"}`;
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
                    {wantsStay ? ", including your tent stay" : ""}. {paid ? `A receipt has been sent to ${form.email}.` : ""}
                </p>
                {registrationType === "spectator" && spectatorPassUrl && (
                    <p role="status" className="mt-4 text-sm text-muted">
                        {passEmailSent
                            ? `Your spectator pass has been emailed to ${form.email}.`
                            : "Your registration is confirmed, but we couldn't email your pass. You can still download it below."}
                    </p>
                )}
                <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
                    {registrationType === "spectator" && spectatorPassUrl && (
                        <a href={spectatorPassUrl} download="drc-ultimate-rider-spectator-pass.png" className="inline-flex items-center justify-center gap-2 bg-orange px-6 py-3 font-heading text-sm font-bold uppercase text-white">
                            <Download className="h-4 w-4" /> Download pass
                        </a>
                    )}
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

            <form ref={formRef} noValidate onSubmit={(e) => { e.preventDefault(); handlePayNow(); }} className="max-w-7xl mx-auto px-6 lg:px-10 py-16 grid grid-cols-1 lg:grid-cols-12 gap-12">
                {/* Booking type and pass selection */}
                <div className="lg:col-span-7 space-y-10">
                    <fieldset>
                        <legend className="flex items-center gap-3 mb-6">
                            <span className="font-heading text-lg font-bold uppercase tracking-tight">Choose your booking</span>
                        </legend>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {(["rider", "spectator"] as const).map((type) => (
                                <label key={type} className={`border p-5 cursor-pointer ${registrationType === type ? "border-orange bg-orange/5" : "border-border"}`}>
                                    <input type="radio" name="registrationType" value={type} checked={registrationType === type} onChange={() => setRegistrationType(type)} className="sr-only" />
                                    <span className="font-heading text-lg font-bold uppercase">{type === "rider" ? "Race rider" : "Spectator"}</span>
                                    <span className="block text-sm text-muted mt-1">{type === "rider" ? "Enter a race category" : "Free general admission"}</span>
                                </label>
                            ))}
                        </div>
                    </fieldset>

                    {registrationType === "rider" ? (
                        <fieldset id="race-categories" tabIndex={-1}>
                            <legend className="flex items-center gap-3 mb-6">
                                <span className="font-heading text-lg font-bold uppercase tracking-tight">Select categories</span>
                                <span className="font-mono text-[10px] uppercase tracking-widest text-muted">Choose one or more</span>
                            </legend>
                            <p className="text-xs text-muted -mt-3 mb-4">Amateur and Professional categories cannot be combined.</p>
                            {hasSelectedProfessional && <p role="status" className="text-xs text-orange mb-4">Professional selected. Amateur categories are unavailable.</p>}
                            {hasSelectedAmateur && <p role="status" className="text-xs text-orange mb-4">Amateur selected. Professional categories are unavailable.</p>}

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {categories.map((c) => {
                                    const isSelected = selectedCategories.includes(c.slug);
                                    const categoryClass = getRaceClass(c);
                                    const isBlocked = !isSelected && (
                                        (hasSelectedProfessional && categoryClass === "amateur") ||
                                        (hasSelectedAmateur && categoryClass === "professional")
                                    );
                                    return (
                                        <label
                                            key={c.slug}
                                            aria-disabled={isBlocked}
                                            className={`block p-6 border transition-colors ${isBlocked ? "cursor-not-allowed opacity-50" : "cursor-pointer"} ${isSelected
                                                ? "border-orange bg-orange/5"
                                                : "border-border bg-background hover:border-tan-dark"
                                                }`}
                                        >
                                            <input
                                                type="checkbox"
                                                name="category"
                                                value={c.slug}
                                                disabled={isBlocked}
                                                checked={isSelected}
                                                onChange={() => toggleCategory(c.slug)}
                                                className="sr-only"
                                            />
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="min-w-0">
                                                    {c.classLabel?.trim() && <p className="font-mono text-xs uppercase text-orange mb-2 break-words">{c.classLabel}</p>}
                                                    <h3 className="font-heading text-xl font-bold uppercase leading-tight">{c.name}</h3>
                                                    <p className="text-sm text-muted mt-2 leading-relaxed">{c.description}</p>
                                                </div>
                                                <span className={`inline-flex items-center justify-center w-6 h-6 rounded-sm shrink-0 border ${isSelected ? "bg-orange text-white border-orange" : "border-border"}`}>
                                                    {isSelected && <Check className="w-3.5 h-3.5" strokeWidth={3} />}
                                                </span>
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

                            <label className={`flex items-start gap-3 mt-6 p-5 border cursor-pointer ${form.acknowledgeOrganiser ? "border-orange bg-orange/5" : "border-border"}`}>
                                <input
                                    type="checkbox"
                                    name="acknowledgeOrganiser"
                                    checked={form.acknowledgeOrganiser}
                                    onChange={(e) => setForm({ ...form, acknowledgeOrganiser: e.target.checked })}
                                    className="mt-1 accent-orange w-4 h-4 shrink-0"
                                />
                                <span className="text-sm text-muted leading-relaxed">
                                    The Organiser reserves the sole right to determine a competitor&rsquo;s category of participation. Such decisions shall be made fairly and impartially, and in the event of any unfairness, the Organiser&rsquo;s decision may be Final.
                                </span>
                            </label>
                        </fieldset>
                    ) : (
                        <fieldset>
                            <legend className="flex items-center gap-3 mb-6">
                                <span className="font-heading text-lg font-bold uppercase tracking-tight">Spectator pass</span>
                            </legend>
                            <div className="border border-border p-5 flex items-center justify-between">
                                <span className="text-sm text-muted">General admission</span>
                                <span className="font-heading text-xl font-bold text-orange">Free</span>
                            </div>
                        </fieldset>
                    )}

                    {/* Rider details */}
                    <fieldset>
                        <legend className="flex items-center gap-3 mb-6">
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
                                name="experience"
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
                <aside id="booking-summary" tabIndex={-1} className="lg:col-span-5">
                    <div className="lg:sticky lg:top-24 p-8 border border-border bg-surface">
                        <div className="font-mono text-[10px] uppercase tracking-widest text-orange">Order summary</div>
                        <h3 className="font-heading text-2xl font-bold uppercase mt-3">DRC Ultimate Rider</h3>
                        <p className="font-mono text-[10px] uppercase tracking-widest text-muted mt-1">
                            12&ndash;13 December 2026 &middot; Bengaluru
                        </p>

                        {registrationType === "rider" && stay?.enabled && (stay.soldOut ? (
                            <p className="mt-6 border border-border p-4 text-sm font-semibold text-muted">Tent stay sold out</p>
                        ) : (
                            <label className={`flex items-start justify-between gap-3 mt-6 border p-4 ${bookStay ? "border-orange bg-orange/5" : "border-border cursor-pointer"}`}>
                                <span className="flex items-start gap-3">
                                    <input type="checkbox" checked={bookStay} onChange={(e) => setBookStay(e.target.checked)} className="mt-1 accent-orange w-4 h-4" />
                                    <span className="block font-heading text-sm font-bold uppercase">Add tent stay</span>
                                </span>
                                <span className="font-heading text-lg font-bold text-orange whitespace-nowrap">₹{stay.price.toLocaleString("en-IN")}</span>
                            </label>
                        ))}

                        <div className="mt-6 pt-6 border-t border-border space-y-4">
                            <Row k={registrationType === "rider" ? (selectedList.length > 1 ? "Categories" : "Category") : "Pass"} v={registrationType === "rider" ? (selectedCategoryNames || "—") : "Spectator pass"} />
                            <Row k={registrationType === "rider" ? "Entry fee" : "Spectator admission"} v={entryFee === 0 ? "Free" : `₹${entryFee.toLocaleString("en-IN")}`} highlight />
                            {membershipDiscountPercent > 0 && memberSavings > 0 && <Row k={`Member discount (${membershipDiscountPercent}%)`} v={`−₹${memberSavings.toLocaleString("en-IN")}`} />}
                            {wantsStay && stay && <Row k="Tent stay" v={`₹${stay.price.toLocaleString("en-IN")}`} />}
                            <div className="pt-4 border-t border-border">
                                <Row k="Total" v={`₹${total.toLocaleString("en-IN")}`} highlight />
                            </div>
                        </div>

                        <label className="flex items-start gap-3 mt-8 cursor-pointer">
                            <input
                                type="checkbox"
                                name="agree"
                                checked={form.agree}
                                onChange={(e) => setForm({ ...form, agree: e.target.checked })}
                                className="mt-1 accent-orange w-4 h-4"
                            />
                            <span className="text-xs text-muted leading-relaxed">
                                {registrationType === "spectator"
                                    ? "I confirm these details are correct and accept the event entry terms."
                                    : "I confirm these details are correct and understand my booking is confirmed after payment."}
                            </span>
                        </label>

                        {errorMessage && (
                            <p role="alert" className="mt-4 text-sm text-error font-medium">{errorMessage}</p>
                        )}

                        <Button
                            type="button"
                            size="lg"
                            className="w-full mt-6 uppercase tracking-widest text-sm"
                            loading={status === "paying"}
                            onClick={handlePayNow}
                        >
                            {registrationType === "spectator"
                                ? "Get free spectator pass"
                                : authStatus === "authenticated"
                                    ? <>{total > 0 ? `Pay ₹${total.toLocaleString("en-IN")}` : "Confirm booking"} &amp; continue</>
                                    : <>Sign in to book · ₹{total.toLocaleString("en-IN")}</>}
                            <ArrowRight className="w-4 h-4" />
                        </Button>

                        <p className="mt-4 font-mono text-[10px] uppercase tracking-widest text-muted text-center">
                            {registrationType === "spectator" ? "Free admission" : <>Secure payment via Razorpay &middot; UPI, cards, netbanking</>}
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
                data-field={label}
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

