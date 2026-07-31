export const dynamic = "force-dynamic";
import { prisma } from "@/lib/prisma";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Badge } from "@/components/ui/Badge";
import { Star } from "lucide-react";
import { AnimatedPageHeader, AnimatedGrid, AnimatedGridItem, HoverCard } from "@/components/ui/AnimatedPage";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Our Instructors" };

export default async function InstructorsPage() {
  const instructors = await prisma.instructor.findMany({
    where: { active: true },
    orderBy: { rating: "desc" },
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
      <AnimatedPageHeader>
        <SectionHeader
          accent="Learn from the best"
          title="Our Instructors"
          subtitle="Certified professionals with years of off-road experience."
        />
      </AnimatedPageHeader>

      <AnimatedGrid className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {instructors.map((inst) => {
          const certs = inst.certifications ? (JSON.parse(inst.certifications) as string[]) : [];
          const specs = inst.specialties ? (JSON.parse(inst.specialties) as string[]) : [];

          return (
            <AnimatedGridItem key={inst.id}>
              <HoverCard>
                <div className="bg-surface border border-border rounded-sm overflow-hidden h-full">
                  <div className="aspect-[4/3] bg-surface-light flex items-center justify-center">
                    <div className="w-24 h-24 rounded-full bg-orange/10 flex items-center justify-center">
                      <span className="font-heading text-3xl font-bold text-orange">
                        {inst.name.split(" ").map((w) => w[0]).join("")}
                      </span>
                    </div>
                  </div>
                  <div className="p-6 space-y-4">
                    <div>
                      <h3 className="font-heading text-xl font-bold">{inst.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Star className="w-4 h-4 text-orange fill-orange" />
                        <span className="text-sm font-semibold">{inst.rating}</span>
                        <span className="text-xs text-muted">({inst.totalReviews} reviews)</span>
                        <span className="text-xs text-muted">· {inst.experience}</span>
                      </div>
                    </div>
                    <p className="text-sm text-muted">{inst.bio}</p>
                    {specs.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {specs.map((s) => (
                          <Badge key={s} variant="orange">{s}</Badge>
                        ))}
                      </div>
                    )}
                    {certs.length > 0 && (
                      <div className="space-y-1">
                        <p className="text-xs text-muted uppercase tracking-wider">Certifications</p>
                        {certs.map((c) => (
                          <p key={c} className="text-xs text-foreground/80">· {c}</p>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </HoverCard>
            </AnimatedGridItem>
          );
        })}
      </AnimatedGrid>
    </div>
  );
}
