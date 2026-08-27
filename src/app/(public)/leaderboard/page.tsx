export const dynamic = "force-dynamic";
import { prisma } from "@/lib/prisma";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Badge } from "@/components/ui/Badge";
import { AnimatedPageHeader, AnimatedGrid, AnimatedGridItem } from "@/components/ui/AnimatedPage";
import { Trophy, Medal, Award, Star } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Rider Leaderboard — Top Adventure Riders | DRC Bangalore",
  description: "Top DRC riders ranked by XP, badges, and ride completions. Join Bangalore's off-road riding community and climb the leaderboard.",
};

export default async function LeaderboardPage() {
  const riders = await prisma.user.findMany({
    where: { role: "rider" },
    orderBy: { skillPoints: "desc" },
    take: 50,
    include: {
      registrations: { where: { status: "confirmed" }, select: { id: true } },
      badges: { include: { badge: true } },
    },
  });

  const rankIcons = [Trophy, Medal, Award];
  const rankColors = ["text-orange", "text-foreground/60", "text-orange/60"];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
      <AnimatedPageHeader>
        <SectionHeader
          accent="Hall of fame"
          title="Rider Leaderboard"
          subtitle="Top riders ranked by experience points, badges earned, and rides completed."
        />
      </AnimatedPageHeader>

      <AnimatedGrid className="mt-12 space-y-3">
        {riders.map((rider, i) => {
          const RankIcon = rankIcons[i] ?? null;
          return (
            <AnimatedGridItem key={rider.id}>
              <div className={`flex items-center gap-4 p-4 border border-border rounded-sm bg-surface ${i < 3 ? "border-orange/30" : ""}`}>
                <div className={`w-10 h-10 flex items-center justify-center shrink-0 font-heading font-bold text-lg ${i < 3 ? rankColors[i] : "text-muted"}`}>
                  {RankIcon ? <RankIcon className="w-6 h-6" /> : `#${i + 1}`}
                </div>

                <div className="w-10 h-10 rounded-full bg-orange/10 flex items-center justify-center shrink-0">
                  <span className="font-heading text-sm font-bold text-orange">
                    {rider.name?.split(" ").map((w) => w[0]).join("").slice(0, 2) ?? "?"}
                  </span>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-foreground truncate">{rider.name ?? "Anonymous"}</p>
                    <Badge variant="orange">{rider.skillLevel}</Badge>
                  </div>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="text-xs text-muted">{rider.skillPoints.toLocaleString()} pts</span>
                    <span className="text-xs text-muted">{rider.registrations.length} rides</span>
                    <span className="text-xs text-muted flex items-center gap-0.5">
                      <Star className="w-3 h-3" /> {rider.badges.length} badges
                    </span>
                  </div>
                </div>

                {rider.badges.length > 0 && (
                  <div className="hidden sm:flex items-center gap-1">
                    {rider.badges.slice(0, 3).map((ub) => (
                      <span key={ub.badge.id} className="text-lg" title={ub.badge.name}>{ub.badge.icon}</span>
                    ))}
                    {rider.badges.length > 3 && (
                      <span className="text-xs text-muted">+{rider.badges.length - 3}</span>
                    )}
                  </div>
                )}
              </div>
            </AnimatedGridItem>
          );
        })}
      </AnimatedGrid>

      {riders.length === 0 && (
        <div className="mt-16 text-center py-16 bg-surface border border-border rounded-sm">
          <p className="text-muted text-lg">No riders on the leaderboard yet. Be the first!</p>
        </div>
      )}
    </div>
  );
}
