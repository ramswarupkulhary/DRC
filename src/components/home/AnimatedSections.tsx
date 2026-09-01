"use client";

import { FadeIn, StaggerContainer, StaggerItem, CountUp, ScaleIn, ParallaxSection } from "@/components/ui/Animations";
import { Mountain, Shield, Flame, Users, Star, ArrowRight, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { motion } from "framer-motion";

const features = [
  { icon: Mountain, title: "Curated Trails", desc: "Hand-picked routes through the best off-road terrain in South India." },
  { icon: Shield, title: "Safety First", desc: "First aid support, experienced ride leads, and support vehicles on every ride." },
  { icon: Flame, title: "Camp & Connect", desc: "Campfire nights, shared meals, and stories that create lasting bonds." },
  { icon: Users, title: "Small Groups", desc: "Limited slots for every ride — ensuring quality, safety, and a personal experience." },
];

const defaultTestimonials = [
  { name: "Arjun M.", text: "My first off-road experience with DRC was unforgettable. The trails were thrilling, the campfire was magical, and the crew made sure everyone felt safe. Can't wait for the next ride!", location: "Bangalore", rating: 5 },
  { name: "Priya S.", text: "As a beginner, I was nervous about dirt riding. DRC's training program built my confidence from scratch. The instructors were patient and the progression was perfect.", location: "Mysore", rating: 5 },
  { name: "Rahul K.", text: "The Krishnagiri overnighter was exactly what I needed — a break from the city with amazing trails and great people. DRC knows how to curate an adventure.", location: "Bangalore", rating: 5 },
];

export function AnimatedHero() {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-background z-10" />
      {/* Place hero.mp4 in /public/videos/ to activate the background video */}
      <video
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
        style={{ filter: "brightness(0.4)" }}
      >
        <source src="/videos/hero.mp4" type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-gradient-to-br from-surface via-background to-surface-light" />

      <div className="relative z-20 text-center px-4 max-w-5xl mx-auto space-y-8">
        <motion.div className="space-y-2" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: [0.25, 0.4, 0.25, 1] }}>
          <span className="text-orange text-sm sm:text-base font-semibold tracking-[0.4em] uppercase">Ride &middot; Explore &middot; Connect</span>
          <motion.h1
            className="font-heading text-5xl sm:text-7xl lg:text-8xl font-bold leading-[0.9]"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2, ease: [0.25, 0.4, 0.25, 1] }}
          >
            <span className="text-foreground">D</span>
            <motion.span className="text-orange inline-block" animate={{ rotateY: [0, 360] }} transition={{ duration: 1.5, delay: 0.8 }}>R</motion.span>
            <span className="text-foreground">C</span>
          </motion.h1>
          <motion.p
            className="font-heading text-xl sm:text-2xl lg:text-3xl text-tan tracking-[0.15em]"
            initial={{ opacity: 0, letterSpacing: "0.5em" }}
            animate={{ opacity: 1, letterSpacing: "0.15em" }}
            transition={{ duration: 1, delay: 0.4 }}
          >
            DIRT RIDE CAMP
          </motion.p>
        </motion.div>

        <motion.p
          className="text-lg sm:text-xl text-foreground/80 max-w-2xl mx-auto leading-relaxed"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          Bangalore&apos;s off-road academy — adventure bike trips, camping rides & off-road riding classes across India.
          <br />
          <span className="text-orange font-semibold">Ride &middot; Explore &middot; Connect</span>
        </motion.p>

        <motion.div
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <Link href="/rides">
            <Button size="lg" className="min-w-[200px]">Explore Rides <ArrowRight className="w-5 h-5" /></Button>
          </Link>
          <Link href="/trainings">
            <Button variant="outline" size="lg" className="min-w-[200px]">Training Programs</Button>
          </Link>
        </motion.div>
      </div>

      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      >
        <div className="w-6 h-10 border-2 border-foreground/30 rounded-full flex justify-center pt-2">
          <motion.div
            className="w-1.5 h-3 bg-orange rounded-full"
            animate={{ y: [0, 8, 0], opacity: [1, 0.3, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
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
              <div className="text-sm text-muted mt-1 uppercase tracking-wider">{stat.label}</div>
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
          <div className="text-center mb-12">
            <span className="text-orange text-sm font-semibold tracking-[0.3em] uppercase">Why ride with us</span>
            <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold mt-2">The DRC Difference</h2>
            <p className="text-muted mt-3 max-w-xl mx-auto">We&apos;re not just organizing rides — we&apos;re building a community of adventurers.</p>
          </div>
        </FadeIn>
        <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8" staggerDelay={0.15}>
          {features.map((f) => (
            <StaggerItem key={f.title}>
              <motion.div
                className="text-center p-6 border border-border rounded-sm hover:border-orange/30 transition-colors group"
                whileHover={{ y: -8, transition: { duration: 0.3 } }}
              >
                <ScaleIn>
                  <div className="w-14 h-14 mx-auto bg-orange/10 rounded-full flex items-center justify-center mb-4 group-hover:bg-orange/20 transition-colors">
                    <f.icon className="w-7 h-7 text-orange" />
                  </div>
                </ScaleIn>
                <h3 className="font-heading text-lg font-semibold mb-2">{f.title}</h3>
                <p className="text-sm text-muted leading-relaxed">{f.desc}</p>
              </motion.div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}

export function AnimatedTestimonials({ reviews }: { reviews?: { name: string; text: string; location: string; rating: number; image?: string | null }[] }) {
  const testimonials = reviews && reviews.length > 0 ? reviews : defaultTestimonials;
  return (
    <section className="bg-surface border-y border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <FadeIn>
          <div className="text-center mb-12">
            <span className="text-orange text-sm font-semibold tracking-[0.3em] uppercase">From the trail</span>
            <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold mt-2">What Riders Say</h2>
          </div>
        </FadeIn>
        <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-6" staggerDelay={0.2}>
          {testimonials.map((t) => {
            const image = (t as { image?: string | null }).image ?? null;
            const initials = t.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
            return (
              <StaggerItem key={t.name}>
                <motion.div
                  className="bg-background p-6 border border-border rounded-sm flex flex-col items-center text-center"
                  whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
                >
                  {image ? (
                    <img src={image} alt={t.name} className="w-16 h-16 rounded-full object-cover border-2 border-orange/30" />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-orange flex items-center justify-center text-white font-heading text-xl font-bold">
                      {initials}
                    </div>
                  )}
                  <p className="font-semibold text-foreground mt-4">{t.name}</p>
                  {t.location && <p className="text-xs text-muted">{t.location}</p>}
                  <div className="flex gap-1 my-3">
                    {Array.from({ length: t.rating }).map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-orange text-orange" />
                    ))}
                  </div>
                  <p className="text-sm text-foreground/80 leading-relaxed italic">&ldquo;{t.text}&rdquo;</p>
                </motion.div>
              </StaggerItem>
            );
          })}
        </StaggerContainer>
      </div>
    </section>
  );
}

export function AnimatedCTA() {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
      <FadeIn>
        <div className="text-center space-y-6 max-w-2xl mx-auto">
          <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold">
            Ready to Get <motion.span className="text-orange inline-block" whileInView={{ scale: [1, 1.1, 1] }} transition={{ duration: 0.6 }} viewport={{ once: true }}>Dirty</motion.span>?
          </h2>
          <p className="text-muted text-lg">Join DRC and be part of a growing community of off-road adventurers. Your next adventure is just a click away.</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/signup">
              <Button size="lg" className="min-w-[200px]">Join DRC <ArrowRight className="w-5 h-5" /></Button>
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
          <span className="text-orange text-sm font-semibold tracking-[0.3em] uppercase">Hit the dirt</span>
          <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold mt-2">Upcoming Rides</h2>
          <p className="text-muted mt-3 max-w-xl mx-auto">Limited slots, unlimited adventure. Book your spot before it&apos;s gone.</p>
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
          <span className="text-orange text-sm font-semibold tracking-[0.3em] uppercase">Level up your skills</span>
          <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold mt-2">Training Programs</h2>
          <p className="text-muted mt-3 max-w-xl mx-auto">From first-time riders to seasoned off-roaders — there&apos;s a program for you.</p>
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
          <span className="text-orange text-sm font-semibold tracking-[0.3em] uppercase">Got questions?</span>
          <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold mt-2">Frequently Asked Questions</h2>
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
