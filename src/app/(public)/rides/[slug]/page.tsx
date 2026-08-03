export const dynamic = "force-dynamic";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { MapPin, Calendar, Clock, Users, Mountain, ChevronLeft, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatPrice, formatDateRange, getSlotsText } from "@/lib/utils";
import { TrailMap } from "@/components/rides/TrailMap";
import { RegisterButton } from "@/components/rides/RegisterButton";
import { RideEventJsonLd } from "@/components/seo/JsonLd";
import Link from "next/link";
import type { Metadata } from "next";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const ride = await prisma.ride.findUnique({ where: { slug } });
  if (!ride) return { title: "Ride Not Found" };
  return { title: ride.title, description: ride.shortDesc || ride.description.slice(0, 160) };
}

export default async function RideDetailPage({ params }: Props) {
  const { slug } = await params;
  const ride = await prisma.ride.findUnique({
    where: { slug },
    include: { registrations: { where: { status: { in: ["confirmed", "checked_in"] } } } },
  });

  if (!ride) notFound();

  const inclusions: string[] = ride.inclusions ? JSON.parse(ride.inclusions) : [];
  const itinerary: { time: string; title: string; desc: string }[] = ride.itinerary
    ? JSON.parse(ride.itinerary)
    : [];
  const bookedSlots = ride.registrations.length;
  const slotsText = getSlotsText(ride.totalSlots, bookedSlots);
  const soldOut = ride.totalSlots - bookedSlots <= 0;

  const difficultyColors: Record<string, "success" | "warning" | "orange" | "error"> = {
    easy: "success",
    moderate: "warning",
    hard: "orange",
    extreme: "error",
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <RideEventJsonLd ride={{ title: ride.title, slug: ride.slug, description: ride.description, location: ride.location, startDate: ride.startDate.toISOString(), endDate: ride.endDate.toISOString(), price: ride.price, totalSlots: ride.totalSlots, bookedSlots }} />
      <Link href="/rides" className="inline-flex items-center gap-1 text-sm text-muted hover:text-orange mb-6 transition-colors">
        <ChevronLeft className="w-4 h-4" /> Back to Rides
      </Link>

      {/* Header */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={difficultyColors[ride.difficulty] || "orange"}>{ride.difficulty}</Badge>
          <Badge variant="muted">{ride.type}</Badge>
          {ride.featured && <Badge variant="tan">Featured</Badge>}
        </div>

        <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold">{ride.title}</h1>

        <div className="flex flex-wrap gap-6 text-muted">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-orange" />
            <span>{ride.location}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-orange" />
            <span>{formatDateRange(ride.startDate.toISOString(), ride.endDate.toISOString())}</span>
          </div>
          {ride.startTime && (
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-orange" />
              <span>Starts at {ride.startTime}</span>
            </div>
          )}
        </div>
      </div>

      {/* Cover image placeholder */}
      <div className="mt-8 h-64 sm:h-96 bg-surface border border-border rounded-sm flex items-center justify-center">
        {ride.coverImage ? (
          <img src={ride.coverImage} alt={ride.title} className="w-full h-full object-cover rounded-sm" />
        ) : (
          <Mountain className="w-24 h-24 text-muted/20" />
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-10">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-8">
          <div>
            <h2 className="font-heading text-2xl font-semibold mb-4">About This Ride</h2>
            <p className="text-foreground/80 leading-relaxed whitespace-pre-line">{ride.description}</p>
          </div>

          {inclusions.length > 0 && (
            <div>
              <h2 className="font-heading text-2xl font-semibold mb-4">Inclusions</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {inclusions.map((item) => (
                  <div key={item} className="flex items-center gap-2 text-foreground/80">
                    <CheckCircle2 className="w-5 h-5 text-success shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {itinerary.length > 0 && (
            <div>
              <h2 className="font-heading text-2xl font-semibold mb-4">Itinerary</h2>
              <div className="space-y-4">
                {itinerary.map((item, i) => (
                  <div key={i} className="flex gap-4 relative">
                    <div className="flex flex-col items-center">
                      <div className="w-3 h-3 bg-orange rounded-full mt-1.5 shrink-0" />
                      {i < itinerary.length - 1 && (
                        <div className="w-px flex-1 bg-border mt-1" />
                      )}
                    </div>
                    <div className="pb-4">
                      <span className="text-xs text-orange font-semibold tracking-wider uppercase">
                        {item.time}
                      </span>
                      <h4 className="font-heading text-lg font-semibold mt-0.5">{item.title}</h4>
                      <p className="text-sm text-muted mt-0.5">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {ride.startPoint && (
            <div>
              <h2 className="font-heading text-2xl font-semibold mb-4">Meeting Point</h2>
              <div className="flex items-start gap-2 text-foreground/80">
                <MapPin className="w-5 h-5 text-orange mt-0.5 shrink-0" />
                <span>{ride.startPoint}</span>
              </div>
            </div>
          )}

          <TrailMap difficulty={ride.difficulty} location={ride.location} type={ride.type} />
        </div>

        {/* Sidebar — Booking card */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 bg-surface border border-border rounded-sm p-6 space-y-6">
            <div>
              <span className="text-sm text-muted uppercase tracking-wider">Rider Fee</span>
              <div className="font-heading text-4xl font-bold text-orange mt-1">
                {formatPrice(ride.price)}
              </div>
              <span className="text-sm text-muted">per rider</span>
            </div>

            <div className="border-t border-border pt-4">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-5 h-5 text-orange" />
                <span className={`font-semibold ${soldOut ? "text-error" : ride.totalSlots - bookedSlots <= 3 ? "text-orange" : "text-foreground"}`}>
                  {slotsText}
                </span>
              </div>
              <div className="w-full bg-surface-lighter rounded-full h-2 mt-2">
                <div
                  className="bg-orange h-2 rounded-full transition-all"
                  style={{ width: `${Math.min((bookedSlots / ride.totalSlots) * 100, 100)}%` }}
                />
              </div>
            </div>

            <RegisterButton rideId={ride.id} rideSlug={ride.slug} rideTitle={ride.title} ridePrice={ride.price} soldOut={soldOut} />

            <a href="https://wa.me/919414870102" target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="md" className="w-full mt-2">
                Ask on WhatsApp
              </Button>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
