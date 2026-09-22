import Image from "next/image";
import { cn } from "@/lib/utils";

type Variant = "compact" | "full" | "mark";

interface LogoProps {
    variant?: Variant;
    className?: string;
    /** Set true for above-the-fold usage (e.g. navbar). */
    priority?: boolean;
    /** For screen readers */
    title?: string;
}

/**
 * DRC Motorsports mark. Uses the official raster logo designed for dark backgrounds
 * — drc-motorsports-on-tar.png — so it sits cleanly on the site's near-black surface
 * with no white box.
 *
 * - compact → nav bars
 * - full    → footer / hero blocks
 * - mark    → symbol-only
 */
export function Logo({ variant = "compact", className, priority, title = "DRC Motorsports" }: LogoProps) {
    const heightClass =
        variant === "mark" ? "h-8" : variant === "full" ? "h-20 sm:h-24" : "h-10 sm:h-12";

    return (
        <Image
            src="/brand/drc-motorsports-on-tar.png"
            alt={title}
            width={2528}
            height={1280}
            priority={priority}
            className={cn("w-auto object-contain", heightClass, className)}
        />
    );
}

