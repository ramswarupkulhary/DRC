"use client";

import { motion } from "framer-motion";
import { Mountain, ArrowUp, ArrowDown, MapPin } from "lucide-react";

interface TrailMapProps {
  difficulty: string;
  location: string;
  type: string;
}

const trailProfiles: Record<string, { points: number[]; maxElev: number; minElev: number; distance: string; terrain: string[] }> = {
  easy: {
    points: [30, 35, 40, 38, 42, 45, 43, 40, 38, 35, 33, 30, 32, 35, 38, 40, 37, 34, 30, 28],
    maxElev: 950,
    minElev: 750,
    distance: "35 km",
    terrain: ["Gravel Roads", "Farm Tracks", "Gentle Hills"],
  },
  moderate: {
    points: [20, 30, 45, 55, 40, 50, 65, 55, 45, 60, 70, 55, 45, 50, 60, 45, 35, 40, 30, 25],
    maxElev: 1200,
    minElev: 650,
    distance: "55 km",
    terrain: ["Rocky Trails", "Forest Paths", "Stream Crossings", "Moderate Climbs"],
  },
  hard: {
    points: [15, 35, 60, 45, 70, 85, 65, 50, 75, 90, 70, 55, 80, 60, 45, 65, 75, 50, 30, 20],
    maxElev: 1500,
    minElev: 500,
    distance: "75 km",
    terrain: ["Technical Singletrack", "Boulder Sections", "Steep Climbs", "River Crossings", "Loose Gravel"],
  },
  extreme: {
    points: [10, 40, 70, 30, 80, 95, 50, 85, 40, 90, 65, 95, 45, 75, 90, 55, 80, 35, 60, 15],
    maxElev: 1800,
    minElev: 400,
    distance: "90 km",
    terrain: ["Extreme Rock Gardens", "Deep Water Crossings", "Near-vertical Climbs", "Dense Forest Trail", "Mud Sections"],
  },
};

export function TrailMap({ difficulty, location, type }: TrailMapProps) {
  const profile = trailProfiles[difficulty] || trailProfiles.moderate;
  const points = profile.points;
  const maxVal = Math.max(...points);

  const svgPoints = points.map((p, i) => {
    const x = (i / (points.length - 1)) * 100;
    const y = 100 - (p / maxVal) * 80 - 10;
    return `${x},${y}`;
  }).join(" ");

  const areaPoints = `0,100 ${svgPoints} 100,100`;

  const difficultyColor = {
    easy: "#22c55e",
    moderate: "#E8622C",
    hard: "#ef4444",
    extreme: "#dc2626",
  }[difficulty] || "#E8622C";

  return (
    <div className="bg-surface border border-border rounded-sm overflow-hidden">
      <div className="p-4 border-b border-border flex items-center gap-2">
        <Mountain className="w-5 h-5 text-orange" />
        <span className="font-heading text-sm font-semibold uppercase tracking-wider">Elevation Profile</span>
      </div>

      <div className="p-4">
        <div className="relative h-48 bg-surface-light rounded-sm overflow-hidden">
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full">
            <defs>
              <linearGradient id={`grad-${difficulty}`} x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor={difficultyColor} stopOpacity="0.3" />
                <stop offset="100%" stopColor={difficultyColor} stopOpacity="0.05" />
              </linearGradient>
            </defs>
            <motion.polygon
              points={areaPoints}
              fill={`url(#grad-${difficulty})`}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1 }}
            />
            <motion.polyline
              points={svgPoints}
              fill="none"
              stroke={difficultyColor}
              strokeWidth="1.5"
              vectorEffect="non-scaling-stroke"
              initial={{ pathLength: 0, opacity: 0 }}
              whileInView={{ pathLength: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 2, ease: "easeOut" }}
            />
          </svg>

          <div className="absolute top-2 left-3 text-xs text-muted">{profile.maxElev}m</div>
          <div className="absolute bottom-2 left-3 text-xs text-muted">{profile.minElev}m</div>
          <div className="absolute bottom-2 right-3 text-xs text-muted">{profile.distance}</div>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="flex items-center justify-center gap-1 text-orange">
              <ArrowUp className="w-4 h-4" />
              <span className="text-sm font-semibold">{profile.maxElev}m</span>
            </div>
            <p className="text-xs text-muted mt-0.5">Max Elevation</p>
          </div>
          <div>
            <div className="flex items-center justify-center gap-1 text-orange">
              <MapPin className="w-4 h-4" />
              <span className="text-sm font-semibold">{profile.distance}</span>
            </div>
            <p className="text-xs text-muted mt-0.5">Total Distance</p>
          </div>
          <div>
            <div className="flex items-center justify-center gap-1 text-orange">
              <ArrowDown className="w-4 h-4" />
              <span className="text-sm font-semibold">{profile.maxElev - profile.minElev}m</span>
            </div>
            <p className="text-xs text-muted mt-0.5">Elevation Gain</p>
          </div>
        </div>

        <div className="mt-4">
          <p className="text-xs text-muted uppercase tracking-wider mb-2">Terrain Types</p>
          <div className="flex flex-wrap gap-1.5">
            {profile.terrain.map((t) => (
              <span key={t} className="text-xs px-2 py-1 bg-surface-light border border-border rounded-full text-foreground/70">
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
