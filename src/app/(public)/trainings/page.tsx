export const dynamic = "force-dynamic";
import { prisma } from "@/lib/prisma";
import { TrainingCard } from "@/components/training/TrainingCard";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { AnimatedPageHeader, AnimatedGrid, AnimatedGridItem, AnimatedSection } from "@/components/ui/AnimatedPage";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Training Programs",
  description: "Off-road riding training programs for all skill levels. From beginner basics to advanced trail mastery.",
};

export default async function TrainingsPage() {
  const trainings = await prisma.training.findMany({
    where: { status: "published" },
    orderBy: [{ featured: "desc" }, { level: "asc" }],
  });

  const grouped = {
    beginner: trainings.filter((t) => t.level === "beginner"),
    intermediate: trainings.filter((t) => t.level === "intermediate"),
    advanced: trainings.filter((t) => t.level === "advanced"),
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
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
                <h3 className="font-heading text-xl font-semibold text-tan mb-6 uppercase tracking-wider capitalize">
                  {level} Level
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
    </div>
  );
}
