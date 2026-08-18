export const dynamic = "force-dynamic";
import { RideCard } from "@/components/rides/RideCard";
import { TrainingCard } from "@/components/training/TrainingCard";
import { prisma } from "@/lib/prisma";
import { OrganizationJsonLd, WebSiteJsonLd } from "@/components/seo/JsonLd";
import {
  AnimatedHero,
  AnimatedStats,
  AnimatedFeatures,
  AnimatedTestimonials,
  AnimatedCTA,
  AnimatedRidesSection,
  AnimatedTrainingsSection,
  AnimatedCard,
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

  return (
    <>
      <OrganizationJsonLd />
      <WebSiteJsonLd />
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
      <AnimatedCTA />
    </>
  );
}
