import Link from "next/link";
import { MapPin, Calendar, Users, Mountain } from "lucide-react";
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
  slug, title, location, startDate, endDate, price,
  totalSlots, bookedSlots, difficulty, type, coverImage, featured,
}: RideCardProps) {
  const slotsText = getSlotsText(totalSlots, bookedSlots);
  const soldOut = totalSlots - bookedSlots <= 0;

  return (
    <Link href={`/rides/${slug}`} className="group block">
      <div className="relative bg-surface border border-border rounded-sm overflow-hidden hover:border-orange/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-orange/5">
        {/* Image */}
        <div className="relative h-52 sm:h-60 bg-surface-light overflow-hidden">
          {coverImage ? (
            <img
              src={coverImage}
              alt={title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted">
              <Mountain className="w-16 h-16 opacity-20" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

          {/* Badges */}
          <div className="absolute top-3 left-3 flex gap-2">
            <Badge variant={difficultyColors[difficulty] || "orange"}>{difficulty}</Badge>
            {featured && <Badge variant="tan">Featured</Badge>}
          </div>

          {/* Price */}
          <div className="absolute bottom-3 right-3">
            <span className="bg-orange text-white px-3 py-1.5 font-heading text-lg font-bold rounded-sm">
              {formatPrice(price)}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-3">
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
