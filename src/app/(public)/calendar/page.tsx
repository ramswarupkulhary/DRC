export const dynamic = "force-dynamic";
import { prisma } from "@/lib/prisma";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Badge } from "@/components/ui/Badge";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Calendar" };

export default async function CalendarPage() {
  const rides = await prisma.ride.findMany({
    where: { status: "published", startDate: { gte: new Date() } },
    orderBy: { startDate: "asc" },
    include: { registrations: { where: { status: { not: "cancelled" } } } },
  });

  const trainings = await prisma.training.findMany({
    where: { status: "published" },
    orderBy: { createdAt: "desc" },
  });

  const events = await prisma.event.findMany({
    where: { status: "upcoming", date: { gte: new Date() } },
    orderBy: { date: "asc" },
  });

  const months: Record<string, typeof rides> = {};
  for (const ride of rides) {
    if (!ride.startDate) continue;
    const key = ride.startDate.toLocaleDateString("en-IN", { month: "long", year: "numeric" });
    if (!months[key]) months[key] = [];
    months[key].push(ride);
  }

  const diffColor: Record<string, "success" | "warning" | "error" | "orange"> = {
    easy: "success", moderate: "warning", hard: "error",
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
      <SectionHeader
        accent="Plan your adventure"
        title="Availability Calendar"
        subtitle="See all upcoming rides, trainings, and events at a glance."
      />

      {/* Rides by month */}
      {Object.entries(months).map(([month, monthRides]) => (
        <div key={month} className="mt-10">
          <h3 className="font-heading text-xl font-bold text-tan mb-4">{month}</h3>
          <div className="space-y-3">
            {monthRides.map((ride) => {
              const booked = ride.registrations.length;
              const available = ride.totalSlots - booked;
              return (
                <Link key={ride.id} href={`/rides/${ride.slug}`} className="block">
                  <div className="bg-surface border border-border rounded-sm p-4 flex items-center gap-4 hover:border-orange/50 transition-colors">
                    <div className="w-16 text-center shrink-0">
                      <p className="font-heading text-2xl font-bold text-orange">
                        {ride.startDate!.getDate()}
                      </p>
                      <p className="text-xs text-muted uppercase">
                        {ride.startDate!.toLocaleDateString("en-IN", { weekday: "short" })}
                      </p>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold truncate">{ride.title}</h4>
                      <p className="text-xs text-muted">{ride.location} · {ride.startTime || ""}</p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <Badge variant={diffColor[ride.difficulty] || "muted"}>{ride.difficulty}</Badge>
                      <div className="text-right">
                        <p className="font-semibold text-orange">&#8377;{ride.price.toLocaleString("en-IN")}</p>
                        <p className={`text-xs ${available <= 2 ? "text-error" : "text-muted"}`}>
                          {available > 0 ? `${available} slots left` : "Full"}
                        </p>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      ))}

      {/* Events */}
      {events.length > 0 && (
        <div className="mt-12">
          <h3 className="font-heading text-xl font-bold text-tan mb-4">Upcoming Events</h3>
          <div className="space-y-3">
            {events.map((event) => (
              <Link key={event.id} href={`/events/${event.slug}`} className="block">
                <div className="bg-surface border border-orange/20 rounded-sm p-4 flex items-center gap-4 hover:border-orange/50 transition-colors">
                  <div className="w-16 text-center shrink-0">
                    <p className="font-heading text-2xl font-bold text-orange">{event.date.getDate()}</p>
                    <p className="text-xs text-muted">{event.date.toLocaleDateString("en-IN", { month: "short" })}</p>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold">{event.title}</h4>
                    <p className="text-xs text-muted">{event.location}</p>
                  </div>
                  <Badge variant="orange">{event.type}</Badge>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Trainings */}
      <div className="mt-12">
        <h3 className="font-heading text-xl font-bold text-tan mb-4">Training Programs (Always Available)</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {trainings.map((t) => (
            <Link key={t.id} href={`/trainings/${t.slug}`} className="block">
              <div className="bg-surface border border-border rounded-sm p-4 hover:border-orange/50 transition-colors">
                <h4 className="font-semibold">{t.title}</h4>
                <div className="flex items-center gap-3 mt-2">
                  <Badge variant={t.level === "beginner" ? "success" : "warning"}>{t.level}</Badge>
                  <span className="text-sm text-muted">{t.duration}</span>
                  <span className="text-sm font-semibold text-orange">&#8377;{t.price.toLocaleString("en-IN")}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
