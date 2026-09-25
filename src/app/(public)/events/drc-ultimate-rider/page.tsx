import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { BreadcrumbJsonLd } from "@/components/seo/JsonLd";
import { ArrowRight, Calendar, MapPin, Trophy, Flag, Users } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "DRC Ultimate Rider — Race Brief | Bengaluru, 12–13 Dec 2026",
  description:
    "DRC Ultimate Rider — the first official DRC race. Two-day motorsport event across enduro, rock garden, hill climb, slush, mud and technical. ₹5 Lakh prize pool. Bengaluru, 12–13 December 2026.",
  alternates: { canonical: "/events/drc-ultimate-rider" },
  openGraph: {
    type: "website",
    title: "DRC Ultimate Rider — Race Brief",
    description:
      "Two days. Every surface. Not just a race — a test of everything. Bengaluru, 12–13 December 2026. ₹5 Lakh prize pool.",
    url: "/events/drc-ultimate-rider",
  },
};

const surfaces = ["Enduro", "Rock Garden", "Hill Climb", "Slush", "Mud", "Technical"];

const categories = [
  { name: "Amateurs", fee: 4999, note: "First-timers & club-level riders." },
  { name: "Professionals", fee: 7999, note: "Championship & podium-level riders." },
  { name: "Women Category", fee: 4999, note: "Open to all women riders across skill levels." },
  { name: "Big Bikes", fee: 7999, note: "Adventure & big-capacity motorcycles." },
];

const experienceItems = [
  { label: "Watch", desc: "Championship racing. Saturday's filter. Sunday's Final." },
  { label: "Play", desc: "ATV rides. Kids activities. Rider experiences on the ground." },
  { label: "Eat", desc: "Food as a place to land between sessions — and a reason to stay." },
  { label: "Connect", desc: "Community, riders, brand activations where the weekend happens." },
  { label: "Celebrate", desc: "A DJ night party after the engines quiet." },
];

const BASE_URL = "https://www.dirtridecamp.com";

export default function UltimateRiderPage() {
  return (
    <div>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: BASE_URL },
          { name: "Events", url: `${BASE_URL}/events` },
          { name: "DRC Ultimate Rider", url: `${BASE_URL}/events/drc-ultimate-rider` },
        ]}
      />

      {/* Hero */}
      <section className="relative border-b border-border overflow-hidden">
        <Image
          src="/magazine/ultimate-rider/mx.png"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-center pointer-events-none"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-background/30 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/85 via-background/20 to-transparent pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-10 pt-32 pb-16 sm:pb-24">
          <div className="flex items-center gap-3 mb-5">
            <span className="h-px w-10 bg-orange" />
            <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-foreground/70">
              Round 01 &middot; The first official DRC race
            </span>
          </div>
          <h1 className="font-heading font-bold uppercase text-4xl sm:text-6xl lg:text-7xl leading-[0.9] tracking-[-0.02em] max-w-4xl">
            DRC <span className="text-orange">Ultimate</span> Rider.
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-foreground/85">
            Two days. Every surface. Not just a race — a test of everything.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row gap-4">
            <Link href="/events/drc-ultimate-rider/register">
              <Button size="lg" className="uppercase tracking-widest text-sm">
                Register now <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <a
              href="/magazine/DRC-Ultimate-Rider.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="font-heading uppercase tracking-widest text-xs text-foreground/80 hover:text-orange transition-colors border-b border-transparent hover:border-orange pb-1 self-center"
            >
              Sponsor / partner deck &rarr;
            </a>
          </div>
        </div>
      </section>

      {/* Data ledger */}
      <section className="border-b border-border bg-background">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 grid grid-cols-2 md:grid-cols-4 divide-x divide-border">
          {[
            { k: "Dates", v: "Dec 12–13", u: "2026" },
            { k: "City", v: "Bengaluru", u: "India" },
            { k: "Prize Pool", v: "₹5L", u: "Overall" },
            { k: "Format", v: "2 Days", u: "Sat + Sun" },
          ].map((it) => (
            <div key={it.k} className="px-4 md:px-8 py-8">
              <div className="font-mono text-[10px] uppercase tracking-[0.28em] text-orange">{it.k}</div>
              <div className="font-heading text-3xl sm:text-4xl font-bold uppercase mt-3 leading-none tracking-tight">
                {it.v}
              </div>
              <div className="font-mono text-[10px] uppercase tracking-widest text-muted mt-3">{it.u}</div>
            </div>
          ))}
        </div>
      </section>

      {/* The Weekend format */}
      <section className="border-b border-border">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 py-20 grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-4">
            <div className="flex items-center gap-3 mb-4">
              <span className="h-px w-10 bg-orange" />
              <span className="eyebrow">The weekend</span>
            </div>
            <h2 className="font-heading font-bold uppercase text-3xl sm:text-4xl leading-[1] tracking-[-0.01em]">
              Two days. <span className="text-orange">Every surface.</span>
            </h2>
            <p className="mt-6 text-muted leading-relaxed">
              Ultimate Rider is a two-day motorsport event built to test riders across different forms of off-road
              riding — not a single type of terrain. Saturday filters the field. Sunday decides it.
            </p>
          </div>

          <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="p-8 border border-border bg-surface">
              <div className="flex items-baseline gap-3">
                <span className="font-heading text-4xl font-bold text-orange">SAT</span>
                <span className="font-mono text-[10px] uppercase tracking-widest text-muted">The proving ground</span>
              </div>
              <p className="font-heading text-lg font-semibold uppercase mt-4">
                Qualification &middot; Elimination &middot; Challenges
              </p>
              <p className="text-sm text-muted mt-3 leading-relaxed">
                Saturday is the proving ground. Qualification, elimination and multiple challenges across every surface.
                The riders who last the day have not won. They have only earned Sunday.
              </p>
            </div>

            <div className="p-8 border border-border bg-surface">
              <div className="flex items-baseline gap-3">
                <span className="font-heading text-4xl font-bold text-orange">SUN</span>
                <span className="font-mono text-[10px] uppercase tracking-widest text-muted">The final</span>
              </div>
              <p className="font-heading text-lg font-semibold uppercase mt-4">The Final</p>
              <p className="text-sm text-muted mt-3 leading-relaxed">
                Sunday is the Final. The field is smaller. The surfaces still change. This is where the weekend is
                decided — after every rider still standing has already been tested.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Surfaces */}
      <section className="border-b border-border bg-surface">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 py-16">
          <div className="flex items-center gap-3 mb-6">
            <span className="h-px w-10 bg-orange" />
            <span className="eyebrow">Terrain</span>
          </div>
          <h2 className="font-heading font-bold uppercase text-3xl sm:text-4xl leading-[1] tracking-[-0.01em] max-w-2xl">
            Every surface. <span className="text-orange">On the line.</span>
          </h2>
          <div className="mt-8 flex flex-wrap gap-3">
            {surfaces.map((s) => (
              <span
                key={s}
                className="font-mono text-xs uppercase tracking-widest px-4 py-2 border border-border bg-background text-foreground"
              >
                {s}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Categories & fees */}
      <section id="categories" className="border-b border-border">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 py-20">
          <div className="flex items-center gap-3 mb-4">
            <span className="h-px w-10 bg-orange" />
            <span className="eyebrow">Categories &amp; entry fees</span>
          </div>
          <h2 className="font-heading font-bold uppercase text-3xl sm:text-4xl leading-[1] tracking-[-0.01em] max-w-2xl">
            Pick your <span className="text-orange">line-up</span>.
          </h2>

          <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-0 border-t border-l border-border">
            {categories.map((c, i) => (
              <div
                key={c.name}
                className="p-8 border-r border-b border-border bg-background hover:bg-surface transition-colors flex flex-col"
              >
                <div className="font-mono text-[10px] uppercase tracking-widest text-orange">0{i + 1}</div>
                <h3 className="font-heading text-2xl font-bold uppercase mt-4 leading-tight">{c.name}</h3>
                <p className="text-sm text-muted mt-3 leading-relaxed flex-1">{c.note}</p>
                <div className="mt-6 pt-6 border-t border-border">
                  <div className="font-mono text-[10px] uppercase tracking-widest text-muted">Entry fee</div>
                  <div className="font-heading text-3xl font-bold uppercase mt-1 text-orange">
                    ₹{c.fee.toLocaleString("en-IN")}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 flex flex-col sm:flex-row gap-4">
            <Link href="/events/drc-ultimate-rider/register">
              <Button size="lg" className="uppercase tracking-widest text-sm">
                Register now <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <a
              href="https://wa.me/919414870102"
              target="_blank"
              rel="noopener noreferrer"
              className="font-heading uppercase tracking-widest text-xs text-foreground/80 hover:text-orange transition-colors border-b border-transparent hover:border-orange pb-1 self-center"
            >
              Questions? WhatsApp us &rarr;
            </a>
          </div>
        </div>
      </section>

      {/* Experience around the race */}
      <section className="border-b border-border bg-surface">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 py-20">
          <div className="flex items-center gap-3 mb-4">
            <span className="h-px w-10 bg-orange" />
            <span className="eyebrow">Around the race</span>
          </div>
          <h2 className="font-heading font-bold uppercase text-3xl sm:text-4xl leading-[1] tracking-[-0.01em] max-w-3xl">
            The race is the heart. <span className="text-orange">The experience is everything around it.</span>
          </h2>

          <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-0 border-t border-l border-border">
            {experienceItems.map((e, i) => (
              <div key={e.label} className="p-6 border-r border-b border-border bg-background">
                <div className="font-mono text-[10px] uppercase tracking-widest text-orange">0{i + 1}</div>
                <div className="font-heading text-xl font-bold uppercase mt-3">{e.label}</div>
                <p className="text-xs text-muted mt-2 leading-relaxed">{e.desc}</p>
              </div>
            ))}
          </div>

          <p className="mt-8 font-mono text-[11px] uppercase tracking-widest text-muted">
            On ground &middot; ATV &middot; Food &middot; DJ Night &middot; Kids Activities &middot; Rider Experience &middot;
            Community &middot; Brand Activations &middot; Motorsport
          </p>
        </div>
      </section>

      {/* Partnership */}
      <section className="border-b border-border">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 py-20 grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          <div className="lg:col-span-5">
            <div className="flex items-center gap-3 mb-4">
              <span className="h-px w-10 bg-orange" />
              <span className="eyebrow">Held in partnership with</span>
            </div>
            <h2 className="font-heading font-bold uppercase text-3xl sm:text-4xl leading-[1] tracking-[-0.01em]">
              Ground that already knows how to hold a <span className="text-orange">championship</span>.
            </h2>
          </div>

          <div className="lg:col-span-7 p-8 border border-border bg-surface">
            <div className="font-mono text-[10px] uppercase tracking-widest text-orange">Race partner</div>
            <h3 className="font-heading text-2xl font-bold uppercase mt-3">Dev Venkat</h3>
            <p className="font-mono text-xs uppercase tracking-widest text-muted mt-2">
              3× National Champion &middot; Tribal Adventure
            </p>
            <p className="text-sm text-foreground/80 leading-relaxed mt-5">
              Dev built Tribal Adventure into a home for serious off-road riding. Ultimate Rider is here because the
              dirt, the people and the standard already exist.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-b border-border bg-background">
        <div className="max-w-4xl mx-auto px-6 lg:px-10 py-20 text-center">
          <h2 className="font-heading font-bold uppercase text-3xl sm:text-5xl leading-[0.95] tracking-[-0.01em]">
            This is not the finish line.
            <br />
            <span className="text-orange">It&rsquo;s the flag-off.</span>
          </h2>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/events/drc-ultimate-rider/register">
              <Button size="lg" className="uppercase tracking-widest text-sm">
                Register for Ultimate Rider <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link
              href="/events"
              className="font-heading uppercase tracking-widest text-xs text-foreground/70 hover:text-orange transition-colors border-b border-transparent hover:border-orange pb-1"
            >
              All events &rarr;
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
