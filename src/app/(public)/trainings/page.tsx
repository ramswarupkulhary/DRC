export const dynamic = "force-dynamic";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ShieldCheck, ShieldAlert, ArrowDown, ChevronRight } from "lucide-react";
import { TrainingCard } from "@/components/training/TrainingCard";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { AnimatedPageHeader, AnimatedGrid, AnimatedGridItem, AnimatedSection } from "@/components/ui/AnimatedPage";
import { BreadcrumbJsonLd, FAQJsonLd, ItemListJsonLd } from "@/components/seo/JsonLd";
import { ProgramsExplorer } from "@/components/programs/ProgramsExplorer";
import { listPrograms } from "@/lib/programsDb";
import { skillProgression, customerJourney, recommendedProgression, riderRequirements } from "@/lib/programs";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Off-Road Training & Trails in Bangalore | Dirt Bike Academy | DRC",
  description:
    "Bangalore's off-road motorcycle academy — Off-Road training, Private 1:1 coaching, guided trails & special trail rides by Dirt Ride Camp. Beginner to advanced dirt bike & enduro courses.",
  keywords: [
    "off road training bangalore", "off road academy bangalore", "offroad training bangalore", "offroad academy bangalore",
    "off road training", "off road academy", "off road bangalore", "offroad bangalore", "off road india", "offroad india",
    "dirt bike training bangalore", "dirt bike classes bangalore", "dirt bike training india", "dirt bike school bangalore",
    "dirt bike lessons bangalore", "learn dirt bike bangalore", "learn off road riding", "off road riding course",
    "off road riding classes bangalore", "off road riding academy", "off road motorcycle training",
    "private off road training", "private 1 on 1 off road coaching", "1 on 1 dirt bike training", "personal off road coaching",
    "enduro training india", "enduro training bangalore", "adventure bike training", "adventure motorcycle training bangalore",
    "beginner off road training", "advanced off road training", "off road skills training", "trail riding training",
    "off road trails bangalore", "guided trail rides bangalore", "off road trail ride karnataka", "weekend off road ride bangalore",
    "dirt bike track bangalore", "off road bike training near me", "motorcycle training bangalore", "motorcycle academy bangalore",
    "off road riding school karnataka", "dirt biking bangalore", "off road experience bangalore", "off road bike ride bangalore",
    "krishnagiri off road", "kanakapura off road trail", "off road training kanakapura", "off road trail krishnagiri",
  ],
  alternates: { canonical: "/trainings" },
  openGraph: {
    type: "website",
    url: "/trainings",
    title: "Off-Road Training & Trails in Bangalore | Dirt Ride Camp",
    description: "Off-Road training, Private 1:1 coaching & guided trails. Beginner to advanced dirt bike courses in Bangalore.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Off-Road Training & Trails in Bangalore | Dirt Ride Camp",
    description: "Off-Road training, Private 1:1 coaching & guided trails in Bangalore.",
  },
};

const trainingFaqs = [
  {
    question: "What will I learn in DRC's off-road training?",
    answer: "Our training covers standing riding position, throttle and clutch control on dirt, body positioning for turns and obstacles, hill climbing and descending techniques, water crossing basics, and emergency braking on loose surfaces. Advanced courses include rock garden navigation, sand riding, and enduro-specific skills.",
  },
  {
    question: "Do I need my own bike for off-road training?",
    answer: "You can bring your own motorcycle to training sessions. We recommend adventure or off-road bikes for the best learning experience, but standard motorcycles are acceptable for beginner courses. The training grounds are designed to be safe for learning regardless of your bike type.",
  },
  {
    question: "How long is each off-road training session?",
    answer: "Beginner courses are typically full-day (8am-5pm) sessions. Intermediate and advanced programs may span 2-3 days depending on the curriculum. Each session includes theory briefings, practical riding exercises, video analysis, and structured feedback from instructors.",
  },
  {
    question: "What protective gear is required for training?",
    answer: "Mandatory gear includes: full-face helmet (DOT/ECE certified), riding boots covering ankles, knee and shin guards, elbow guards, riding gloves, and long pants. We recommend adding a chest protector and neck brace for advanced courses. Rental gear is available on request.",
  },
];

export default async function TrainingsPage() {
  const trainings = await prisma.training.findMany({
    where: { status: "published" },
    orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
  });
  const programs = await listPrograms({ activeOnly: true });

  // Admin-managed records: "training" sessions vs location-based "special trails".
  const customTrainings = trainings.filter((t) => t.category === "training");
  const specialTrails = trainings.filter((t) => t.category !== "training");
  const BASE_URL = "https://www.dirtridecamp.com";
  // Course structured data for the off-road training + trail programs (rich results).
  const courseListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "DRC Off-Road Training & Trail Programs",
    itemListElement: programs
      .filter((p) => p.category === "training" || p.category === "trails")
      .map((p, i) => ({
        "@type": "ListItem",
        position: i + 1,
        item: {
          "@type": "Course",
          name: p.name,
          description: p.description,
          provider: { "@type": "Organization", name: "Dirt Ride Camp", url: BASE_URL },
          offers: { "@type": "Offer", price: p.price, priceCurrency: "INR", availability: "https://schema.org/InStock", url: `${BASE_URL}/trainings` },
        },
      })),
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(courseListJsonLd) }} />
      <BreadcrumbJsonLd items={[
        { name: "Home", url: "https://www.dirtridecamp.com" },
        { name: "Off-Road Training & Trails", url: "https://www.dirtridecamp.com/trainings" },
      ]} />
      {trainings.length > 0 && (
        <ItemListJsonLd name="Off-Road Training Programs" items={trainings.map((t) => ({ name: t.title, url: `/trainings/${t.slug}` }))} />
      )}
      <FAQJsonLd faqs={trainingFaqs} />
      <AnimatedPageHeader>
        <SectionHeader
          accent="Skill up"
          title="Off-Road Training & Trails in Bangalore"
          subtitle="Structured off-road motorcycle training, dedicated Private 1:1 coaching and guided special trails across Karnataka — beginner to advanced."
        />
      </AnimatedPageHeader>

      {/* Main training programs — Off-Road + Private 1:1, shown directly */}
      <section className="mt-8">
        <ProgramsExplorer programs={programs} categories={["training", "trails"]} />
      </section>

      {/* Admin-created training sessions */}
      {customTrainings.length > 0 && (
        <section className="mt-24">
          <AnimatedSection>
            <h2 className="font-heading text-3xl sm:text-4xl font-bold">More Training Sessions</h2>
            <div className="w-16 h-1 bg-orange rounded-full mt-3" />
          </AnimatedSection>
          <AnimatedGrid className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
            {customTrainings.map((t) => (
              <AnimatedGridItem key={t.id}>
                <TrainingCard
                  slug={t.slug}
                  title={t.title}
                  shortDesc={t.shortDesc ?? undefined}
                  level={t.level}
                  badge="Training"
                  duration={t.duration ?? undefined}
                  price={t.price}
                  location={t.location ?? undefined}
                  coverImage={t.coverImage ?? undefined}
                  featured={t.featured}
                />
              </AnimatedGridItem>
            ))}
          </AnimatedGrid>
        </section>
      )}

      {/* Special Trails — location-based, added by admin */}
      {specialTrails.length > 0 && (
        <section className="mt-24">
          <AnimatedSection>
            <span className="text-orange text-sm font-semibold tracking-[0.3em] uppercase">Explore new ground</span>
            <h2 className="font-heading text-3xl sm:text-4xl font-bold mt-2">Special Trails</h2>
            <div className="w-16 h-1 bg-orange rounded-full mt-3" />
            <p className="text-muted mt-4 max-w-2xl">Guided off-road trails at hand-picked locations. New destinations added regularly.</p>
          </AnimatedSection>
          <AnimatedGrid className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
            {specialTrails.map((t) => (
              <AnimatedGridItem key={t.id}>
                <TrainingCard
                  slug={t.slug}
                  title={t.title}
                  shortDesc={t.shortDesc ?? undefined}
                  level={t.level}
                  badge={t.location || "Special Trail"}
                  duration={t.duration ?? undefined}
                  price={t.price}
                  location={t.location ?? undefined}
                  coverImage={t.coverImage ?? undefined}
                  featured={t.featured}
                />
              </AnimatedGridItem>
            ))}
          </AnimatedGrid>
        </section>
      )}

      {/* Skill progression */}
      <section className="mt-24">
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

      {/* Rider journey */}
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

      <div className="mt-20">
        <AnimatedSection>
          <h2 className="font-heading text-2xl font-bold text-tan mb-6">Training FAQs</h2>
        </AnimatedSection>
        <div className="space-y-3">
          {trainingFaqs.map((faq, i) => (
            <details key={i} className="group bg-surface border border-border rounded-sm overflow-hidden">
              <summary className="flex items-center justify-between p-4 cursor-pointer font-semibold hover:text-orange transition-colors">
                {faq.question}
              </summary>
              <div className="px-4 pb-4 text-muted leading-relaxed text-sm">
                {faq.answer}
              </div>
            </details>
          ))}
        </div>
      </div>
    </div>
  );
}
