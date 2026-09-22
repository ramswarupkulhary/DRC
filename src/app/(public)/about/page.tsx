import { SectionHeader } from "@/components/ui/SectionHeader";
import { Trophy, GraduationCap, Compass, Users, Camera, Handshake, ArrowRight } from "lucide-react";
import { AnimatedPageHeader, AnimatedGrid, AnimatedGridItem, AnimatedSection, AnimatedSlide, HoverCard } from "@/components/ui/AnimatedPage";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About DRC Motorsports — An Indian Motorcycle Culture &amp; Motorsport Platform",
  description: "DRC Motorsports Pvt Ltd is an Indian motorcycle culture and motorsport platform — racing, training, adventure and community. Six official races every year, across India. Flag-off: DRC Ultimate Rider, Bengaluru, Dec 12\u201313 2026.",
  keywords: ["DRC Motorsports", "DRC Racing", "Indian motorsport", "motorcycle racing India", "off road racing India", "enduro India", "DRC Ultimate Rider", "Dirt Ride Camp", "Ramswarup Kulhary"],
  openGraph: {
    title: "About DRC Motorsports",
    description: "An Indian motorcycle culture and motorsport platform. Racing, training, adventure and community — built around the rider.",
  },
};

const pillars = [
  { icon: Trophy, title: "Racing", desc: "DRC Racing — six official races every year, across India. Flag-off: DRC Ultimate Rider, Bengaluru." },
  { icon: GraduationCap, title: "Training", desc: "Structured, coach-led off-road progression — from first time on dirt to enduro and hill-climb ready." },
  { icon: Compass, title: "Adventure", desc: "Curated expeditions across India. On the horizon: DRC Mini Dakar, a five-day desert endurance in Rajasthan." },
  { icon: Users, title: "Community", desc: "A home for Indian motorcycle culture — riders, brands, content and experiences under one platform." },
  { icon: Camera, title: "Content", desc: "Race films, rider stories, product integrations. The platform documents what the platform runs." },
  { icon: Handshake, title: "Brands", desc: "Category-exclusive partnerships across race, experience, content, community and hospitality." },
];

export default function AboutPage() {
  return (
    <div>
      {/* Hero */}
      <section className="relative border-b border-border overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-40 pointer-events-none" />
        <div className="absolute -top-40 -right-40 w-[520px] h-[520px] rounded-full bg-orange/10 blur-3xl pointer-events-none" />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 sm:pt-28 pb-16 sm:pb-24">
          <div className="flex items-center gap-3 mb-6">
            <span className="h-px w-10 bg-orange" />
            <span className="eyebrow">DRC Motorsports Pvt Ltd</span>
          </div>
          <h1 className="font-heading font-bold uppercase text-5xl sm:text-7xl lg:text-8xl leading-[0.92] tracking-[-0.02em] max-w-5xl">
            We are not building <br /><span className="text-orange">just another race.</span>
          </h1>
          <p className="mt-8 text-lg sm:text-xl text-foreground/70 max-w-2xl leading-relaxed">
            Indian motorcycle culture has always been larger than the space it was given. What was missing was a home &mdash; a world around the rider, not a single weekend, and not a single start line.
          </p>
        </div>
      </section>

      {/* The story */}
      <section className="border-b border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-4">
            <div className="flex items-center gap-3 mb-4">
              <span className="h-px w-10 bg-orange" />
              <span className="eyebrow">The story</span>
            </div>
            <h2 className="font-heading font-bold uppercase text-3xl sm:text-4xl leading-[1] tracking-[-0.01em]">
              Adventure isn&rsquo;t found. <span className="text-orange">It&rsquo;s earned.</span>
            </h2>
          </div>

          <div className="lg:col-span-8 space-y-6 text-lg text-foreground/80 leading-relaxed">
            <p>
              <strong className="text-foreground">DRC Motorsports Pvt Ltd</strong> is an Indian motorcycle culture and motorsport platform. Registered in India. Operating across India. Built around the rider.
            </p>
            <p>
              DRC exists because a serious rider in this country should not have to choose between a weekend club, a training school and a race organiser. That splintering is what we're closing. Under one platform: <strong className="text-foreground">racing, training, adventure, motorsport, experiences, community, content and brands</strong>. Nine verticals, one home.
            </p>
            <p>
              Our flag-off is <strong className="text-foreground">DRC Ultimate Rider</strong> — the first official DRC race, 12&ndash;13 December 2026, Bengaluru. A two-day motorsport event across enduro, rock garden, hill climb, slush, mud and technical surfaces, with a &#8377;5 Lakh overall prize pool. Held on ground that already knows how to hold a championship, in partnership with <strong className="text-foreground">Dev Venkat</strong> (3× National Champion) and Tribal Adventure.
            </p>
            <p>
              Ultimate Rider is not a finale. It is the start of <strong className="text-foreground">DRC Racing</strong> — six official races every year, across India. On the horizon: <strong className="text-foreground">DRC Mini Dakar</strong>, a five-day desert endurance in Rajasthan.
            </p>
            <p>
              The rider is the centre. Everything else is built around that.
            </p>
          </div>
        </div>
      </section>

      {/* Platform pillars */}
      <section className="border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-24">
          <div className="mb-14 max-w-3xl">
            <div className="flex items-center gap-3 mb-4">
              <span className="h-px w-10 bg-orange" />
              <span className="eyebrow">Nine verticals, one platform</span>
            </div>
            <h2 className="font-heading font-bold uppercase text-4xl sm:text-5xl leading-[0.95] tracking-[-0.01em]">
              What we <span className="text-orange">actually run</span>.
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-0 border-t border-l border-border">
            {pillars.map((p, i) => (
              <div key={p.title} className="group p-8 border-r border-b border-border bg-background hover:bg-surface transition-colors">
                <div className="font-mono text-xs uppercase tracking-widest text-orange">0{i + 1}</div>
                <p.icon className="w-8 h-8 text-foreground/60 group-hover:text-orange transition-colors mt-6" strokeWidth={1.5} />
                <h3 className="font-heading text-2xl font-bold uppercase mt-6 leading-tight">{p.title}</h3>
                <p className="text-sm text-foreground/70 leading-relaxed mt-3">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Leadership */}
      <section className="border-b border-border bg-surface">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-24">
          <div className="mb-14">
            <div className="flex items-center gap-3 mb-4">
              <span className="h-px w-10 bg-orange" />
              <span className="eyebrow">Brains behind the machines</span>
            </div>
            <h2 className="font-heading font-bold uppercase text-4xl sm:text-5xl leading-[0.95] tracking-[-0.01em]">
              Built by people who <span className="text-orange">ride</span>.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="p-8 border border-border bg-background">
              <div className="font-mono text-[10px] uppercase tracking-widest text-orange">Founder &amp; MD</div>
              <h3 className="font-heading text-3xl font-bold uppercase mt-3">Ramswarup Kulhary</h3>
              <p className="font-mono text-xs uppercase tracking-widest text-muted mt-2">Enduro rider</p>
              <p className="text-sm text-foreground/70 leading-relaxed mt-5">
                Building DRC around a simple belief: adventure isn&rsquo;t found, it&rsquo;s earned. DRC Motorsports is a world around the rider &mdash; riding, training, adventure, motorsport, racing and community, in one place.
              </p>
            </div>

            <div className="p-8 border border-border bg-background">
              <div className="font-mono text-[10px] uppercase tracking-widest text-orange">Race partner · Ultimate Rider</div>
              <h3 className="font-heading text-3xl font-bold uppercase mt-3">Dev Venkat</h3>
              <p className="font-mono text-xs uppercase tracking-widest text-muted mt-2">3× National Champion · Tribal Adventure</p>
              <p className="text-sm text-foreground/70 leading-relaxed mt-5">
                Dev built Tribal Adventure into a home for serious off-road riding. Ultimate Rider is here because the dirt, the people and the standard already exist.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-b border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <h2 className="font-heading font-bold uppercase text-3xl sm:text-5xl leading-[0.95] tracking-[-0.01em] max-w-3xl mx-auto">
            This is not the finish line. <br /><span className="text-orange">It&rsquo;s the flag-off.</span>
          </h2>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/events">
              <Button size="lg" className="uppercase tracking-wider">DRC Ultimate Rider <ArrowRight className="w-5 h-5" /></Button>
            </Link>
            <Link href="/contact" className="font-heading uppercase tracking-widest text-sm text-foreground/70 hover:text-orange transition-colors border-b border-transparent hover:border-orange pb-1">
              Partner with DRC →
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
