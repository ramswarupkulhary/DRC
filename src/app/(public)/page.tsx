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
      include: { user: { select: { name: true } } },
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
  }));

  const avgRating = reviews.length > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 4.8;

  const homeFaqs = [
    {
      question: "What is DRC — Dirt Ride Camp?",
      answer: "DRC (Dirt Ride Camp) is Bangalore's premier off-road academy and adventure riding community. We organize curated off-road bike trips, professional dirt bike training classes, adventure camping trips, and trail riding experiences across Karnataka and India. Founded by passionate riders, DRC offers limited-slot adventure rides to ensure quality, safety, and a personal touch.",
    },
    {
      question: "What off-road training classes does DRC's academy offer in Bangalore?",
      answer: "DRC's off-road academy offers structured training classes for all skill levels in Bangalore — from beginner courses covering basic dirt bike handling and body positioning, to advanced enduro techniques including hill climbs, water crossings, and rock gardens. Our professional instructors provide hands-on coaching with a maximum 6:1 rider-to-instructor ratio.",
    },
    {
      question: "Do I need an off-road bike to join DRC rides?",
      answer: "No! DRC welcomes all motorcycle types. While dedicated off-road/adventure bikes are ideal for technical trails, many of our rides are suitable for standard motorcycles. We categorize rides by difficulty — from easy gravel paths suitable for any bike, to challenging terrain requiring off-road-specific motorcycles. Check each ride's difficulty rating before registering.",
    },
    {
      question: "How do I register for a DRC ride or training?",
      answer: "Simply create an account on dirtridecamp.com, browse upcoming rides or training programs, and click 'Register'. Slots are limited and fill up fast — typically 10-15 riders per ride. Payment is required to confirm your spot. You'll receive ride details, WhatsApp group link, and route information after confirmation.",
    },
    {
      question: "What areas does DRC cover for bike trips & adventure rides near Bangalore?",
      answer: "DRC organizes adventure bike trips across Karnataka including Kanakapura trails, Ramanagara rocky terrains, Sakleshpur coffee estate trails, Coorg forest paths, Chikkamagaluru dirt tracks, and Krishnagiri off-road circuits. We also run multi-day camping trips and expedition rides to Hampi, Goa coastal trails, and Ladakh/Spiti adventure tours.",
    },
    {
      question: "Is off-road riding safe? What safety measures does DRC follow?",
      answer: "Safety is DRC's top priority. Every ride includes: experienced ride leads and sweep riders, mandatory riding gear checks (helmet, boots, gloves, knee guards), first-aid trained marshals, support vehicle with tools and spares, GPS tracking, and emergency evacuation plans. We maintain a maximum group size of 15 riders for better safety management.",
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
