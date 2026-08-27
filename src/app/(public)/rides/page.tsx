export const dynamic = "force-dynamic";
import { prisma } from "@/lib/prisma";
import { RideCard } from "@/components/rides/RideCard";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { AnimatedPageHeader, AnimatedGrid, AnimatedGridItem, AnimatedSection } from "@/components/ui/AnimatedPage";
import { BreadcrumbJsonLd, FAQJsonLd } from "@/components/seo/JsonLd";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Bike Trips, Adventure Rides & Camping near Bangalore | DRC",
  description:
    "Join Bangalore's best off-road riding group for adventure bike trips, overnight camping rides & multi-day motorcycle expeditions across Karnataka. Limited slots — book now at Dirt Ride Camp.",
  keywords: ["bike trip bangalore", "bike trip near bangalore", "adventure bike trip", "off-road rides bangalore", "adventure bike rides", "weekend rides bangalore", "weekend bike trip", "motorcycle trip karnataka", "overnight bike trip", "camping trip bangalore", "bike camping near bangalore", "motorcycle camping karnataka", "off road group rides", "bangalore biking group", "weekend motorcycle trips", "adventure rides near bangalore", "motorcycle tour karnataka"],
  openGraph: {
    title: "Bike Trips, Adventure Rides & Camping | Dirt Ride Camp Bangalore",
    description: "Adventure bike trips, overnight camping rides & multi-day motorcycle expeditions across Karnataka.",
  },
};

const ridesFaqs = [
  {
    question: "What types of off-road rides does DRC organize?",
    answer: "DRC organizes day rides (single-day trail adventures), overnight rides (with camping), multi-day expeditions (3-7 day tours), and training rides (focused on skill building). Ride difficulty ranges from easy scenic routes suitable for beginners to expert-level technical enduro trails.",
  },
  {
    question: "How many riders join each DRC ride?",
    answer: "We keep groups small — typically 8 to 15 riders per ride. This ensures safety, personal attention from ride leads, and a better overall experience. Each ride has at minimum 2 experienced ride marshals (lead and sweep).",
  },
  {
    question: "What happens if I can't make it after registering?",
    answer: "Cancellations made 48+ hours before the ride receive a full refund. Cancellations within 48 hours may receive a partial refund or credit for a future ride, depending on the specific ride's policy. Contact us via WhatsApp for any cancellation requests.",
  },
  {
    question: "What should I bring on a DRC off-road ride?",
    answer: "Essential items: full riding gear (helmet, boots, gloves, knee guards), water (minimum 2 liters), energy snacks, basic tools, tire puncture kit, and a fully charged phone. For overnight rides, also bring a sleeping bag, change of clothes, headlamp, and personal medications. A detailed packing list is sent after registration confirmation.",
  },
];

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
      <BreadcrumbJsonLd items={[
        { name: "Home", url: "https://www.dirtridecamp.com" },
        { name: "Rides & Events", url: "https://www.dirtridecamp.com/rides" },
      ]} />
      <FAQJsonLd faqs={ridesFaqs} />
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

      <div className="mt-20">
        <AnimatedSection>
          <h2 className="font-heading text-2xl font-bold text-tan mb-6">Rides FAQs</h2>
        </AnimatedSection>
        <div className="space-y-3">
          {ridesFaqs.map((faq, i) => (
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
