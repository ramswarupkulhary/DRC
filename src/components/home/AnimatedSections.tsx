"use client";

import { FadeIn, StaggerContainer, StaggerItem } from "@/components/ui/Animations";
import { Trophy, GraduationCap, Compass, Users, Star, ArrowRight, ChevronRight, Calendar, MapPin } from "lucide-react";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
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
    <section className="relative overflow-hidden border-b border-border">
      {/* Racing grid + orange stripe glow. */}
      <div className="absolute inset-0 bg-grid opacity-40 pointer-events-none" />
      <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-orange/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 sm:pt-28 pb-16 sm:pb-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="flex items-center gap-3 mb-6">
            <span className="h-px w-10 bg-orange" />
            <span className="eyebrow">DRC Motorsports Pvt Ltd &middot; Bengaluru</span>
          </div>

          <h1 className="font-heading font-bold uppercase text-[3.25rem] sm:text-[5rem] lg:text-[7.5rem] leading-[0.92] tracking-[-0.02em] max-w-5xl">
            Adventure isn&rsquo;t found.
            <br />
            <span className="text-orange">It&rsquo;s earned.</span>
          </h1>

          <p className="mt-8 text-lg sm:text-xl text-foreground/70 max-w-2xl leading-relaxed">
            An Indian motorcycle culture &amp; motorsport platform. Racing, training, adventure and community — built around the rider.
          </p>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mt-10">
            <Link href="/events">
              <Button size="lg" className="uppercase tracking-wider">
                DRC Ultimate Rider <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
            <Link href="/rides" className="font-heading uppercase tracking-widest text-sm text-foreground/70 hover:text-orange transition-colors border-b border-transparent hover:border-orange pb-1">
              Rides &amp; Training →
            </Link>
          </div>

          <div className="mt-16 pt-8 border-t border-border/60 grid grid-cols-2 sm:grid-cols-4 gap-8 max-w-4xl">
            {[
              { k: "The Platform", v: "DRC Racing" },
              { k: "The Calendar", v: "6 Races / Year" },
              { k: "The Country", v: "India" },
              { k: "The Flag-off", v: "Dec 12–13, 2026" },
            ].map((it) => (
              <div key={it.k}>
                <div className="font-mono text-[10px] uppercase tracking-widest text-orange">{it.k}</div>
                <div className="font-heading text-lg sm:text-xl font-bold uppercase mt-2">{it.v}</div>
              </div>
            ))}
          </div>
        </motion.div>
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
