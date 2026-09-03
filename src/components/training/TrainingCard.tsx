import Link from "next/link";
import Image from "next/image";
import { Clock, BarChart3, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatPrice } from "@/lib/utils";

interface TrainingCardProps {
  slug: string;
  title: string;
  shortDesc?: string;
  level: string;
  badge?: string;
  duration?: string;
  price: number;
  location?: string;
  coverImage?: string;
  featured?: boolean;
}

const levelColors: Record<string, "success" | "warning" | "orange" | "error"> = {
  beginner: "success",
  intermediate: "warning",
  advanced: "orange",
  all: "tan" as "success", // fallback
};

export function TrainingCard({
  slug, title, shortDesc, level, badge, duration, price, location, coverImage, featured,
}: TrainingCardProps) {
  return (
    <Link href={`/trainings/${slug}`} className="group block">
      <div className="relative bg-surface border border-border rounded-sm overflow-hidden hover:border-orange/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-orange/5 h-full flex flex-col">
        <div className="relative bg-surface-light overflow-hidden">
          {coverImage ? (
            <Image src={coverImage} alt={title} width={640} height={420} sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" className="w-full h-auto block group-hover:scale-105 transition-transform duration-500" />
          ) : (
            <div className="w-full h-48 flex items-center justify-center text-muted">
              <BarChart3 className="w-16 h-16 opacity-20" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute top-3 left-3 flex gap-2">
            <Badge variant={badge ? "orange" : (levelColors[level] || "orange")}>{badge || level}</Badge>
            {featured && <Badge variant="tan">Popular</Badge>}
          </div>
        </div>

        <div className="p-4 space-y-3 flex-1 flex flex-col">
          <h3 className="font-heading text-lg font-semibold text-foreground group-hover:text-orange transition-colors">
            {title}
          </h3>
          {shortDesc && <p className="text-sm text-muted line-clamp-2 flex-1">{shortDesc}</p>}

          <div className="flex items-center gap-4 text-sm text-muted">
            {duration && (
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-orange" />
                <span>{duration}</span>
              </div>
            )}
            {location && (
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-orange" />
                <span>{location}</span>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-border">
            <span className="font-heading text-xl font-bold text-orange">{formatPrice(price)}</span>
            <Button size="sm">Enroll</Button>
          </div>
        </div>
      </div>
    </Link>
  );
}
