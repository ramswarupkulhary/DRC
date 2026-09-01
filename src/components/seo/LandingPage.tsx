import Link from "next/link";
import { Check, ChevronRight, ArrowRight } from "lucide-react";
import { FAQJsonLd, BreadcrumbJsonLd } from "@/components/seo/JsonLd";
import type { LandingPageData } from "@/lib/landingPages";

const BASE_URL = "https://www.dirtridecamp.com";

export function LandingPage({ data }: { data: LandingPageData }) {
  return (
    <div>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: BASE_URL },
          { name: data.breadcrumb, url: `${BASE_URL}/${data.slug}` },
        ]}
      />
      <FAQJsonLd faqs={data.faqs.map((f) => ({ question: f.q, answer: f.a }))} />

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 bg-gradient-to-br from-orange/15 via-background to-background" />
        <div className="absolute inset-0 opacity-[0.04] bg-[radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] [background-size:22px_22px]" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-24">
          <span className="text-orange text-sm font-semibold tracking-[0.3em] uppercase">{data.accent}</span>
          <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold mt-4">{data.h1}</h1>
          <p className="text-foreground/75 text-lg mt-5 leading-relaxed">{data.intro}</p>
          <div className="flex flex-wrap gap-3 mt-8">
            <Link href="/programs" className="inline-flex items-center gap-1.5 bg-orange text-white font-heading font-semibold uppercase tracking-wider px-6 py-3 rounded-sm hover:bg-orange-dark transition-colors">
              Book Now <ChevronRight className="w-4 h-4" />
            </Link>
            <a href="https://wa.me/919414870102" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 border border-border text-foreground font-heading font-semibold uppercase tracking-wider px-6 py-3 rounded-sm hover:border-orange/50 transition-colors">
              Ask on WhatsApp
            </a>
          </div>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-14">
        {/* Content sections */}
        {data.sections.map((section) => (
          <section key={section.heading}>
            <h2 className="font-heading text-2xl sm:text-3xl font-bold">{section.heading}</h2>
            <div className="w-14 h-1 bg-orange rounded-full mt-3 mb-5" />
            <p className="text-foreground/80 leading-relaxed">{section.body}</p>
            {section.bullets && (
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 mt-4">
                {section.bullets.map((b) => (
                  <li key={b} className="flex items-start gap-2 text-foreground/80">
                    <Check className="w-4 h-4 text-orange shrink-0 mt-1" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        ))}

        {/* FAQ */}
        <section>
          <h2 className="font-heading text-2xl sm:text-3xl font-bold">Frequently Asked Questions</h2>
          <div className="w-14 h-1 bg-orange rounded-full mt-3 mb-6" />
          <div className="space-y-4">
            {data.faqs.map((f) => (
              <div key={f.q} className="bg-surface border border-border rounded-sm p-5">
                <h3 className="font-heading text-lg font-semibold">{f.q}</h3>
                <p className="text-foreground/75 mt-2 leading-relaxed">{f.a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Related links */}
        <section>
          <h2 className="font-heading text-xl font-bold mb-4">Explore more</h2>
          <div className="flex flex-wrap gap-3">
            {data.related.map((r) => (
              <Link key={r.href} href={r.href} className="inline-flex items-center gap-1.5 text-sm bg-surface border border-border rounded-sm px-4 py-2 hover:border-orange/50 hover:text-orange transition-colors">
                {r.label} <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="text-center bg-surface border border-orange/30 rounded-sm p-10">
          <h2 className="font-heading text-3xl font-bold">{data.ctaTitle}</h2>
          <p className="text-muted mt-2 max-w-xl mx-auto">{data.ctaText}</p>
          <div className="flex flex-wrap justify-center gap-3 mt-6">
            <Link href="/programs" className="inline-flex items-center gap-1.5 bg-orange text-white font-heading font-semibold uppercase tracking-wider px-6 py-3 rounded-sm hover:bg-orange-dark transition-colors">
              Browse Programs
            </Link>
            <Link href="/contact" className="inline-flex items-center gap-1.5 border border-border text-foreground font-heading font-semibold uppercase tracking-wider px-6 py-3 rounded-sm hover:border-orange/50 transition-colors">
              Contact Us
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
