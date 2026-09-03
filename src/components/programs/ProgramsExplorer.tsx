"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ProgramBookingModal } from "./ProgramBookingModal";
import {
    categoryMeta,
    formatINR,
    type Program,
    type ProgramCategory,
} from "@/lib/programs";
import {
    X,
    Clock,
    Gauge,
    UtensilsCrossed,
    Check,
    CalendarClock,
    Mountain,
    Info,
} from "lucide-react";

const order: ProgramCategory[] = ["foundation", "trail", "skill", "adventure", "multiday", "practice", "special"];

function List({ items }: { items: string[] }) {
    return (
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5">
            {items.map((it) => (
                <li key={it} className="flex items-start gap-2 text-sm text-foreground/80">
                    <Check className="w-4 h-4 text-orange shrink-0 mt-0.5" />
                    <span>{it}</span>
                </li>
            ))}
        </ul>
    );
}

function ProgramDetail({ program }: { program: Program }) {
    return (
        <div className="space-y-8">
            {program.tagline && <p className="font-heading text-lg text-orange italic">{program.tagline}</p>}
            <p className="text-foreground/80 leading-relaxed">{program.description}</p>

            <div className="flex flex-wrap gap-3">
                <span className="inline-flex items-center gap-2 text-sm bg-background border border-border rounded-sm px-3 py-1.5">
                    <Clock className="w-4 h-4 text-orange" /> {program.duration}
                </span>
                <span className="inline-flex items-center gap-2 text-sm bg-background border border-border rounded-sm px-3 py-1.5">
                    <Gauge className="w-4 h-4 text-orange" /> {program.difficulty}
                </span>
                {program.lunch && (
                    <span className="inline-flex items-center gap-2 text-sm bg-background border border-border rounded-sm px-3 py-1.5">
                        <UtensilsCrossed className="w-4 h-4 text-orange" /> {program.lunch}
                    </span>
                )}
            </div>

            {program.priceOptions && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {program.priceOptions.map((opt) => (
                        <div key={opt.label} className="bg-background border border-orange/30 rounded-sm p-4">
                            <p className="text-sm text-foreground">{opt.label}</p>
                            <p className="font-heading text-2xl font-bold text-orange">{formatINR(opt.price)}</p>
                            {opt.note && <p className="text-xs text-muted">{opt.note}</p>}
                        </div>
                    ))}
                </div>
            )}

            {program.included && (
                <section>
                    <h4 className="font-heading text-lg font-semibold mb-3 flex items-center gap-2">
                        <Check className="w-5 h-5 text-orange" /> What&apos;s Included
                    </h4>
                    <List items={program.included} />
                </section>
            )}

            {program.experience && (
                <section>
                    <h4 className="font-heading text-lg font-semibold mb-3 flex items-center gap-2">
                        <Mountain className="w-5 h-5 text-orange" /> The Experience
                    </h4>
                    <List items={program.experience} />
                </section>
            )}

            {program.guidance && (
                <section>
                    <h4 className="font-heading text-lg font-semibold mb-3">Rider Guidance</h4>
                    <List items={program.guidance} />
                </section>
            )}

            {program.bestFor && (
                <section>
                    <h4 className="font-heading text-lg font-semibold mb-3">Best For</h4>
                    <List items={program.bestFor} />
                </section>
            )}

            {program.learn && (
                <section>
                    <h4 className="font-heading text-lg font-semibold mb-4">What You&apos;ll Learn</h4>
                    <div className="space-y-4">
                        {program.learn.map((mod) => (
                            <div key={mod.title} className="bg-background border border-border rounded-sm p-4">
                                <p className="font-heading text-sm font-semibold text-orange uppercase tracking-wide">{mod.title}</p>
                                {mod.intro && <p className="text-sm text-muted mt-1">{mod.intro}</p>}
                                {mod.items.length > 0 && (
                                    <div className="mt-3">
                                        <List items={mod.items} />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {program.days && (
                <section className="space-y-5">
                    {program.days.map((day) => (
                        <div key={day.title}>
                            <h4 className="font-heading text-lg font-semibold mb-3 text-orange">{day.title}</h4>
                            <div className="space-y-3">
                                {day.blocks.map((block) => (
                                    <div key={block.title} className="bg-background border border-border rounded-sm p-4">
                                        <p className="font-heading text-sm font-semibold uppercase tracking-wide">{block.title}</p>
                                        {block.intro && <p className="text-sm text-muted mt-1">{block.intro}</p>}
                                        {block.items.length > 0 && (
                                            <div className="mt-3">
                                                <List items={block.items} />
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </section>
            )}

            {program.schedule && (
                <section>
                    <h4 className="font-heading text-lg font-semibold mb-3 flex items-center gap-2">
                        <CalendarClock className="w-5 h-5 text-orange" /> Sample Schedule
                    </h4>
                    <div className="divide-y divide-border border border-border rounded-sm overflow-hidden">
                        {program.schedule.map((s) => (
                            <div key={s.time} className="flex gap-4 px-4 py-2.5 bg-background">
                                <span className="text-sm font-mono text-orange shrink-0 w-28">{s.time}</span>
                                <span className="text-sm text-foreground/80">{s.activity}</span>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {program.whatsIncluded && (
                <section>
                    <h4 className="font-heading text-lg font-semibold mb-3">Package Includes</h4>
                    <List items={program.whatsIncluded} />
                </section>
            )}

            {program.familyExperience && (
                <section>
                    <h4 className="font-heading text-lg font-semibold mb-3">Family Experience</h4>
                    <List items={program.familyExperience} />
                </section>
            )}

            {program.note && (
                <div className="flex items-start gap-2 bg-orange/10 border border-orange/20 rounded-sm p-4 text-sm text-foreground/80">
                    <Info className="w-4 h-4 text-orange shrink-0 mt-0.5" />
                    <span>{program.note}</span>
                </div>
            )}

            {program.outcome && (
                <div className="bg-background border border-orange/30 rounded-sm p-4">
                    <p className="text-xs font-semibold text-orange uppercase tracking-wide mb-1">Program outcome</p>
                    <p className="text-sm text-foreground/80">{program.outcome}</p>
                </div>
            )}
        </div>
    );
}

function ProgramCard({ program, onView, onBook }: { program: Program; onView: () => void; onBook: () => void }) {
    const highlights =
        program.included?.slice(0, 4) ||
        program.whatsIncluded?.slice(0, 4) ||
        program.experience?.slice(0, 4) ||
        program.learn?.slice(0, 4).map((m) => m.title.replace(/^Module \d+ — /, "")) ||
        [];

    return (
        <div className="group flex flex-col bg-surface border border-border rounded-sm overflow-hidden hover:border-orange/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-orange/5">
            <div className="p-6 flex-1 flex flex-col">
                <div className="flex items-start justify-between gap-3">
                    <Badge variant="orange">{program.difficulty}</Badge>
                    <div className="text-right">
                        <div className="font-heading text-2xl font-bold text-orange leading-none">{formatINR(program.price)}</div>
                        {program.priceUnit && <div className="text-[11px] text-muted mt-0.5">{program.priceUnit}</div>}
                    </div>
                </div>

                <h3 className="font-heading text-xl font-bold mt-4 group-hover:text-orange transition-colors">{program.name}</h3>
                {program.tagline && <p className="text-sm text-orange/90 italic mt-1">{program.tagline}</p>}

                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-muted">
                    <span className="inline-flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-orange" /> {program.duration}</span>
                    {program.lunch && <span className="inline-flex items-center gap-1"><UtensilsCrossed className="w-3.5 h-3.5 text-orange" /> {program.lunch}</span>}
                </div>

                <p className="text-sm text-foreground/70 mt-3 line-clamp-3">{program.shortDesc || program.description}</p>

                {highlights.length > 0 && (
                    <ul className="mt-4 space-y-1.5">
                        {highlights.map((h) => (
                            <li key={h} className="flex items-start gap-2 text-xs text-foreground/75">
                                <Check className="w-3.5 h-3.5 text-orange shrink-0 mt-0.5" />
                                <span className="line-clamp-1">{h}</span>
                            </li>
                        ))}
                    </ul>
                )}

                <div className="mt-6 pt-4 border-t border-border flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1" onClick={onView}>Details</Button>
                    <Button size="sm" className="flex-1" onClick={onBook}>Book Now</Button>
                </div>
            </div>
        </div>
    );
}

export function ProgramsExplorer({ programs, categories }: { programs: Program[]; categories?: ProgramCategory[] }) {
    const [detail, setDetail] = useState<Program | null>(null);
    const [booking, setBooking] = useState<Program | null>(null);
    const visibleCategories = categories ?? order;

    function openBooking(program: Program) {
        setBooking(program);
    }

    return (
        <>
            {order.filter((c) => visibleCategories.includes(c)).map((cat) => {
                const meta = categoryMeta[cat];
                const list = programs.filter((p) => p.category === cat);
                return (
                    <section key={cat} id={cat} className="mt-20 scroll-mt-24">
                        <div className="max-w-2xl">
                            <span className="text-orange text-sm font-semibold tracking-[0.3em] uppercase">{meta.accent}</span>
                            <h2 className="font-heading text-3xl sm:text-4xl font-bold mt-2">{meta.label}</h2>
                            <div className="w-16 h-1 bg-orange rounded-full mt-3" />
                            <p className="text-muted mt-4">{meta.blurb}</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
                            {list.map((program) => (
                                <ProgramCard
                                    key={program.slug}
                                    program={program}
                                    onView={() => setDetail(program)}
                                    onBook={() => openBooking(program)}
                                />
                            ))}
                        </div>
                    </section>
                );
            })}

            {/* Detail modal */}
            {detail && (
                <div className="fixed inset-x-0 bottom-0 top-16 sm:top-20 z-40 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={() => setDetail(null)}>
                    <div className="bg-surface border border-border rounded-sm w-full max-w-3xl max-h-[92vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between px-6 py-4 border-b border-border sticky top-0 bg-surface z-10">
                            <div>
                                <p className="text-xs text-muted uppercase tracking-wider">{categoryMeta[detail.category].label}</p>
                                <h3 className="font-heading text-xl font-bold text-foreground">{detail.name}</h3>
                            </div>
                            <button onClick={() => setDetail(null)} className="p-1 text-muted hover:text-foreground transition-colors" aria-label="Close">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="px-6 py-6">
                            <ProgramDetail program={detail} />
                        </div>
                        <div className="sticky bottom-0 bg-surface border-t border-border px-6 py-4 flex items-center justify-between gap-4">
                            <div>
                                <span className="font-heading text-2xl font-bold text-orange">{formatINR(detail.price)}</span>
                                {detail.priceUnit && <span className="text-xs text-muted ml-1">{detail.priceUnit}</span>}
                            </div>
                            <Button
                                onClick={() => {
                                    const p = detail;
                                    setDetail(null);
                                    openBooking(p);
                                }}
                            >
                                {detail.cta || "Book Now"}
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Booking modal */}
            {booking && <ProgramBookingModal program={booking} onClose={() => setBooking(null)} />}
        </>
    );
}
