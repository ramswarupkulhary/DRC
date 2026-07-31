import { cn } from "@/lib/utils";

type Variant = "orange" | "tan" | "success" | "error" | "warning" | "muted";

const variants: Record<Variant, string> = {
  orange: "bg-orange/20 text-orange border-orange/30",
  tan: "bg-tan/20 text-tan border-tan/30",
  success: "bg-success/20 text-success border-success/30",
  error: "bg-error/20 text-error border-error/30",
  warning: "bg-warning/20 text-warning border-warning/30",
  muted: "bg-surface-light text-muted border-border",
};

interface BadgeProps {
  variant?: Variant;
  children: React.ReactNode;
  className?: string;
}

export function Badge({ variant = "orange", children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-sm text-xs font-semibold uppercase tracking-wider border",
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
