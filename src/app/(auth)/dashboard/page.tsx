"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Badge } from "@/components/ui/Badge";
import Link from "next/link";
import { Trophy, Mountain, MapPin, Clock, Award } from "lucide-react";

interface DashboardData {
  user: {
    skillLevel: string;
    skillPoints: number;
    totalRides: number;
    totalKm: number;
    totalHours: number;
    referralCode: string;
    referralCredits: number;
  };
  badges: { id: string; name: string; icon: string; description: string; earnedAt: string }[];
  recentLogs: { id: string; date: string; distance: number; duration: number; ride: { title: string } | null }[];
  nextLevel: { name: string; pointsNeeded: number };
}

const levelThresholds = [
  { name: "Bronze", min: 0 },
  { name: "Silver", min: 300 },
  { name: "Gold", min: 800 },
  { name: "Platinum", min: 1500 },
  { name: "Legend", min: 3000 },
];

export default function DashboardPage() {
  const { status } = useSession();
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login?redirect=/dashboard");
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/rider/dashboard")
        .then((r) => r.json())
        .then((d) => { setData(d); setLoading(false); })
        .catch(() => setLoading(false));
    }
  }, [status]);

  if (loading || !data) {
    return <div className="min-h-[60vh] flex items-center justify-center text-muted">Loading dashboard...</div>;
  }

  const currentLevel = levelThresholds.filter((l) => data.user.skillPoints >= l.min).pop()!;
  const nextLevel = levelThresholds.find((l) => l.min > data.user.skillPoints);
  const progress = nextLevel
    ? ((data.user.skillPoints - currentLevel.min) / (nextLevel.min - currentLevel.min)) * 100
    : 100;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
      <SectionHeader accent="Your journey" title="Rider Dashboard" align="left" />

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Skill Level Card */}
        <div className="lg:col-span-2 bg-surface border border-border rounded-sm p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-heading text-lg font-semibold text-tan">Skill Progression</h3>
            <Badge variant="orange">{currentLevel.name} Level</Badge>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-full border-4 border-orange flex items-center justify-center">
              <Trophy className="w-8 h-8 text-orange" />
            </div>
            <div className="flex-1">
              <div className="flex justify-between text-sm mb-1">
                <span>{data.user.skillPoints} pts</span>
                {nextLevel && <span className="text-muted">{nextLevel.min} pts for {nextLevel.name}</span>}
              </div>
              <div className="h-3 bg-surface-light rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-orange to-red-500 transition-all" style={{ width: `${progress}%` }} />
              </div>
            </div>
          </div>
        </div>

        {/* Stats Card */}
        <div className="bg-surface border border-border rounded-sm p-6">
          <h3 className="font-heading text-lg font-semibold text-tan mb-4">Trail Stats</h3>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Mountain className="w-5 h-5 text-orange" />
              <div>
                <p className="font-semibold">{data.user.totalRides}</p>
                <p className="text-xs text-muted">Rides Completed</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <MapPin className="w-5 h-5 text-orange" />
              <div>
                <p className="font-semibold">{data.user.totalKm} km</p>
                <p className="text-xs text-muted">Total Distance</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-orange" />
              <div>
                <p className="font-semibold">{data.user.totalHours} hrs</p>
                <p className="text-xs text-muted">Seat Time</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Badges */}
      <div className="mt-8 bg-surface border border-border rounded-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-heading text-lg font-semibold text-tan">Badges Earned</h3>
          <span className="text-xs text-muted">{data.badges.length} earned</span>
        </div>
        {data.badges.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
            {data.badges.map((badge) => (
              <div key={badge.id} className="text-center p-3 border border-border rounded-sm bg-background">
                <Award className="w-8 h-8 text-orange mx-auto" />
                <p className="text-sm font-semibold mt-2">{badge.name}</p>
                <p className="text-xs text-muted mt-1">{badge.description}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted text-sm">Complete rides and trainings to earn badges!</p>
        )}
      </div>

      {/* Referral */}
      <div className="mt-8 bg-surface border border-orange/20 rounded-sm p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-heading text-lg font-semibold text-tan">Referral Program</h3>
            <p className="text-sm text-muted mt-1">Share your code and earn ₹200 credit for each friend who books a ride!</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted">Your Code</p>
            <p className="font-heading text-2xl font-bold text-orange tracking-wider">{data.user.referralCode || "—"}</p>
            <p className="text-xs text-muted mt-1">Credits: ₹{data.user.referralCredits}</p>
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Link href="/ride-journal" className="bg-surface border border-border rounded-sm p-4 text-center hover:border-orange transition-colors">
          <p className="font-heading text-sm font-semibold">Ride Journals</p>
        </Link>
        <Link href="/skill-assessment" className="bg-surface border border-border rounded-sm p-4 text-center hover:border-orange transition-colors">
          <p className="font-heading text-sm font-semibold">Skill Assessment</p>
        </Link>
        <Link href="/certificates" className="bg-surface border border-border rounded-sm p-4 text-center hover:border-orange transition-colors">
          <p className="font-heading text-sm font-semibold">Certificates</p>
        </Link>
        <Link href="/waiver" className="bg-surface border border-border rounded-sm p-4 text-center hover:border-orange transition-colors">
          <p className="font-heading text-sm font-semibold">Waiver</p>
        </Link>
      </div>
    </div>
  );
}
