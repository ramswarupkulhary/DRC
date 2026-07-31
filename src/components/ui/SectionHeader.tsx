import { cn } from "@/lib/utils";

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  accent?: string;
  className?: string;
  align?: "left" | "center";
}

export function SectionHeader({ title, subtitle, accent, className, align = "center" }: SectionHeaderProps) {
  return (
    <div className={cn("space-y-3", align === "center" && "text-center", className)}>
      {accent && (
        <span className="text-orange text-sm font-semibold tracking-[0.3em] uppercase">{accent}</span>
      )}
      <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground">
        {title}
      </h2>
      {subtitle && (
        <p className="text-muted text-base sm:text-lg max-w-2xl mx-auto">{subtitle}</p>
      )}
      <div
        className={cn(
          "w-20 h-1 bg-orange rounded-full mt-4",
          align === "center" && "mx-auto"
        )}
      />
    </div>
  );
}
