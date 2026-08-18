import { SectionHeader } from "@/components/ui/SectionHeader";
import { Mountain, Flame, Users, Shield, Target, Heart } from "lucide-react";
import { AnimatedPageHeader, AnimatedGrid, AnimatedGridItem, AnimatedSection, AnimatedSlide, HoverCard } from "@/components/ui/AnimatedPage";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About DRC — Bangalore's Off-Road Riding Community",
  description: "Dirt Ride Camp (DRC) is Bangalore's premier off-road riding group. Built by riders, for riders — adventure motorcycle rides, camping trips & off-road training since day one.",
  openGraph: {
    title: "About Dirt Ride Camp — Bangalore Riding Group",
    description: "Built by riders, for riders. Adventure motorcycle rides, camping & off-road training.",
  },
};

const values = [
  { icon: Mountain, title: "Adventure", desc: "We seek the road less traveled. Every trail is a new story." },
  { icon: Users, title: "Community", desc: "Riding solo is fun. Riding together is an experience." },
  { icon: Shield, title: "Safety", desc: "We never compromise on safety. First aid, support vehicles, experienced leads." },
  { icon: Flame, title: "Passion", desc: "Born from a love for dirt, dust, and the open trail." },
  { icon: Target, title: "Skill Building", desc: "We believe every rider can improve. Our trainings are designed for growth." },
  { icon: Heart, title: "Inclusivity", desc: "All bikes, all experience levels, all genders. If you ride, you belong." },
];

export default function AboutPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
      <AnimatedPageHeader>
        <SectionHeader accent="Our story" title="About DRC" />
      </AnimatedPageHeader>

      <div className="mt-12 space-y-8 text-foreground/80 leading-relaxed text-lg">
        <AnimatedSlide from="left">
          <p>
            <strong className="text-foreground">Dirt Ride Camp (DRC)</strong> was born from a simple idea: that off-road riding shouldn&apos;t
            be a solo pursuit. It should be shared — around campfires, on dusty trails, and through
            experiences that push you just beyond your comfort zone.
          </p>
        </AnimatedSlide>

        <AnimatedSlide from="right">
          <p>
            We organize <strong className="text-foreground">curated off-road rides</strong> across South India — from the rocky
            terrains of Krishnagiri to the misty trails of Coorg. Each ride is limited to a small group,
            ensuring quality, safety, and a personal touch that mass events can&apos;t offer.
          </p>
        </AnimatedSlide>

        <AnimatedSlide from="left">
          <p>
            Beyond rides, we run <strong className="text-foreground">structured training programs</strong> for riders at every level.
            Whether you&apos;re a street rider curious about dirt or an experienced off-roader looking to sharpen
            technique, our programs are designed to build confidence one skill at a time.
          </p>
        </AnimatedSlide>

        <AnimatedSlide from="right">
          <p>
            DRC is more than a company — it&apos;s a crew. A community of riders who share a love for
            adventure, the outdoors, and the freedom that comes with riding through untouched terrain.
          </p>
        </AnimatedSlide>
      </div>

      <AnimatedSection className="mt-16">
        <div className="text-center border-y border-border py-10">
          <p className="font-heading text-3xl sm:text-4xl font-bold text-orange tracking-wider">
            RIDE &middot; EXPLORE &middot; CONNECT
          </p>
          <p className="text-muted mt-2">Bangalore, India</p>
        </div>
      </AnimatedSection>

      <div className="mt-16">
        <AnimatedPageHeader>
          <SectionHeader accent="What drives us" title="Our Values" />
        </AnimatedPageHeader>
        <AnimatedGrid className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-10">
          {values.map((v) => (
            <AnimatedGridItem key={v.title}>
              <HoverCard>
                <div className="p-6 border border-border rounded-sm hover:border-orange/30 transition-colors h-full">
                  <v.icon className="w-8 h-8 text-orange mb-3" />
                  <h3 className="font-heading text-lg font-semibold mb-2">{v.title}</h3>
                  <p className="text-sm text-muted">{v.desc}</p>
                </div>
              </HoverCard>
            </AnimatedGridItem>
          ))}
        </AnimatedGrid>
      </div>
    </div>
  );
}
