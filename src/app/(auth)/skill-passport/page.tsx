"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Badge } from "@/components/ui/Badge";
import { Trophy, Mountain, MapPin, Clock, Award, Star, Shield, Bike, TrendingUp } from "lucide-react";

interface PassportData {
  user: {
    name: string | null;
    image: string | null;
    skillLevel: string;
    skillPoints: number;
    totalRides: number;
    totalKm: number;
    totalHours: number;
    createdAt: string;
  };
  badges: { id: string; name: string; icon: string; description: string; earnedAt: string }[];
  rideHistory: { id: string; title: string; date: string; difficulty: string; location: string }[];
  trainingsCompleted: number;
  certificateCount: number;
}

const levelThresholds = [
  { name: "Bronze", min: 0, color: "from-amber-700 to-amber-900", icon: Shield },
  { name: "Silver", min: 300, color: "from-gray-400 to-gray-600", icon: Shield },
  { name: "Gold", min: 800, color: "from-yellow-400 to-yellow-600", icon: Star },
  { name: "Platinum", min: 1500, color: "from-cyan-300 to-cyan-600", icon: Trophy },
  { name: "Legend", min: 3000, color: "from-orange to-red-600", icon: Award },
];

export default function SkillPassportPage() {
  const { status } = useSession();
  const router = useRouter();
  const [data, setData] = useState<PassportData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login?redirect=/skill-passport");
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/rider/skill-passport")
        .then((r) => r.json())
        .then((d) => { setData(d); setLoading(false); })
        .catch(() => setLoading(false));
    }
  }, [status]);

  if (loading || !data) {
    return <div className="min-h-[60vh] flex items-center justify-center text-muted">Loading passport...</div>;
  }

  const currentLevel = levelThresholds.filter((l) => data.user.skillPoints >= l.min).pop()!;
  const nextLevel = levelThresholds.find((l) => l.min > data.user.skillPoints);
  const progress = nextLevel
    ? ((data.user.skillPoints - currentLevel.min) / (nextLevel.min - currentLevel.min)) * 100
    : 100;
  const LevelIcon = currentLevel.icon;
  const memberSince = new Date(data.user.createdAt).toLocaleDateString("en-IN", { month: "short", year: "numeric" });

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      <SectionHeader accent="Your journey" title="Skill Passport" align="left" />

      {/* Passport Card */}
      <div className="mt-8 bg-surface border border-border rounded-sm overflow-hidden">
        <div className={`bg-gradient-to-r ${currentLevel.color} p-6 sm:p-8`}>
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 sm:w-24 sm:h-24 bg-black/30 rounded-full flex items-center justify-center border-4 border-white/20">
              <LevelIcon className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
            </div>
            <div className="text-white">
              <h2 className="font-heading text-2xl sm:text-3xl font-bold">{data.user.name || "Rider"}</h2>
              <p className="text-white/80 text-sm mt-1">DRC {currentLevel.name} Rider</p>
              <p className="text-white/60 text-xs mt-1">Member since {memberSince}</p>
            </div>
          </div>
        </div>

        <div className="p-6 sm:p-8 space-y-6">
          {/* XP Progress */}
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="font-semibold text-tan">{currentLevel.name} Level — {data.user.skillPoints} XP</span>
              {nextLevel && <span className="text-muted">{nextLevel.min} XP for {nextLevel.name}</span>}
            </div>
            <div className="h-4 bg-surface-light rounded-full overflow-hidden">
              <div className={`h-full bg-gradient-to-r ${currentLevel.color} transition-all`} style={{ width: `${progress}%` }} />
            </div>
            {!nextLevel && <p className="text-xs text-orange mt-1">Maximum level reached!</p>}
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: "Rides", value: data.user.totalRides, icon: Bike },
              { label: "Distance", value: `${data.user.totalKm} km`, icon: MapPin },
              { label: "Seat Time", value: `${data.user.totalHours} hrs`, icon: Clock },
              { label: "Trainings", value: data.trainingsCompleted, icon: TrendingUp },
            ].map((s) => (
              <div key={s.label} className="bg-background border border-border rounded-sm p-4 text-center">
                <s.icon className="w-5 h-5 text-orange mx-auto mb-2" />
                <p className="font-heading text-xl font-bold">{s.value}</p>
                <p className="text-xs text-muted">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Badges */}
          {data.badges.length > 0 && (
            <div>
              <h3 className="font-heading text-lg font-semibold text-tan mb-3">Badges ({data.badges.length})</h3>
              <div className="flex flex-wrap gap-3">
                {data.badges.map((b) => (
                  <div key={b.id} className="flex items-center gap-2 bg-background border border-border rounded-sm px-3 py-2">
                    <Award className="w-4 h-4 text-orange" />
                    <span className="text-sm font-medium">{b.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Ride History Timeline */}
          {data.rideHistory.length > 0 && (
            <div>
              <h3 className="font-heading text-lg font-semibold text-tan mb-3">Ride History</h3>
              <div className="space-y-3">
                {data.rideHistory.map((ride) => (
                  <div key={ride.id} className="flex items-center gap-4 bg-background border border-border rounded-sm p-3">
                    <div className="w-10 h-10 bg-orange/10 rounded-full flex items-center justify-center shrink-0">
                      <Mountain className="w-5 h-5 text-orange" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{ride.title}</p>
                      <p className="text-xs text-muted">{ride.location}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <Badge variant={ride.difficulty === "easy" ? "success" : ride.difficulty === "hard" ? "orange" : "warning"}>
                        {ride.difficulty}
                      </Badge>
                      <p className="text-xs text-muted mt-1">{new Date(ride.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "2-digit" })}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Certificates Count */}
          {data.certificateCount > 0 && (
            <div className="flex items-center gap-3 bg-orange/10 border border-orange/20 rounded-sm p-4">
              <Award className="w-6 h-6 text-orange" />
              <p className="text-sm">{data.certificateCount} certificate{data.certificateCount > 1 ? "s" : ""} earned</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
