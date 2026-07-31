export const dynamic = "force-dynamic";
import { prisma } from "@/lib/prisma";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import Link from "next/link";
import { Check, Crown, Star, Zap } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Membership" };

export default async function MembershipPage() {
  const plans = await prisma.membershipPlan.findMany({
    where: { active: true },
    orderBy: { price: "asc" },
  });

  const tierIcons: Record<string, React.ReactNode> = {
    silver: <Star className="w-8 h-8" />,
    gold: <Zap className="w-8 h-8" />,
    platinum: <Crown className="w-8 h-8" />,
  };

  const tierColors: Record<string, string> = {
    silver: "from-gray-400 to-gray-500",
    gold: "from-yellow-500 to-amber-600",
    platinum: "from-orange to-red-500",
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
      <SectionHeader
        accent="Join the tribe"
        title="DRC Membership"
        subtitle="Unlock exclusive benefits, priority booking, and member-only rides."
      />

      <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
        {plans.map((plan) => {
          const benefits = JSON.parse(plan.benefits) as string[];
          return (
            <div key={plan.id} className={`relative bg-surface border rounded-sm overflow-hidden ${plan.tier === "gold" ? "border-orange ring-1 ring-orange/30" : "border-border"}`}>
              {plan.tier === "gold" && (
                <div className="absolute top-0 right-0">
                  <Badge variant="orange" className="rounded-none rounded-bl-sm">Most Popular</Badge>
                </div>
              )}
              <div className={`p-6 text-center bg-gradient-to-br ${tierColors[plan.tier] || ""} text-white`}>
                {tierIcons[plan.tier]}
                <h3 className="font-heading text-2xl font-bold mt-3">{plan.name}</h3>
                <p className="text-white/80 text-sm mt-1">{plan.description}</p>
              </div>
              <div className="p-6">
                <div className="text-center mb-6">
                  <span className="font-heading text-4xl font-bold text-orange">
                    &#8377;{plan.price.toLocaleString("en-IN")}
                  </span>
                  <span className="text-muted text-sm">/{plan.duration >= 365 ? "year" : `${plan.duration} days`}</span>
                </div>
                <ul className="space-y-3">
                  {benefits.map((benefit, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <Check className="w-4 h-4 text-success shrink-0 mt-0.5" />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
                <Link href="/login?redirect=/membership" className="block mt-6">
                  <Button className="w-full" variant={plan.tier === "gold" ? "primary" : "outline"}>
                    Get {plan.name}
                  </Button>
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
