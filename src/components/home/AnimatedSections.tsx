"use client";

import { FadeIn, StaggerContainer, StaggerItem } from "@/components/ui/Animations";
import { Trophy, GraduationCap, Compass, Users, Star, ArrowRight, ChevronRight, Calendar, MapPin } from "lucide-react";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";

const pillars = [
  {
    icon: Trophy,
    title: "DRC Racing",
    desc: "Six official races, every year, across India. Championship-grade motorsport built from the rider up.",
  },
  {
    icon: GraduationCap,
    title: "Training & Academy",
    desc: "Structured off-road progression — from first time on dirt to enduro, rock garden and hill-climb ready.",
  },
  {
    icon: Compass,
    title: "Adventure",
    desc: "Curated expeditions and camping rides across Karnataka and beyond. On the horizon: a five-day desert endurance in Rajasthan.",
  },
  {
    icon: Users,
    title: "Community & Culture",
    desc: "A home for Indian motorcycle culture — riders, content, brands and experiences under one platform.",
  },
];

export function AnimatedHero() {
  return (
    <section className="relative border-b border-border overflow-hidden bg-background">
      {/* Ticker rail — data-forward, corporate cue. */}
      <div className="border-b border-border bg-background/95">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10 py-3 flex items-center justify-between gap-6 font-mono text-[10px] uppercase tracking-[0.2em]">
          <div className="flex items-center gap-2 text-foreground/60">
            <span className="w-1.5 h-1.5 rounded-full bg-orange animate-pulse" />
            <span>Live &middot; DRC Racing calendar &middot; 2026</span>
          </div>
          <div className="hidden md:flex items-center gap-6 text-foreground/50">
            <span>Round 01 &mdash; Ultimate Rider &middot; Bengaluru &middot; Dec 12&ndash;13</span>
          </div>
          <div className="text-foreground/50 hidden sm:block">
            DRC Motorsports Pvt Ltd
          </div>
        </div>
      </div>

      {/* Main hero: split panel — statement (left) / brand mark (right). */}
      <div className="relative">
        <div className="max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-[58%_42%] items-stretch min-h-[calc(100vh-9rem)]">
          {/* Left panel — statement */}
          <motion.div
            className="py-16 sm:py-20 lg:py-28 px-4 sm:px-6 lg:pl-10 lg:pr-16 flex flex-col justify-between lg:border-r border-border"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            <div>
              <div className="flex items-center gap-4 mb-8">
                <span className="font-mono text-xs uppercase tracking-[0.28em] text-orange">01</span>
                <span className="h-px flex-1 max-w-[3rem] bg-orange" />
                <span className="font-mono text-xs uppercase tracking-[0.28em] text-foreground/60">The Platform</span>
              </div>

              <h1 className="font-heading font-bold uppercase text-[3.5rem] sm:text-[5.5rem] lg:text-[7.5rem] xl:text-[8.5rem] leading-[0.88] tracking-[-0.025em]">
                Adventure
                <br />
                <span className="text-orange">isn&rsquo;t found.</span>
                <br />
                It&rsquo;s <span className="border-b-4 border-orange">earned</span>.
              </h1>

              <p className="mt-10 max-w-xl text-lg sm:text-xl text-foreground/70 leading-relaxed">
                <span className="text-foreground">DRC Motorsports Pvt Ltd</span> is an Indian motorcycle culture and motorsport platform. Racing, training, adventure and community &mdash; built around the rider.
              </p>

              <div className="mt-12 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <Link href="/events">
                  <Button size="lg" className="uppercase tracking-widest text-sm">
                    DRC Ultimate Rider <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
                <Link href="/about" className="font-heading uppercase tracking-widest text-sm text-foreground/70 hover:text-orange transition-colors border-b border-transparent hover:border-orange pb-1">
                  About the Platform &rarr;
                </Link>
              </div>
            </div>

            {/* Ledger strip pinned to bottom of left panel */}
            <div className="mt-16 lg:mt-0 pt-10 border-t border-border grid grid-cols-3 gap-6 sm:gap-8">
              {[
                { k: "Calendar", v: "6", u: "Races / year" },
                { k: "Coverage", v: "India", u: "Nationwide" },
                { k: "Prize Pool", v: "₹5L", u: "Ultimate Rider" },
              ].map((it) => (
                <div key={it.k}>
                  <div className="font-mono text-[10px] uppercase tracking-[0.28em] text-orange">{it.k}</div>
                  <div className="font-heading text-3xl sm:text-4xl font-bold uppercase mt-3 leading-none tracking-tight">{it.v}</div>
                  <div className="font-mono text-[10px] uppercase tracking-widest text-foreground/50 mt-2">{it.u}</div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right panel — brand mark, treated like a keynote / product page. */}
          <motion.div
            className="relative border-t lg:border-t-0 border-border px-4 sm:px-6 lg:pl-16 lg:pr-10 py-16 sm:py-20 lg:py-28 flex flex-col justify-between bg-surface/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
          >
            {/* Corner label */}
            <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.28em] text-foreground/50">
              <span>&#8213; The Mark</span>
              <span>DRC / MSPT / 2026</span>
            </div>

            {/* Logo, huge, treated as the visual */}
            <div className="flex items-center justify-center py-10 lg:py-16 relative">
              {/* Corner brackets like a keynote frame */}
              <span className="absolute top-0 left-0 w-8 h-8 border-t border-l border-orange" />
              <span className="absolute top-0 right-0 w-8 h-8 border-t border-r border-orange" />
              <span className="absolute bottom-0 left-0 w-8 h-8 border-b border-l border-orange" />
              <span className="absolute bottom-0 right-0 w-8 h-8 border-b border-r border-orange" />

              <Image
                src="/brand/drc-logo-main.png"
                alt="DRC Motorsports"
                width={1000}
                height={1000}
                priority
                className="w-full max-w-md h-auto object-contain"
              />
            </div>

            {/* Footer strip */}
            <div className="pt-8 border-t border-border">
              <div className="font-mono text-[10px] uppercase tracking-[0.28em] text-foreground/50">Rider &middot; Training &middot; Adventure &middot; Motorsport &middot; Racing</div>
              <div className="font-mono text-[10px] uppercase tracking-[0.28em] text-foreground/50 mt-1">Experiences &middot; Community &middot; Content &middot; Brands</div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Bottom category rail — Cisco / Ferrari style secondary nav */}
      <div className="border-t border-border bg-background">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-border">
            {[
              { href: "/events", label: "Racing", sub: "DRC Racing calendar" },
              { href: "/trainings", label: "Training", sub: "Academy programs" },
              { href: "/programs", label: "Adventure", sub: "Expeditions & camps" },
              { href: "/contact", label: "Partner", sub: "Sponsor DRC" },
            ].map((c) => (
              <Link
                key={c.href}
                href={c.href}
                className="group px-4 md:px-8 py-6 hover:bg-surface transition-colors relative"
              >
                <div className="font-heading text-xl font-bold uppercase tracking-tight group-hover:text-orange transition-colors">{c.label}</div>
                <div className="font-mono text-[10px] uppercase tracking-widest text-foreground/50 mt-1">{c.sub}</div>
                <ArrowRight className="w-4 h-4 text-foreground/40 group-hover:text-orange group-hover:translate-x-1 transition-all absolute top-6 right-4 md:right-8" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export function AnimatedStats() {
  const items = [
    { k: "Official races / year", v: "6" },
    { k: "Ultimate Rider prize pool", v: "₹5L" },
    { k: "Flag-off", v: "Dec\u00A012\u201313" },
    { k: "Country", v: "India" },
  ];
  return (
    <section className="bg-background border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-border">
          {items.map((it) => (
            <div key={it.k} className="py-8 md:py-10 md:px-8 first:md:pl-0">
              <div className="font-mono text-[10px] uppercase tracking-widest text-orange">{it.k}</div>
              <div className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold uppercase mt-3 leading-none">{it.v}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function UltimateRiderSpotlight() {
  return (
    <section className="relative border-b border-border bg-surface overflow-hidden">
      <div className="absolute top-0 right-0 w-2 h-full bg-orange" />
      <div className="absolute inset-0 bg-grid opacity-30 pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          <div className="lg:col-span-7">
            <div className="flex items-center gap-3 mb-4">
              <span className="h-px w-10 bg-orange" />
              <span className="eyebrow">The first official DRC race</span>
            </div>
            <h2 className="font-heading font-bold uppercase text-4xl sm:text-6xl lg:text-7xl leading-[0.95] tracking-[-0.02em]">
              DRC <span className="text-orange">Ultimate</span> Rider.
            </h2>
            <p className="mt-6 text-lg sm:text-xl text-foreground/70 max-w-2xl leading-relaxed">
              Two days. Every surface. Not just a race — a test of everything.
            </p>

            <div className="mt-10 flex flex-wrap gap-2">
              {["Enduro", "Rock Garden", "Hill Climb", "Slush", "Mud", "Technical"].map((s) => (
                <span key={s} className="font-mono text-[11px] uppercase tracking-widest px-3 py-1.5 border border-border text-foreground/80">
                  {s}
                </span>
              ))}
            </div>

            <div className="mt-10 flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <Link href="/events">
                <Button size="lg" className="uppercase tracking-wider">Race details <ArrowRight className="w-5 h-5" /></Button>
              </Link>
              <a
                href="/magazine/DRC-Ultimate-Rider.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="font-heading uppercase tracking-widest text-sm text-foreground/70 hover:text-orange transition-colors border-b border-transparent hover:border-orange pb-1"
              >
                Sponsor / Partner Deck →
              </a>
            </div>
          </div>

          <aside className="lg:col-span-5 lg:pl-8 lg:border-l border-border">
            <div className="grid grid-cols-3 gap-6 pb-8 border-b border-border">
              <div>
                <div className="font-mono text-[10px] uppercase tracking-widest text-orange">Dates</div>
                <div className="font-heading text-xl font-bold uppercase mt-1">Dec 12–13</div>
                <div className="font-mono text-xs text-muted">2026</div>
              </div>
              <div>
                <div className="font-mono text-[10px] uppercase tracking-widest text-orange">City</div>
                <div className="font-heading text-xl font-bold uppercase mt-1">Bengaluru</div>
              </div>
              <div>
                <div className="font-mono text-[10px] uppercase tracking-widest text-orange">Prize Pool</div>
                <div className="font-heading text-xl font-bold uppercase mt-1 text-orange">₹5 Lakh</div>
              </div>
            </div>

            <div className="mt-6 space-y-6">
              <div>
                <div className="flex items-baseline gap-3">
                  <span className="font-heading text-2xl font-bold text-orange">SAT</span>
                  <span className="font-mono text-[10px] uppercase tracking-widest text-muted">The proving ground</span>
                </div>
                <p className="text-sm text-foreground/70 mt-2 leading-relaxed">Qualification, elimination and challenges across every surface. The riders who last the day have not won. They have only earned Sunday.</p>
              </div>
              <div>
                <div className="flex items-baseline gap-3">
                  <span className="font-heading text-2xl font-bold text-orange">SUN</span>
                  <span className="font-mono text-[10px] uppercase tracking-widest text-muted">The final</span>
                </div>
                <p className="text-sm text-foreground/70 mt-2 leading-relaxed">The field is smaller. The surfaces still change. This is where the weekend is decided.</p>
              </div>
              <p className="text-xs text-muted pt-4 border-t border-border/50 leading-relaxed">
                In partnership with <span className="text-foreground font-semibold">Dev Venkat</span> (3× National Champion) and Tribal Adventure — ground that already knows how to hold a championship.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}

export function AnimatedFeatures() {
  return (
    <section className="relative bg-background border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
        <FadeIn>
          <div className="mb-16 max-w-3xl">
            <div className="flex items-center gap-3 mb-4">
              <span className="h-px w-10 bg-orange" />
              <span className="eyebrow">The platform</span>
            </div>
            <h2 className="font-heading font-bold uppercase text-4xl sm:text-5xl lg:text-6xl leading-[0.95] tracking-[-0.02em]">
              A world around the <span className="text-orange">rider</span>.
            </h2>
            <p className="mt-6 text-lg text-foreground/70 max-w-2xl leading-relaxed">
              Not a single weekend. Not a single start line. DRC is a motorcycle culture platform where riding, training, adventure, motorsport, racing, experiences, community, content and brands belong together.
            </p>
          </div>
        </FadeIn>
        <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-0 border-t border-l border-border" staggerDelay={0.08}>
          {pillars.map((f, i) => (
            <StaggerItem key={f.title}>
              <div className="group h-full p-8 border-r border-b border-border bg-background hover:bg-surface transition-colors relative">
                <div className="font-mono text-xs uppercase tracking-widest text-orange">0{i + 1}</div>
                <f.icon className="w-8 h-8 text-foreground/60 group-hover:text-orange transition-colors mt-6" strokeWidth={1.5} />
                <h3 className="font-heading text-2xl font-bold uppercase mt-6 leading-tight">{f.title}</h3>
                <p className="text-sm text-foreground/70 leading-relaxed mt-3">{f.desc}</p>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}

export function AnimatedTestimonials({ reviews }: { reviews?: { name: string; text: string; location: string; rating: number; image?: string | null }[] }) {
  const testimonials = reviews && reviews.length > 0 ? reviews : [];
  if (testimonials.length === 0) return null;
  return (
    <section className="bg-surface border-y border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <FadeIn>
          <div className="mb-12">
            <span className="eyebrow">Field notes</span>
            <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-semibold mt-3">What riders sent us after their ride.</h2>
          </div>
        </FadeIn>
        <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-6" staggerDelay={0.2}>
          {testimonials.map((t) => {
            const image = (t as { image?: string | null }).image ?? null;
            const initials = t.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
            return (
              <StaggerItem key={t.name}>
                <figure className="bg-background p-6 border-l-2 border-orange/60 flex flex-col h-full">
                  <blockquote className="font-heading italic text-lg leading-snug text-foreground/90">
                    &ldquo;{t.text}&rdquo;
                  </blockquote>
                  <figcaption className="mt-5 pt-4 border-t border-border flex items-center gap-3">
                    {image ? (
                      <img src={image} alt={t.name} className="w-10 h-10 rounded-full object-cover" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-tan-dark/20 flex items-center justify-center text-tan-dark font-heading text-sm font-bold">
                        {initials}
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="font-semibold text-sm text-foreground">— {t.name}</p>
                      <div className="flex gap-0.5 mt-0.5">
                        {Array.from({ length: t.rating }).map((_, i) => (
                          <Star key={i} className="w-3 h-3 fill-orange text-orange" />
                        ))}
                      </div>
                    </div>
                  </figcaption>
                </figure>
              </StaggerItem>
            );
          })}
        </StaggerContainer>
      </div>
    </section>
  );
}

export function AnimatedCTA() {
  const { status } = useSession();
  const loggedIn = status === "authenticated";
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
      <FadeIn>
        <div className="text-center space-y-6 max-w-2xl mx-auto">
          <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-semibold">
            Ride with DRC.
          </h2>
          <p className="text-muted text-lg">Pick a ride, join a training, or race at Ultimate Rider. Whatever it is — adventure isn&rsquo;t found. It&rsquo;s earned.</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href={loggedIn ? "/rides" : "/signup"}>
              <Button size="lg" className="min-w-[200px]">{loggedIn ? "Explore Rides" : "Join DRC"} <ArrowRight className="w-5 h-5" /></Button>
            </Link>
            <a href="https://wa.me/919414870102" target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="lg" className="min-w-[200px]">WhatsApp Us</Button>
            </a>
          </div>
        </div>
      </FadeIn>
    </section>
  );
}

export function AnimatedRidesSection({ children }: { children: React.ReactNode }) {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
      <FadeIn>
        <div className="text-center mb-12">
          <span className="eyebrow">On the calendar</span>
          <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-semibold mt-3">Rides we're running next.</h2>
          <p className="text-muted mt-3 max-w-xl mx-auto">Small groups. Real terrain. Book the slot; we'll send you the pre-ride brief on WhatsApp.</p>
        </div>
      </FadeIn>
      <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {children}
      </StaggerContainer>
      <FadeIn delay={0.3}>
        <div className="text-center mt-10">
          <Link href="/rides"><Button variant="outline" size="md">View All Rides <ChevronRight className="w-4 h-4" /></Button></Link>
        </div>
      </FadeIn>
    </section>
  );
}

export function AnimatedTrainingsSection({ children }: { children: React.ReactNode }) {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
      <FadeIn>
        <div className="text-center mb-12">
          <span className="eyebrow">Training</span>
          <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-semibold mt-3">Learn the stuff YouTube can't teach you.</h2>
          <p className="text-muted mt-3 max-w-xl mx-auto">Body position, throttle control, standing up, picking a line, picking the bike back up. In person, on dirt.</p>
        </div>
      </FadeIn>
      <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {children}
      </StaggerContainer>
      <FadeIn delay={0.3}>
        <div className="text-center mt-10">
          <Link href="/trainings"><Button variant="outline" size="md">All Programs <ChevronRight className="w-4 h-4" /></Button></Link>
        </div>
      </FadeIn>
    </section>
  );
}

export function AnimatedCard({ children }: { children: React.ReactNode }) {
  return <StaggerItem>{children}</StaggerItem>;
}

export function AnimatedFAQ({ faqs }: { faqs: { question: string; answer: string }[] }) {
  return (
    <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
      <FadeIn>
        <div className="text-center mb-12">
          <span className="eyebrow">FAQ</span>
          <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-semibold mt-3">Questions we get every week.</h2>
        </div>
      </FadeIn>
      <StaggerContainer className="space-y-4">
        {faqs.map((faq, i) => (
          <StaggerItem key={i}>
            <details className="group bg-surface border border-border rounded-sm overflow-hidden">
              <summary className="flex items-center justify-between p-5 cursor-pointer font-heading font-semibold text-lg hover:text-orange transition-colors">
                {faq.question}
                <ChevronRight className="w-5 h-5 text-muted group-open:rotate-90 transition-transform" />
              </summary>
              <div className="px-5 pb-5 text-muted leading-relaxed">
                {faq.answer}
              </div>
            </details>
          </StaggerItem>
        ))}
      </StaggerContainer>
    </section>
  );
}
