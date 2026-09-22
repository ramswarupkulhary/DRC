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
    <section className="relative border-b border-border overflow-hidden">
      <div className="absolute inset-0 pointer-events-none opacity-[0.06] bg-[radial-gradient(circle_at_1px_1px,rgba(30,26,20,1)_1px,transparent_0)] [background-size:14px_14px]" />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 sm:pt-20 pb-14 sm:pb-20">
        <motion.div
          className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-end"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <div className="lg:col-span-8">
            <span className="eyebrow">DRC Motorsports Pvt Ltd &middot; Est. Bengaluru</span>
            <h1 className="font-heading text-[2.75rem] leading-[1.02] sm:text-6xl lg:text-[5.5rem] font-semibold mt-4 max-w-4xl">
              Adventure isn&rsquo;t found. It&rsquo;s earned.
            </h1>
            <p className="font-heading italic text-xl sm:text-2xl text-tan-dark mt-5 max-w-2xl">
              An Indian motorcycle culture &amp; motorsport platform — racing, training, adventure and community, in one place.
            </p>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mt-8">
              <Link href="/events">
                <Button size="lg">See DRC Ultimate Rider <ArrowRight className="w-5 h-5" /></Button>
              </Link>
              <Link href="/rides" className="font-heading text-lg underline decoration-tan-dark/40 underline-offset-4 hover:text-orange hover:decoration-orange transition-colors">
                or explore rides &amp; training →
              </Link>
            </div>
          </div>

          <aside className="lg:col-span-4 border-t-2 border-tan-dark/40 pt-5 lg:border-t-0 lg:border-l-2 lg:pt-0 lg:pl-6 lg:self-stretch flex flex-col justify-end">
            <p className="font-mono text-xs text-tan-dark uppercase tracking-widest">The platform</p>
            <p className="font-heading text-lg leading-snug mt-3 text-foreground/85">
              Riding &middot; Training &middot; Adventure &middot; Motorsport &middot; Racing &middot; Experiences &middot; Community &middot; Content &middot; Brands.
            </p>
            <p className="font-body text-sm text-muted mt-4 leading-relaxed">
              The rider is the centre. Everything else is built around that.
            </p>
          </aside>
        </motion.div>
      </div>
    </section>
  );
}

export function AnimatedStats() {
  const items = [
    { k: "Official races / year", v: "6" },
    { k: "Prize pool — Ultimate Rider", v: "₹5L" },
    { k: "Flag-off", v: "Dec\u00A012\u201313" },
    { k: "Country", v: "India" },
  ];
  return (
    <section className="bg-surface border-y border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-border/60">
          {items.map((it) => (
            <div key={it.k} className="px-2 py-4 md:py-2 md:px-6 first:pl-0 last:pr-0">
              <div className="font-heading text-3xl sm:text-4xl font-semibold text-foreground">{it.v}</div>
              <div className="font-mono text-[11px] text-tan-dark uppercase tracking-widest mt-1">{it.k}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function UltimateRiderSpotlight() {
  return (
    <section className="relative border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          <div className="lg:col-span-7">
            <span className="eyebrow">The first official DRC race</span>
            <h2 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-semibold mt-3 leading-[1.02]">
              DRC Ultimate Rider.
            </h2>
            <p className="font-heading italic text-xl text-tan-dark mt-4 max-w-2xl">
              Two days. Every surface. Not just a race — a test of everything.
            </p>

            <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 gap-4 max-w-2xl">
              <div>
                <div className="font-mono text-[10px] text-tan-dark uppercase tracking-widest">Dates</div>
                <div className="font-heading text-lg mt-1">12 &ndash; 13 Dec 2026</div>
              </div>
              <div>
                <div className="font-mono text-[10px] text-tan-dark uppercase tracking-widest">City</div>
                <div className="font-heading text-lg mt-1">Bengaluru</div>
              </div>
              <div>
                <div className="font-mono text-[10px] text-tan-dark uppercase tracking-widest">Prize pool</div>
                <div className="font-heading text-lg mt-1 text-orange">₹5,00,000</div>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap gap-2">
              {["Enduro", "Rock Garden", "Hill Climb", "Slush", "Mud", "Technical"].map((s) => (
                <span key={s} className="font-mono text-[11px] uppercase tracking-widest px-3 py-1.5 border border-border rounded-sm text-foreground/80">
                  {s}
                </span>
              ))}
            </div>

            <div className="mt-8 flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <Link href="/events">
                <Button size="lg">Race details <ArrowRight className="w-5 h-5" /></Button>
              </Link>
              <a
                href="/magazine/DRC-Ultimate-Rider.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="font-heading text-lg underline decoration-tan-dark/40 underline-offset-4 hover:text-orange hover:decoration-orange transition-colors"
              >
                Sponsor / partner deck →
              </a>
            </div>
          </div>

          <aside className="lg:col-span-5 border-t-2 border-tan-dark/40 pt-6 lg:border-t-0 lg:border-l-2 lg:pt-0 lg:pl-8">
            <p className="font-mono text-xs text-tan-dark uppercase tracking-widest">Format</p>
            <div className="mt-3 space-y-4">
              <div>
                <p className="font-heading text-lg"><span className="text-orange">Sat</span> &mdash; Qualification &middot; Elimination &middot; Challenges</p>
                <p className="text-sm text-muted mt-1">The proving ground. The riders who last the day have not won. They have only earned Sunday.</p>
              </div>
              <div>
                <p className="font-heading text-lg"><span className="text-orange">Sun</span> &mdash; The Final</p>
                <p className="text-sm text-muted mt-1">Smaller field. Same dirt. This is where the weekend is decided.</p>
              </div>
            </div>
            <p className="font-body text-sm text-muted leading-relaxed mt-6 border-t border-border/60 pt-4">
              The flag-off lands on ground that already knows how to hold a championship — in partnership with <strong className="text-foreground">Dev Venkat</strong> (3× National Champion) and Tribal Adventure.
            </p>
          </aside>
        </div>
      </div>
    </section>
  );
}

export function AnimatedFeatures() {
  return (
    <section className="bg-surface border-y border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <FadeIn>
          <div className="mb-12 max-w-3xl">
            <span className="eyebrow">The platform</span>
            <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-semibold mt-3 leading-[1.05]">
              A world around the rider &mdash; not a single weekend, and not a single start line.
            </h2>
          </div>
        </FadeIn>
        <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6" staggerDelay={0.12}>
          {pillars.map((f) => (
            <StaggerItem key={f.title}>
              <div className="h-full p-6 border-t-2 border-tan-dark/40 bg-surface/40 hover:border-orange transition-colors">
                <f.icon className="w-6 h-6 text-tan-dark" strokeWidth={1.4} />
                <h3 className="font-heading text-lg font-semibold mt-4 leading-snug">{f.title}</h3>
                <p className="text-sm text-muted leading-relaxed mt-2">{f.desc}</p>
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
