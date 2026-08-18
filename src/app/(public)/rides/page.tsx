export const dynamic = "force-dynamic";
import { prisma } from "@/lib/prisma";
import { RideCard } from "@/components/rides/RideCard";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { AnimatedPageHeader, AnimatedGrid, AnimatedGridItem, AnimatedSection } from "@/components/ui/AnimatedPage";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Off-Road Rides & Adventure Events in Bangalore | DRC",
  description:
    "Join Bangalore's best off-road riding group for dirt bike rides, overnight camping trips & multi-day expeditions across Karnataka. Limited slots — book now at Dirt Ride Camp.",
  keywords: ["off-road rides bangalore", "adventure bike rides", "weekend rides bangalore", "dirt bike events", "motorcycle camping karnataka"],
  openGraph: {
    title: "Off-Road Rides & Adventure Events | Dirt Ride Camp",
    description: "Dirt bike rides, overnight camping trips & multi-day expeditions across Karnataka.",
  },
};

export default async function RidesPage() {
  const now = new Date();

  // Auto-archive rides whose date has passed
  await prisma.ride.updateMany({
    where: { status: { in: ["published", "draft"] }, endDate: { lt: now } },
    data: { status: "past" },
  });

  const [publishedRides, pastRides] = await Promise.all([
    prisma.ride.findMany({
      where: { status: "published", startDate: { gte: now } },
      orderBy: { startDate: "asc" },
      include: { registrations: { where: { status: { in: ["confirmed", "checked_in"] } } } },
    }),
    prisma.ride.findMany({
      where: {
        OR: [
          { status: "past" },
          { status: "completed" },
          { status: "published", endDate: { lt: now } },
        ],
      },
      orderBy: { startDate: "desc" },
      take: 12,
      include: { registrations: { where: { status: { in: ["confirmed", "checked_in"] } } } },
    }),
  ]);

  const upcoming = publishedRides;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
      <AnimatedPageHeader>
        <SectionHeader
          accent="Adventure awaits"
          title="Rides & Events"
          subtitle="Limited slots on every ride. Grab yours before they're gone."
        />
      </AnimatedPageHeader>

      {upcoming.length > 0 && (
        <div className="mt-12">
          <AnimatedSection>
            <h3 className="font-heading text-xl font-semibold text-tan mb-6 uppercase tracking-wider">
              Upcoming
            </h3>
          </AnimatedSection>
          <AnimatedGrid className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcoming.map((ride) => (
              <AnimatedGridItem key={ride.id}>
                <RideCard
                  slug={ride.slug}
                  title={ride.title}
                  location={ride.location}
                  startDate={ride.startDate?.toISOString()}
                  endDate={ride.endDate?.toISOString()}
                  price={ride.price}
                  earlyBirdPrice={ride.earlyBirdPrice}
                  earlyBirdDeadline={ride.earlyBirdDeadline?.toISOString()}
                  totalSlots={ride.totalSlots}
                  bookedSlots={ride.registrations.length}
                  difficulty={ride.difficulty}
                  type={ride.type}
                  coverImage={ride.coverImage ?? undefined}
                  featured={ride.featured}
                />
              </AnimatedGridItem>
            ))}
          </AnimatedGrid>
        </div>
      )}

      {upcoming.length === 0 && (
        <AnimatedSection className="mt-16">
          <div className="text-center py-16 bg-surface border border-border rounded-sm">
            <p className="text-muted text-lg">No upcoming rides at the moment.</p>
            <p className="text-muted text-sm mt-2">Follow us on Instagram for announcements!</p>
          </div>
        </AnimatedSection>
      )}

      {pastRides.length > 0 && (
        <div className="mt-16">
          <AnimatedSection>
            <h3 className="font-heading text-xl font-semibold text-tan mb-2 uppercase tracking-wider">
              Past Adventures
            </h3>
            <p className="text-muted text-sm mb-6">Check out some of the amazing rides we&apos;ve done!</p>
          </AnimatedSection>
          <AnimatedGrid className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {pastRides.map((ride) => (
              <AnimatedGridItem key={ride.id}>
                <RideCard
                  slug={ride.slug}
                  title={ride.title}
                  location={ride.location}
                  startDate={ride.startDate?.toISOString()}
                  endDate={ride.endDate?.toISOString()}
                  price={ride.price}
                  earlyBirdPrice={ride.earlyBirdPrice}
                  earlyBirdDeadline={ride.earlyBirdDeadline?.toISOString()}
                  totalSlots={ride.totalSlots}
                  bookedSlots={ride.registrations.length}
                  difficulty={ride.difficulty}
                  type={ride.type}
                  coverImage={ride.coverImage ?? undefined}
                  featured={ride.featured}
                />
              </AnimatedGridItem>
            ))}
          </AnimatedGrid>
        </div>
      )}
    </div>
  );
}
