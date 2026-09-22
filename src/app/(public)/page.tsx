export const dynamic = "force-dynamic";
import { RideCard } from "@/components/rides/RideCard";
import { TrainingCard } from "@/components/training/TrainingCard";
import { prisma } from "@/lib/prisma";
import { OrganizationJsonLd, WebSiteJsonLd, FAQJsonLd, AggregateRatingJsonLd } from "@/components/seo/JsonLd";
import {
  AnimatedHero,
  AnimatedStats,
  AnimatedFeatures,
  AnimatedTestimonials,
  AnimatedCTA,
  AnimatedRidesSection,
  AnimatedTrainingsSection,
  AnimatedCard,
  AnimatedFAQ,
  UltimateRiderSpotlight,
} from "@/components/home/AnimatedSections";

async function getHomeData() {
  const [rides, trainings, reviews] = await Promise.all([
    prisma.ride.findMany({
      where: { status: "published" },
      orderBy: { startDate: "asc" },
      take: 4,
      include: { registrations: { where: { status: { not: "cancelled" } } } },
    }),
    prisma.training.findMany({
      where: { status: "published" },
      orderBy: { featured: "desc" },
      take: 3,
    }),
    prisma.review.findMany({
      where: { approved: true },
      orderBy: { createdAt: "desc" },
      take: 6,
      include: { user: { select: { name: true, image: true } } },
    }),
  ]);
  return { rides, trainings, reviews };
}

export default async function HomePage() {
  const { rides, trainings, reviews } = await getHomeData();

  const reviewsForDisplay = reviews.map((r) => ({
    name: r.user.name || "DRC Rider",
    text: r.comment || "",
    location: "",
    rating: r.rating,
    image: r.user.image,
  }));

  const avgRating = reviews.length > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 4.8;

  const homeFaqs = [
    {
      question: "What is DRC Motorsports?",
      answer: "DRC Motorsports Pvt Ltd is an Indian motorcycle culture and motorsport platform, headquartered in Bengaluru. DRC exists to build a world around the rider — racing, training, adventure, experiences, community, content and brands under one roof. Our flag-off is DRC Ultimate Rider (12\u201313 December 2026), the first race of DRC Racing, a series of six official races every year across India.",
    },
    {
      question: "What is DRC Ultimate Rider?",
      answer: "DRC Ultimate Rider is a two-day motorsport event on 12\u201313 December 2026 in Bengaluru \u2014 the first official DRC Race and the flag-off of DRC Racing. Saturday is qualification, elimination and challenges across enduro, rock garden, hill climb, slush, mud and technical surfaces. Sunday is the Final. Overall prize pool: \u20b95,00,000. Held in partnership with Dev Venkat (3\u00d7 National Champion) and Tribal Adventure.",
    },
    {
      question: "What training does DRC offer in Bengaluru?",
      answer: "DRC runs structured off-road training \u2014 from first-time-on-dirt fundamentals (body position, throttle control, standing up) through to advanced enduro, hill climbs, water crossings and rock gardens. Coaches with race-level experience, small groups, real terrain.",
    },
    {
      question: "Do I need an off-road bike to join DRC rides?",
      answer: "No. DRC welcomes all motorcycle types. Dedicated off-road/adventure bikes are ideal for technical trails, but many of our rides are suitable for standard motorcycles. Each ride is categorised by difficulty \u2014 from easy gravel paths for any bike to advanced terrain requiring off-road-specific machines. Check the difficulty on each ride page before registering.",
    },
    {
      question: "How do I register for a ride, training or race?",
      answer: "Create an account on dirtridecamp.com, browse upcoming rides, trainings and events, and register. Slots are limited by design. Payment confirms your spot; ride details, WhatsApp group and route information follow on email and WhatsApp.",
    },
    {
      question: "Where does DRC operate?",
      answer: "Headquartered in Bengaluru. Rides and expeditions across Karnataka \u2014 Krishnagiri, Kanakapura, Ramanagara, Sakleshpur, Coorg, Chikkamagaluru \u2014 with multi-day trips to Hampi, Goa, Ladakh and Spiti. DRC Racing runs six official races every year across India. On the horizon: DRC Mini Dakar, a five-day desert endurance vision in Rajasthan.",
    },
    {
      question: "How does DRC handle safety?",
      answer: "Every ride and race includes experienced ride leads and sweep riders, mandatory gear checks (helmet, boots, gloves, knee guards), first-aid trained marshals, support vehicles with tools and spares, GPS tracking, and evacuation plans. Group sizes are capped for control.",
    },
  ];

  return (
    <>
      <OrganizationJsonLd />
      <WebSiteJsonLd />
      <FAQJsonLd faqs={homeFaqs} />
      {reviews.length > 0 && <AggregateRatingJsonLd ratingValue={Math.round(avgRating * 10) / 10} reviewCount={reviews.length} />}
      <AnimatedHero />
      <AnimatedStats />
      <UltimateRiderSpotlight />

      <AnimatedRidesSection>
        {rides.map((ride) => (
          <AnimatedCard key={ride.id}>
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
          </AnimatedCard>
        ))}
      </AnimatedRidesSection>

      <AnimatedFeatures />

      {trainings.length > 0 && (
        <AnimatedTrainingsSection>
          {trainings.map((t) => (
            <AnimatedCard key={t.id}>
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
            </AnimatedCard>
          ))}
        </AnimatedTrainingsSection>
      )}

      <AnimatedTestimonials reviews={reviewsForDisplay} />
      <AnimatedFAQ faqs={homeFaqs} />
      <AnimatedCTA />
    </>
  );
}
