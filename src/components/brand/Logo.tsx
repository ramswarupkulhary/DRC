import { cn } from "@/lib/utils";

type Variant = "compact" | "full" | "mark";

interface LogoProps {
  variant?: Variant;
  className?: string;
  /** For screen readers */
  title?: string;
}

/**
 * DRC Motorsports wordmark rendered as inline text so it inherits font loading,
 * theme colors and scales cleanly on any background — no baked-in white boxes.
 *
 * - compact  → for nav bars: "D R C" only, with orange R.
 * - full     → for footers/hero: "DRC" + "MOTORSPORTS" underneath with orange slashes.
 * - mark     → just the R monogram in a rule (for favicons rendered by ImageResponse).
 */
export function Logo({ variant = "compact", className, title = "DRC Motorsports" }: LogoProps) {
  if (variant === "mark") {
    return (
      <span
        aria-label={title}
        className={cn(
          "inline-flex items-center justify-center font-heading font-bold leading-none select-none",
          className
        )}
      >
        <span className="text-orange">R</span>
      </span>
    );
  }

  if (variant === "compact") {
    return (
      <span
        aria-label={title}
        className={cn(
          "inline-flex flex-col items-start leading-none select-none",
          className
        )}
      >
        <span className="font-heading font-bold tracking-tight text-[1em]">
          <span className="text-foreground">D</span>
          <span className="text-orange italic">R</span>
          <span className="text-foreground">C</span>
        </span>
        <span className="font-mono text-[0.28em] tracking-[0.32em] uppercase text-tan-dark mt-[0.35em] flex items-center gap-[0.4em]">
          <span className="text-orange">//</span>
          <span>Motorsports</span>
        </span>
      </span>
    );
  }

  // full
  return (
    <span
      aria-label={title}
      className={cn(
        "inline-flex flex-col items-start leading-none select-none",
        className
      )}
    >
      <span className="font-heading font-bold tracking-tight text-[1em] leading-[0.9]">
        <span className="text-foreground">D</span>
        <span className="text-orange italic">R</span>
        <span className="text-foreground">C</span>
      </span>
      <span className="mt-[0.4em] flex items-center gap-[0.5em] font-mono text-[0.22em] tracking-[0.42em] uppercase text-foreground">
        <span className="text-orange">//</span>
        <span>Motorsports</span>
      </span>
      <span className="mt-[0.55em] font-mono text-[0.14em] tracking-[0.32em] uppercase text-tan-dark">
        Adventure isn&rsquo;t found. It&rsquo;s earned.
      </span>
    </span>
  );
}
