export const dynamic = "force-dynamic";
import { prisma } from "@/lib/prisma";
import { TrainingCard } from "@/components/training/TrainingCard";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { AnimatedPageHeader, AnimatedGrid, AnimatedGridItem, AnimatedSection } from "@/components/ui/AnimatedPage";
import { BreadcrumbJsonLd, FAQJsonLd, ItemListJsonLd } from "@/components/seo/JsonLd";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Off-Road Academy & Training Programs in Bangalore | DRC Dirt Ride Camp",
  description:
    "Bangalore's off-road academy — professional motorcycle training by Dirt Ride Camp. Beginner to advanced dirt bike courses — trail riding, enduro techniques & off-road skills.",
  keywords: ["off road academy", "off road academy bangalore", "off road training", "off road training bangalore", "dirt bike training", "motorcycle training course", "enduro training india", "off road riding course", "adventure bike training", "dirt bike classes bangalore", "motorcycle academy bangalore", "off road riding academy"],
  openGraph: {
    title: "Off-Road Academy & Training Programs | Dirt Ride Camp Bangalore",
    description: "Bangalore's off-road academy — professional motorcycle training. Beginner to advanced dirt bike courses.",
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
    orderBy: [{ featured: "desc" }, { level: "asc" }],
  });

  const grouped: Record<string, typeof trainings> = {
    beginner: trainings.filter((t) => t.level === "beginner"),
    intermediate: trainings.filter((t) => t.level === "intermediate"),
    advanced: trainings.filter((t) => t.level === "advanced"),
    all: trainings.filter((t) => !["beginner", "intermediate", "advanced"].includes(t.level)),
  };

  const levelLabels: Record<string, string> = {
    beginner: "Beginner Level",
    intermediate: "Intermediate Level",
    advanced: "Advanced Level",
    all: "All Levels",
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
      <BreadcrumbJsonLd items={[
        { name: "Home", url: "https://www.dirtridecamp.com" },
        { name: "Training Programs", url: "https://www.dirtridecamp.com/trainings" },
      ]} />
      {trainings.length > 0 && (
        <ItemListJsonLd name="Off-Road Training Programs" items={trainings.map((t) => ({ name: t.title, url: `/trainings/${t.slug}` }))} />
      )}
      <FAQJsonLd faqs={trainingFaqs} />
      <AnimatedPageHeader>
        <SectionHeader
          accent="Skill up"
          title="Training Programs"
          subtitle="Structured off-road training to build your confidence and technique, one level at a time."
        />
      </AnimatedPageHeader>

      {Object.entries(grouped).map(
        ([level, items]) =>
          items.length > 0 && (
            <div key={level} className="mt-14">
              <AnimatedSection>
                <h3 className="font-heading text-xl font-semibold text-tan mb-6 uppercase tracking-wider">
                  {levelLabels[level] || `${level} Level`}
                </h3>
              </AnimatedSection>
              <AnimatedGrid className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {items.map((t) => (
                  <AnimatedGridItem key={t.id}>
                    <TrainingCard
                      slug={t.slug}
                      title={t.title}
                      shortDesc={t.shortDesc ?? undefined}
                      level={t.level}
                      duration={t.duration ?? undefined}
                      price={t.price}
                      location={t.location ?? undefined}
                      coverImage={t.coverImage ?? undefined}
                      featured={t.featured}
                    />
                  </AnimatedGridItem>
                ))}
              </AnimatedGrid>
            </div>
          )
      )}

      {trainings.length === 0 && (
        <AnimatedSection className="mt-16">
          <div className="text-center py-16 bg-surface border border-border rounded-sm">
            <p className="text-muted text-lg">Training programs coming soon!</p>
          </div>
        </AnimatedSection>
      )}

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
