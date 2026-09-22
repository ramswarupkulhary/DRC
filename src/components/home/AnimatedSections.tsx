"use client";

import { FadeIn, StaggerContainer, StaggerItem, CountUp } from "@/components/ui/Animations";
import { Mountain, Shield, Flame, Users, Star, ArrowRight, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";

const features = [
  {
    icon: Users,
    title: "Groups of six, not sixty",
    desc: "Every ride is capped so you actually know the people you're riding with by lunch. No convoys, no chaos.",
  },
  {
    icon: Mountain,
    title: "Terrain your GPS gives up on",
    desc: "Krishnagiri granite, Sakleshpur coffee mud, Coorg forest trails. Scouted by us, not lifted off a blog.",
  },
  {
    icon: Shield,
    title: "Marshals with first-aid kits, not band-aids",
    desc: "Trained sweep riders, a support vehicle with tools and spares, and an evac plan for every route.",
  },
  {
    icon: Flame,
    title: "Camp dinners, torch-lit repairs",
    desc: "Tents, a real fire, food you actually want to eat, and the kind of stories that only happen after a long ride.",
  },
];

export function AnimatedHero() {
  return (
    <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden border-b border-border">
      <video
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
        style={{ filter: "sepia(0.35) contrast(0.95) brightness(0.75)" }}
      >
        <source src="/videos/hero.mp4" type="video/mp4" />
      </video>
      {/* Warm paper wash so type reads on any frame */}
      <div className="absolute inset-0 bg-[color:var(--color-background)]/70" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[color:var(--color-background)]" />

      <motion.div
        className="relative z-20 text-center px-4 max-w-3xl mx-auto"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
      >
        <span className="eyebrow">Est. Bangalore &middot; Since the dirt</span>
        <h1 className="font-heading text-5xl sm:text-6xl lg:text-7xl font-semibold leading-[1.05] mt-5">
          Dirt Ride Camp.
        </h1>
        <p className="font-heading italic text-xl sm:text-2xl text-tan-dark mt-3">
          an off-road academy &amp; riding club
        </p>

        <p className="text-base sm:text-lg text-foreground/80 max-w-xl mx-auto leading-relaxed mt-6">
          Small-group adventure rides, hands-on off-road training, and campfire nights across Karnataka &amp; India.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
          <Link href="/rides">
            <Button size="lg" className="min-w-[200px]">Explore Rides <ArrowRight className="w-5 h-5" /></Button>
          </Link>
          <Link href="/trainings">
            <Button variant="outline" size="lg" className="min-w-[200px]">Training Programs</Button>
          </Link>
        </div>
      </motion.div>
    </section>
  );
}

export function AnimatedStats() {
  return (
    <section className="bg-surface border-y border-border">
      <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-2 md:grid-cols-4 gap-6">
        {[
          { value: 50, suffix: "+", label: "Rides Completed" },
          { value: 300, suffix: "+", label: "Riders Joined" },
          { value: 15, suffix: "+", label: "Destinations" },
          { value: 5, suffix: "+", label: "States Covered" },
        ].map((stat, i) => (
          <FadeIn key={stat.label} delay={i * 0.1}>
            <div className="text-center">
              <div className="font-heading text-3xl sm:text-4xl font-bold text-orange">
                <CountUp target={stat.value} suffix={stat.suffix} duration={stat.value > 100 ? 2.5 : 1.5} />
              </div>
              <div className="eyebrow mt-2">{stat.label}</div>
            </div>
          </FadeIn>
        ))}
      </div>
    </section>
  );
}

export function AnimatedFeatures() {
  return (
    <section className="bg-surface border-y border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <FadeIn>
          <div className="mb-12 max-w-2xl">
            <span className="eyebrow">Why DRC</span>
            <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-semibold mt-3">Not a tour company. Not a race school. A riding club that runs both.</h2>
          </div>
        </FadeIn>
        <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6" staggerDelay={0.12}>
          {features.map((f) => (
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
            Come ride with us.
          </h2>
          <p className="text-muted text-lg">Pick a ride, book a slot, show up with your bike. We'll handle the rest — route, marshals, food, camp, the works.</p>
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
