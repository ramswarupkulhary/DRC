"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { X, CheckCircle2 } from "lucide-react";
import { programs, formatINR, type Program } from "@/lib/programs";

interface Props {
    program: Program;
    onClose: () => void;
}

export function ProgramBookingModal({ program, onClose }: Props) {
    const [selectedSlug, setSelectedSlug] = useState(program.slug);
    const [lunch, setLunch] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [done, setDone] = useState(false);

    const active = programs.find((p) => p.slug === selectedSlug) || program;

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setSubmitting(true);
        setError("");
        const data = new FormData(e.currentTarget);

        try {
            const res = await fetch("/api/programs/book", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    fullName: data.get("fullName"),
                    age: data.get("age"),
                    phone: data.get("phone"),
                    email: data.get("email"),
                    emergencyName: data.get("emergencyName"),
                    emergencyPhone: data.get("emergencyPhone"),
                    motorcycleModel: data.get("motorcycleModel"),
                    ridingExperience: data.get("ridingExperience"),
                    offRoadExperience: data.get("offRoadExperience"),
                    programSlug: selectedSlug,
                    participants: data.get("participants"),
                    companions: data.get("companions"),
                    lunch,
                    medical: data.get("medical"),
                }),
            });
            if (!res.ok) {
                const err = await res.json();
                setError(err.error || "Booking failed. Please try again.");
                return;
            }
            setDone(true);
        } catch {
            setError("Booking failed. Please try again.");
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <div className="fixed inset-x-0 bottom-0 top-16 sm:top-20 z-40 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={onClose}>
            <div className="bg-surface border border-border rounded-sm w-full max-w-2xl max-h-[92vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between px-6 py-4 border-b border-border sticky top-0 bg-surface z-10">
                    <div>
                        <p className="text-xs text-muted uppercase tracking-wider">Book a Program</p>
                        <h3 className="font-heading text-lg font-bold text-foreground">{active.name}</h3>
                    </div>
                    <button onClick={onClose} className="p-1 text-muted hover:text-foreground transition-colors" aria-label="Close">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {done ? (
                    <div className="px-6 py-12 text-center space-y-3">
                        <CheckCircle2 className="w-16 h-16 text-success mx-auto" />
                        <h4 className="font-heading text-2xl font-bold">Request Received!</h4>
                        <p className="text-muted max-w-md mx-auto">
                            Thanks for choosing DRC. Our team will contact you shortly on WhatsApp/phone to confirm your slot, payment and final details.
                        </p>
                        <Button onClick={onClose} className="mt-2">Done</Button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="px-6 py-6 space-y-5">
                        {error && <div className="bg-error/10 border border-error/30 text-error text-sm p-3 rounded-sm">{error}</div>}

                        <div>
                            <label htmlFor="programSelect" className="block text-sm font-medium text-tan-light mb-1">Program</label>
                            <select
                                id="programSelect"
                                value={selectedSlug}
                                onChange={(e) => setSelectedSlug(e.target.value)}
                                className="w-full px-4 py-2.5 bg-surface border border-border rounded-sm text-foreground focus:outline-none focus:border-orange focus:ring-1 focus:ring-orange transition-colors cursor-pointer"
                            >
                                {programs.map((p) => (
                                    <option key={p.slug} value={p.slug}>
                                        {p.name} — {formatINR(p.price)}
                                    </option>
                                ))}
                            </select>
                            <p className="text-xs text-muted mt-1">
                                {formatINR(active.price)} {active.priceUnit || ""} · {active.duration} · {active.difficulty}
                            </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Input id="fullName" name="fullName" label="Full Name *" required placeholder="Your name" />
                            <Input id="age" name="age" label="Age" type="number" min={1} placeholder="Age" />
                            <Input id="phone" name="phone" label="Phone Number *" required placeholder="+91…" />
                            <Input id="email" name="email" label="Email Address *" type="email" required placeholder="you@email.com" />
                            <Input id="emergencyName" name="emergencyName" label="Emergency Contact Name" placeholder="Name" />
                            <Input id="emergencyPhone" name="emergencyPhone" label="Emergency Contact Number" placeholder="Phone" />
                            <Input id="motorcycleModel" name="motorcycleModel" label="Motorcycle Model" placeholder="e.g. Himalayan, KTM 390 ADV" />
                            <Input id="participants" name="participants" label="Number of Participants" type="number" min={1} defaultValue={1} />
                            <Input id="ridingExperience" name="ridingExperience" label="Riding Experience" placeholder="e.g. 3 years" />
                            <Input id="offRoadExperience" name="offRoadExperience" label="Off-Road Experience" placeholder="e.g. Beginner" />
                        </div>

                        {(active.category === "special" || active.slug === "overnighter-trail") && (
                            <Input id="companions" name="companions" label="Family Members / Friends (names & count)" placeholder="e.g. Wife + 1 child" />
                        )}

                        {active.optionalLunch ? (
                            <label className="flex items-center gap-3 p-3 bg-background border border-border rounded-sm cursor-pointer">
                                <input type="checkbox" checked={lunch} onChange={(e) => setLunch(e.target.checked)} className="w-4 h-4 accent-orange" />
                                <span className="text-sm text-foreground">
                                    Add lunch (+{formatINR(active.optionalLunch)})
                                </span>
                            </label>
                        ) : null}

                        <Textarea id="medical" name="medical" label="Medical / Allergy Information (if any)" placeholder="Anything our team should know" />

                        <div className="bg-background border border-border rounded-sm p-4 text-xs text-muted leading-relaxed">
                            Off-road motorcycling involves inherent risks. By booking, you agree to ride within your ability and follow all instructions from DRC ride leaders and trainers. Payment and slot confirmation will be handled by our team after this request.
                        </div>

                        <Button type="submit" size="lg" className="w-full" loading={submitting}>
                            Request Booking
                        </Button>
                    </form>
                )}
            </div>
        </div>
    );
}
