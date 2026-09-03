import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight, ShieldAlert } from "lucide-react";
import { ProgramsExplorer } from "@/components/programs/ProgramsExplorer";
import { BreadcrumbJsonLd } from "@/components/seo/JsonLd";
import {
    safetyDisclaimers,
    type Program,
} from "@/lib/programs";
import { listPrograms } from "@/lib/programsDb";

export const dynamic = "force-dynamic";

const BASE_URL = "https://www.dirtridecamp.com";

export const metadata: Metadata = {
    title: "Family & Friends Overnighter Experiences | DRC Bangalore",
    description:
        "Bring family and friends to the DRC overnighter — camping, hospitality and the outdoors together near Bangalore. For Off-Road training, Private 1:1 coaching and guided trails, see DRC Training.",
    keywords: [
        "family camping ride bangalore",
        "overnight camping ride",
        "adventure motorcycle experiences",
        "family off road experience",
        "friends camping trip bangalore",
        "dirt ride camp programs",
    ],
    alternates: { canonical: "/programs" },
    openGraph: {
        type: "website",
        title: "Family & Friends Overnighter Experiences | Dirt Ride Camp Bangalore",
        description:
            "Bring family and friends to the DRC off-road overnighter — camping, hospitality and the outdoors together near Bangalore.",
        url: "/programs",
    },
    twitter: {
        card: "summary_large_image",
        title: "Family & Friends Overnighter Experiences | Dirt Ride Camp",
        description: "Bring family and friends to the DRC off-road overnighter near Bangalore.",
    },
};

function programsJsonLd(programs: Program[]) {
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

export default async function ProgramsPage() {
    const programs = await listPrograms({ activeOnly: true });
    return (
        <div>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(programsJsonLd(programs)) }} />
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
                    <span className="text-orange text-sm font-semibold tracking-[0.3em] uppercase">Bring your people</span>
                    <h1 className="font-heading text-5xl sm:text-6xl lg:text-7xl font-bold mt-4 max-w-4xl">
                        Family &amp; Friends
                    </h1>
                    <p className="text-foreground/70 text-lg mt-5 max-w-2xl">
                        Share the DRC overnighter adventure with the people you love — camping, hospitality and the outdoors,
                        together. For structured Off-Road training, Private 1:1 coaching and guided trails, head to Training.
                    </p>
                    <div className="flex flex-wrap gap-3 mt-8">
                        <Link href="#special" className="inline-flex items-center gap-1.5 bg-orange text-white font-heading font-semibold uppercase tracking-wider px-6 py-3 rounded-sm hover:bg-orange-dark transition-colors">
                            Family &amp; Friends Plans <ChevronRight className="w-4 h-4" />
                        </Link>
                        <Link href="/trainings" className="inline-flex items-center gap-1.5 border border-orange text-orange font-heading font-semibold uppercase tracking-wider px-6 py-3 rounded-sm hover:bg-orange hover:text-white transition-colors">
                            Off-Road Training
                        </Link>
                    </div>
                </div>
            </section>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
                {/* Special experiences — Family & Friends (full list passed so the
                    Family/Friends cards can open the Overnighter booking). */}
                <ProgramsExplorer programs={programs} categories={["special"]} />

                {/* Training & trails moved to the Training section */}
                <section className="mt-16 bg-surface border border-border rounded-sm p-8 text-center">
                    <h2 className="font-heading text-2xl sm:text-3xl font-bold">Looking for Off-Road Training or Trails?</h2>
                    <p className="text-muted mt-2 max-w-xl mx-auto">
                        Structured Off-Road training, Private 1:1 coaching and guided off-road trails now live under Training.
                    </p>
                    <Link href="/trainings" className="inline-flex items-center gap-1.5 bg-orange text-white font-heading font-semibold uppercase tracking-wider px-6 py-3 rounded-sm hover:bg-orange-dark transition-colors mt-6">
                        Explore Training <ChevronRight className="w-4 h-4" />
                    </Link>
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
                    <h2 className="font-heading text-3xl font-bold">Bring your people along</h2>
                    <p className="text-muted mt-2 max-w-xl mx-auto">
                        Add family or friends to the DRC overnighter and share the camping, hospitality and outdoors together — request your booking and our team confirms your slot personally.
                    </p>
                    <div className="flex flex-wrap justify-center gap-3 mt-6">
                        <Link href="#special" className="inline-flex items-center gap-1.5 bg-orange text-white font-heading font-semibold uppercase tracking-wider px-6 py-3 rounded-sm hover:bg-orange-dark transition-colors">
                            View Family &amp; Friends Plans
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

