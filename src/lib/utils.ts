import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

export function formatDateRange(start: Date | string, end: Date | string): string {
  const s = new Date(start);
  const e = new Date(end);
  const startStr = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short" }).format(s);
  const endStr = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric" }).format(e);
  return `${startStr} – ${endStr}`;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function getSlotsText(total: number, booked: number): string {
  const remaining = total - booked;
  if (remaining <= 0) return "Sold Out";
  if (remaining <= 3) return `Only ${remaining} slot${remaining > 1 ? "s" : ""} left!`;
  return `${remaining} of ${total} slots available`;
}
