import Link from "next/link";
import Image from "next/image";
import { MapPin, Calendar, Users, Mountain, Clock } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatPrice, formatDateRange, getSlotsText } from "@/lib/utils";

interface RideCardProps {
  slug: string;
  title: string;
  location: string;
  startDate?: string | null;
  endDate?: string | null;
  price: number;
  earlyBirdPrice?: number | null;
  earlyBirdDeadline?: string | null;
  totalSlots: number;
  bookedSlots: number;
  difficulty: string;
  type: string;
  coverImage?: string;
  featured?: boolean;
}

const difficultyColors: Record<string, "success" | "orange" | "error" | "warning"> = {
  easy: "success",
  moderate: "warning",
  hard: "orange",
  extreme: "error",
};

export function RideCard({
  slug, title, location, startDate, endDate, price, earlyBirdPrice, earlyBirdDeadline,
  totalSlots, bookedSlots, difficulty, type, coverImage, featured,
}: RideCardProps) {
  const slotsText = getSlotsText(totalSlots, bookedSlots);
  const soldOut = totalSlots - bookedSlots <= 0;
  const earlyBirdActive = earlyBirdPrice && earlyBirdDeadline && new Date(earlyBirdDeadline) > new Date();

  return (
    <Link href={`/rides/${slug}`} className="group block">
      <div className="relative bg-surface border border-border rounded-sm overflow-hidden hover:border-orange/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-orange/5">
        {/* Image */}
        <div className="relative bg-surface-light overflow-hidden">
          {coverImage ? (
            <Image
              src={coverImage}
              alt={title}
              width={640}
              height={420}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="w-full h-auto block group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-52 flex items-center justify-center text-muted">
              <Mountain className="w-16 h-16 opacity-20" />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4 space-y-3">
          {/* Badges + Price row */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex gap-2">
              <Badge variant={difficultyColors[difficulty] || "orange"}>{difficulty}</Badge>
              {featured && <Badge variant="tan">Featured</Badge>}
            </div>
            <span className="bg-orange text-white px-3 py-1 font-heading text-lg font-bold rounded-sm">
              {earlyBirdActive ? formatPrice(earlyBirdPrice) : formatPrice(price)}
            </span>
          </div>

          {earlyBirdActive && (
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted line-through">{formatPrice(price)}</span>
              <span className="text-success font-medium flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Early bird till {new Date(earlyBirdDeadline).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
              </span>
            </div>
          )}

          <h3 className="font-heading text-xl font-semibold text-foreground group-hover:text-orange transition-colors line-clamp-1">
            {title}
          </h3>

          <div className="flex flex-col gap-1.5 text-sm text-muted">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-orange shrink-0" />
              <span className="line-clamp-1">{location}</span>
            </div>
            {startDate && (
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-orange shrink-0" />
                <span>{formatDateRange(startDate, endDate || startDate)}</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-orange shrink-0" />
              <span className={soldOut ? "text-error font-semibold" : totalSlots - bookedSlots <= 3 ? "text-orange font-semibold" : ""}>
                {slotsText}
              </span>
            </div>
          </div>

          <Button variant={soldOut ? "secondary" : "primary"} size="sm" className="w-full mt-2" disabled={soldOut}>
            {soldOut ? "Sold Out" : "Register Now"}
          </Button>
        </div>
      </div>
    </Link>
  );
}
