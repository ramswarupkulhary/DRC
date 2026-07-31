import { prisma } from "@/lib/prisma";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Badge } from "@/components/ui/Badge";
import Link from "next/link";
import { Calendar, MapPin, Trophy } from "lucide-react";
import { AnimatedPageHeader, AnimatedGrid, AnimatedGridItem, AnimatedSection, HoverCard } from "@/components/ui/AnimatedPage";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Events & Races" };

export default async function EventsPage() {
  const upcoming = await prisma.event.findMany({
    where: { status: "upcoming", date: { gte: new Date() } },
    orderBy: { date: "asc" },
  });

  const past = await prisma.event.findMany({
    where: { status: { in: ["completed", "upcoming"] }, date: { lt: new Date() } },
    orderBy: { date: "desc" },
    take: 6,
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
      <AnimatedPageHeader>
        <SectionHeader
          accent="Compete & celebrate"
          title="Events & Races"
          subtitle="Races, rallies, meetups, and community events throughout the year."
        />
      </AnimatedPageHeader>

      {upcoming.length > 0 && (
        <div className="mt-12">
          <AnimatedSection>
            <h3 className="font-heading text-xl font-bold text-tan mb-6">Upcoming Events</h3>
          </AnimatedSection>
          <AnimatedGrid className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcoming.map((event) => (
              <AnimatedGridItem key={event.id}>
                <HoverCard>
                  <Link href={`/events/${event.slug}`} className="block group">
                    <div className="bg-surface border border-border rounded-sm overflow-hidden hover:border-orange/50 transition-colors h-full flex flex-col">
                      <div className="aspect-[16/9] bg-surface-light flex items-center justify-center">
                        <Trophy className="w-12 h-12 text-orange/30" />
                      </div>
                      <div className="p-5 flex-1 flex flex-col">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="orange">{event.type}</Badge>
                          {event.featured && <Badge variant="warning">Featured</Badge>}
                        </div>
                        <h4 className="font-heading text-lg font-bold group-hover:text-orange transition-colors">{event.title}</h4>
                        <p className="text-sm text-muted mt-2 line-clamp-2">{event.description}</p>
                        <div className="mt-auto pt-4 space-y-1">
                          <p className="text-xs text-muted flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5" />
                            {event.date.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" })}
                          </p>
                          <p className="text-xs text-muted flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5" />
                            {event.location}
                          </p>
                          {event.price > 0 && (
                            <p className="text-sm font-semibold text-orange mt-2">&#8377;{event.price.toLocaleString("en-IN")}</p>
                          )}
                          {event.price === 0 && (
                            <p className="text-sm font-semibold text-success mt-2">Free Entry</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                </HoverCard>
              </AnimatedGridItem>
            ))}
          </AnimatedGrid>
        </div>
      )}

      {past.length > 0 && (
        <div className="mt-16">
          <AnimatedSection>
            <h3 className="font-heading text-xl font-bold text-tan mb-6">Past Events</h3>
          </AnimatedSection>
          <AnimatedGrid className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {past.map((event) => (
              <AnimatedGridItem key={event.id}>
                <div className="bg-surface border border-border rounded-sm p-4 opacity-70">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="muted">{event.type}</Badge>
                    <Badge variant="muted">Completed</Badge>
                  </div>
                  <h4 className="font-heading font-bold">{event.title}</h4>
                  <p className="text-xs text-muted mt-1">
                    {event.date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })} · {event.location}
                  </p>
                </div>
              </AnimatedGridItem>
            ))}
          </AnimatedGrid>
        </div>
      )}
    </div>
  );
}
