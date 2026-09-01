export const dynamic = "force-dynamic";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/Badge";
import { Calendar, MapPin, Users, Trophy } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { BreadcrumbJsonLd } from "@/components/seo/JsonLd";
import Link from "next/link";
import type { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const event = await prisma.event.findUnique({ where: { slug } });
  if (!event) return { title: "Event Not Found" };
  const description = event.description?.slice(0, 160) || `${event.title} — an off-road event by Dirt Ride Camp (DRC) in Bangalore.`;
  return {
    title: event.title,
    description,
    alternates: { canonical: `/events/${event.slug}` },
    openGraph: {
      type: "website",
      title: event.title,
      description,
      url: `/events/${event.slug}`,
    },
  };
}

export default async function EventDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const event = await prisma.event.findUnique({ where: { slug } });
  if (!event) notFound();

  const prizes = event.prizes ? (JSON.parse(event.prizes) as string[]) : [];
  const rules = event.rules ? (JSON.parse(event.rules) as string[]) : [];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
      <BreadcrumbJsonLd items={[
        { name: "Home", url: "https://www.dirtridecamp.com" },
        { name: "Events", url: "https://www.dirtridecamp.com/events" },
        { name: event.title, url: `https://www.dirtridecamp.com/events/${event.slug}` },
      ]} />
      <div className="flex items-center gap-3 mb-4">
        <Badge variant="orange">{event.type}</Badge>
        <Badge variant={event.status === "upcoming" ? "success" : "muted"}>{event.status}</Badge>
        {event.featured && <Badge variant="warning">Featured</Badge>}
      </div>

      <h1 className="font-heading text-3xl sm:text-4xl font-bold">{event.title}</h1>

      <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-muted">
        <span className="flex items-center gap-1.5">
          <Calendar className="w-4 h-4 text-orange" />
          {event.date.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
        </span>
        <span className="flex items-center gap-1.5">
          <MapPin className="w-4 h-4 text-orange" />
          {event.location}
        </span>
        {event.totalSlots > 0 && (
          <span className="flex items-center gap-1.5">
            <Users className="w-4 h-4 text-orange" />
            {event.totalSlots} participants max
          </span>
        )}
      </div>

      {event.price > 0 && (
        <p className="text-2xl font-heading font-bold text-orange mt-4">&#8377;{event.price.toLocaleString("en-IN")}</p>
      )}
      {event.price === 0 && (
        <p className="text-xl font-heading font-bold text-success mt-4">Free Entry</p>
      )}

      <div className="mt-8 prose prose-invert max-w-none text-foreground/80 leading-relaxed whitespace-pre-line">
        {event.description}
      </div>

      {prizes.length > 0 && (
        <div className="mt-10">
          <h3 className="font-heading text-xl font-bold text-tan flex items-center gap-2">
            <Trophy className="w-5 h-5 text-orange" /> Prizes
          </h3>
          <ul className="mt-3 space-y-2">
            {prizes.map((p, i) => (
              <li key={i} className="flex items-center gap-3 text-sm">
                <span className="w-6 h-6 rounded-full bg-orange/10 flex items-center justify-center text-xs font-bold text-orange">{i + 1}</span>
                {p}
              </li>
            ))}
          </ul>
        </div>
      )}

      {rules.length > 0 && (
        <div className="mt-10">
          <h3 className="font-heading text-xl font-bold text-tan">Rules & Regulations</h3>
          <ul className="mt-3 space-y-2">
            {rules.map((r, i) => (
              <li key={i} className="text-sm text-muted flex items-start gap-2">
                <span className="text-orange mt-0.5">·</span>
                {r}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-10 flex gap-4">
        <Link href="/contact">
          <Button>Register / Inquire</Button>
        </Link>
        <Link href="/events">
          <Button variant="outline">All Events</Button>
        </Link>
      </div>
    </div>
  );
}
