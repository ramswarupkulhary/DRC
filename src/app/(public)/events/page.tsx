export const dynamic = "force-dynamic";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/Badge";
import Link from "next/link";
import { Calendar, MapPin, Trophy, ArrowRight } from "lucide-react";
import { AnimatedPageHeader, AnimatedGrid, AnimatedGridItem, AnimatedSection, HoverCard } from "@/components/ui/AnimatedPage";
import { Button } from "@/components/ui/Button";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "DRC Racing — Off-Road Races & Motorsport Events Across India",
  description: "DRC Racing runs six official off-road motorcycle races every year, across India. Flag-off: DRC Ultimate Rider, 12\u201313 December 2026, Bengaluru. \u20b95 Lakh prize pool. Enduro, rock garden, hill climb, slush, mud and technical.",
  keywords: ["DRC Racing", "DRC Ultimate Rider", "off road race India", "enduro race India", "motorcycle race Bengaluru", "motorsport event India", "national off-road championship"],
};

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
    <div>
      {/* Hero */}
      <section className="relative border-b border-border overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-40 pointer-events-none" />
        <div className="absolute -top-40 -right-40 w-[520px] h-[520px] rounded-full bg-orange/10 blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 sm:pt-24 pb-14 sm:pb-16">
          <div className="flex items-center gap-3 mb-6">
            <span className="h-px w-10 bg-orange" />
            <span className="eyebrow">DRC Racing</span>
          </div>
          <h1 className="font-heading font-bold uppercase text-5xl sm:text-6xl lg:text-7xl leading-[0.95] tracking-[-0.02em] max-w-4xl">
            Six races. <span className="text-orange">Every year.</span> Across India.
          </h1>
          <p className="mt-6 text-lg text-foreground/70 max-w-2xl">
            The DRC Racing calendar. Championship-grade off-road motorsport, built from the rider up.
          </p>
        </div>
      </section>

      {/* Featured: DRC Ultimate Rider (hardcoded so it's always visible regardless of DB state) */}
      <section className="relative border-b border-border bg-surface">
        <div className="absolute top-0 right-0 w-2 h-full bg-orange" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            <div className="lg:col-span-7">
              <div className="font-mono text-[10px] uppercase tracking-widest text-orange">Race 01 · Flag-off</div>
              <h2 className="font-heading font-bold uppercase text-4xl sm:text-6xl lg:text-7xl leading-[0.95] tracking-[-0.02em] mt-4">
                DRC <span className="text-orange">Ultimate</span> Rider.
              </h2>
              <p className="mt-6 text-lg text-foreground/70 max-w-2xl">
                Two days. Every surface. Not just a race &mdash; a test of everything. The first official DRC race and the flag-off of DRC Racing.
              </p>

              <div className="mt-8 flex flex-wrap gap-2">
                {["Enduro", "Rock Garden", "Hill Climb", "Slush", "Mud", "Technical"].map((s) => (
                  <span key={s} className="font-mono text-[11px] uppercase tracking-widest px-3 py-1.5 border border-border text-foreground/80">
                    {s}
                  </span>
                ))}
              </div>

              <div className="mt-10 flex flex-col sm:flex-row gap-4">
                <Link href="/events/drc-ultimate-rider">
                  <Button size="lg" className="uppercase tracking-wider">Full race brief <ArrowRight className="w-5 h-5" /></Button>
                </Link>
                <a href="/magazine/DRC-Ultimate-Rider.pdf" target="_blank" rel="noopener noreferrer" className="font-heading uppercase tracking-widest text-sm text-foreground/70 hover:text-orange transition-colors border-b border-transparent hover:border-orange pb-1 self-center">
                  Sponsor / Partner Deck →
                </a>
              </div>
            </div>

            <aside className="lg:col-span-5 lg:pl-8 lg:border-l border-border">
              <div className="grid grid-cols-3 gap-6 pb-8 border-b border-border">
                <div>
                  <div className="font-mono text-[10px] uppercase tracking-widest text-orange">Dates</div>
                  <div className="font-heading text-2xl font-bold uppercase mt-1">Dec 12&ndash;13</div>
                  <div className="font-mono text-xs text-muted">2026</div>
                </div>
                <div>
                  <div className="font-mono text-[10px] uppercase tracking-widest text-orange">City</div>
                  <div className="font-heading text-2xl font-bold uppercase mt-1">Bengaluru</div>
                </div>
                <div>
                  <div className="font-mono text-[10px] uppercase tracking-widest text-orange">Prize Pool</div>
                  <div className="font-heading text-2xl font-bold uppercase mt-1 text-orange">₹5L</div>
                </div>
              </div>
              <div className="mt-6 space-y-5">
                <div>
                  <div className="flex items-baseline gap-3">
                    <span className="font-heading text-2xl font-bold text-orange">SAT</span>
                    <span className="font-mono text-[10px] uppercase tracking-widest text-muted">Qualification · Elimination · Challenges</span>
                  </div>
                  <p className="text-sm text-foreground/70 mt-2 leading-relaxed">The proving ground. The riders who last the day have not won. They have only earned Sunday.</p>
                </div>
                <div>
                  <div className="flex items-baseline gap-3">
                    <span className="font-heading text-2xl font-bold text-orange">SUN</span>
                    <span className="font-mono text-[10px] uppercase tracking-widest text-muted">The Final</span>
                  </div>
                  <p className="text-sm text-foreground/70 mt-2 leading-relaxed">The field is smaller. The surfaces still change. This is where the weekend is decided.</p>
                </div>
                <p className="text-xs text-muted pt-4 border-t border-border/50 leading-relaxed">
                  In partnership with <span className="text-foreground font-semibold">Dev Venkat</span> (3× National Champion) and Tribal Adventure.
                </p>
              </div>
            </aside>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">

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
    </div>
  );
}
