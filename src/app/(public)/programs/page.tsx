import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight, ShieldCheck, ShieldAlert, ArrowDown } from "lucide-react";
import { ProgramsExplorer } from "@/components/programs/ProgramsExplorer";
import { BreadcrumbJsonLd } from "@/components/seo/JsonLd";
import {
    programs,
    skillProgression,
    customerJourney,
    recommendedProgression,
    riderRequirements,
    safetyDisclaimers,
    formatINR,
} from "@/lib/programs";

const BASE_URL = "https://www.dirtridecamp.com";

export const metadata: Metadata = {
    title: "Off-Road Programs — Training, Trails & Adventure Experiences | DRC Bangalore",
    description:
        "Explore DRC off-road programs: private motorcycle training, guided off-road trails, overnight camping rides & family adventure experiences near Bangalore. Book beginner to technical off-road programs.",
    keywords: [
        "off road programs bangalore",
        "off road training bangalore",
        "dirt bike training",
        "off road trails bangalore",
        "overnight camping ride",
        "adventure motorcycle programs",
        "private off road training",
        "two day off road training",
        "family camping ride bangalore",
        "dirt ride camp programs",
    ],
    alternates: { canonical: "/programs" },
    openGraph: {
        type: "website",
        title: "DRC Off-Road Programs — Training, Trails & Adventure Experiences",
        description:
            "Private off-road training, guided off-road trails, overnight camping rides & family adventures near Bangalore.",
        url: "/programs",
    },
};

function programsJsonLd() {
    return {
        "@context": "https://schema.org",
        "@type": "ItemList",
        name: "DRC Off-Road Programs",
        numberOfItems: programs.length,
        itemListElement: programs.map((p, i) => ({
            "@type": "ListItem",
            position: i + 1,
            item: {
                "@type": p.category === "training" ? "Course" : "Product",
                name: p.name,
                description: p.description,
                ...(p.category === "training"
                    ? {
                        provider: { "@type": "Organization", name: "Dirt Ride Camp", url: BASE_URL },
                        url: `${BASE_URL}/programs`,
                    }
                    : {}),
                offers: {
                    "@type": "Offer",
                    price: p.price,
                    priceCurrency: "INR",
                    availability: "https://schema.org/InStock",
                    url: `${BASE_URL}/programs`,
                },
            },
        })),
    };
}

export default function ProgramsPage() {
    return (
        <div>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(programsJsonLd()) }} />
            <BreadcrumbJsonLd
                items={[
                    { name: "Home", url: BASE_URL },
                    { name: "Programs", url: `${BASE_URL}/programs` },
                ]}
            />

            {/* Hero */}
            <section className="relative overflow-hidden border-b border-border">
                <div className="absolute inset-0 bg-gradient-to-br from-orange/15 via-background to-background" />
                <div className="absolute inset-0 opacity-[0.04] bg-[radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] [background-size:22px_22px]" />
                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
                    <span className="text-orange text-sm font-semibold tracking-[0.3em] uppercase">Ride · Learn · Explore</span>
                    <h1 className="font-heading text-5xl sm:text-6xl lg:text-7xl font-bold mt-4 max-w-4xl">
                        DRC Programs
                    </h1>
                    <p className="text-foreground/70 text-lg mt-5 max-w-2xl">
                        Structured off-road training, guided off-road trails and premium adventure experiences — built to take you
                        from your first standing position to confident technical trail riding.
                    </p>
                    <div className="flex flex-wrap gap-3 mt-8">
                        <Link href="#training" className="inline-flex items-center gap-1.5 bg-orange text-white font-heading font-semibold uppercase tracking-wider px-6 py-3 rounded-sm hover:bg-orange-dark transition-colors">
                            Training <ChevronRight className="w-4 h-4" />
                        </Link>
                        <Link href="#trails" className="inline-flex items-center gap-1.5 border border-orange text-orange font-heading font-semibold uppercase tracking-wider px-6 py-3 rounded-sm hover:bg-orange hover:text-white transition-colors">
                            Trails
                        </Link>
                        <Link href="#special" className="inline-flex items-center gap-1.5 border border-border text-foreground font-heading font-semibold uppercase tracking-wider px-6 py-3 rounded-sm hover:border-orange/50 transition-colors">
                            Special Experiences
                        </Link>
                    </div>
                </div>
            </section>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
                {/* Skill progression */}
                <section className="mt-20">
                    <div className="text-center max-w-2xl mx-auto">
                        <span className="text-orange text-sm font-semibold tracking-[0.3em] uppercase">What you&apos;ll learn</span>
                        <h2 className="font-heading text-3xl sm:text-4xl font-bold mt-2">Skill Progression</h2>
                        <div className="w-20 h-1 bg-orange rounded-full mt-4 mx-auto" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-10">
                        {skillProgression.map((lvl, i) => (
                            <div key={lvl.level} className="relative bg-surface border border-border rounded-sm p-6 hover:border-orange/40 transition-colors">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-semibold text-muted uppercase tracking-wider">{lvl.level}</span>
                                    <span className="font-heading text-3xl font-bold text-orange/30">0{i + 1}</span>
                                </div>
                                <h3 className="font-heading text-xl font-bold mt-1 text-orange">{lvl.title}</h3>
                                <ul className="mt-4 space-y-1.5">
                                    {lvl.items.map((it) => (
                                        <li key={it} className="text-sm text-foreground/75">{it}</li>
                                    ))}
                                </ul>
                                {i < skillProgression.length - 1 && (
                                    <ArrowDown className="hidden md:block absolute -right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-orange/50 rotate-[-90deg] z-10" />
                                )}
                            </div>
                        ))}
                    </div>
                </section>

                {/* Program catalog (interactive) */}
                <ProgramsExplorer />

                {/* Customer journey */}
                <section className="mt-24">
                    <div className="text-center max-w-2xl mx-auto">
                        <span className="text-orange text-sm font-semibold tracking-[0.3em] uppercase">Your DRC path</span>
                        <h2 className="font-heading text-3xl sm:text-4xl font-bold mt-2">The Rider Journey</h2>
                        <div className="w-20 h-1 bg-orange rounded-full mt-4 mx-auto" />
                    </div>
                    <div className="flex flex-wrap items-center justify-center gap-3 mt-10">
                        {customerJourney.map((step, i) => (
                            <div key={step} className="flex items-center gap-3">
                                <span className="font-heading text-lg font-bold uppercase tracking-wider bg-surface border border-orange/30 text-orange px-5 py-2.5 rounded-sm">
                                    {step}
                                </span>
                                {i < customerJourney.length - 1 && <ChevronRight className="w-5 h-5 text-orange/60" />}
                            </div>
                        ))}
                    </div>

                    <div className="mt-10 bg-surface border border-border rounded-sm p-6">
                        <p className="text-sm font-semibold text-muted uppercase tracking-wider mb-4">Recommended progression</p>
                        <div className="flex flex-wrap items-center gap-2">
                            {recommendedProgression.map((step, i) => (
                                <div key={step} className="flex items-center gap-2">
                                    <span className="text-sm bg-background border border-border rounded-sm px-3 py-1.5">{step}</span>
                                    {i < recommendedProgression.length - 1 && <ChevronRight className="w-4 h-4 text-orange/50" />}
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Rider requirements */}
                <section className="mt-24 grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-surface border border-border rounded-sm p-6">
                        <h3 className="font-heading text-xl font-bold flex items-center gap-2">
                            <ShieldCheck className="w-5 h-5 text-success" /> Mandatory Gear
                        </h3>
                        <ul className="mt-4 space-y-2">
                            {riderRequirements.mandatory.map((it) => (
                                <li key={it} className="flex items-start gap-2 text-sm text-foreground/80">
                                    <span className="text-success mt-1">●</span> {it}
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="bg-surface border border-border rounded-sm p-6">
                        <h3 className="font-heading text-xl font-bold flex items-center gap-2">
                            <ShieldAlert className="w-5 h-5 text-warning" /> Strongly Recommended
                        </h3>
                        <ul className="mt-4 space-y-2">
                            {riderRequirements.recommended.map((it) => (
                                <li key={it} className="flex items-start gap-2 text-sm text-foreground/80">
                                    <span className="text-warning mt-1">●</span> {it}
                                </li>
                            ))}
                        </ul>
                    </div>
                </section>

                {/* Safety disclaimer */}
                <section className="mt-10 space-y-3">
                    {safetyDisclaimers.map((text) => (
                        <div key={text} className="flex items-start gap-3 bg-orange/5 border border-orange/20 rounded-sm p-4">
                            <ShieldAlert className="w-5 h-5 text-orange shrink-0 mt-0.5" />
                            <p className="text-sm text-foreground/75 leading-relaxed">{text}</p>
                        </div>
                    ))}
                </section>

                {/* Bottom CTA */}
                <section className="mt-16 text-center bg-surface border border-orange/30 rounded-sm p-10">
                    <h2 className="font-heading text-3xl font-bold">Ready to ride?</h2>
                    <p className="text-muted mt-2 max-w-xl mx-auto">
                        Programs start from just {formatINR(599)}. Pick a program above and request your booking — our team confirms your slot and details personally.
                    </p>
                    <div className="flex flex-wrap justify-center gap-3 mt-6">
                        <Link href="#training" className="inline-flex items-center gap-1.5 bg-orange text-white font-heading font-semibold uppercase tracking-wider px-6 py-3 rounded-sm hover:bg-orange-dark transition-colors">
                            Browse Programs
                        </Link>
                        <a href="https://wa.me/919414870102" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 border border-border text-foreground font-heading font-semibold uppercase tracking-wider px-6 py-3 rounded-sm hover:border-orange/50 transition-colors">
                            Ask on WhatsApp
                        </a>
                    </div>
                </section>
            </div>
        </div>
    );
}
