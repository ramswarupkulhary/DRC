"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, LayoutDashboard, Bike, GraduationCap, Users, Settings, Star, Image as ImageIcon, Mail, Trophy, UserCheck, Building2, Tag, Calendar, FileText, Crown, ShoppingBag, History } from "lucide-react";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

const sidebarLinks: { href: string; label: string; icon: LucideIcon }[] = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/rides", label: "Rides", icon: Bike },
  { href: "/admin/past-rides", label: "Past Rides", icon: History },
  { href: "/admin/trainings", label: "Trainings", icon: GraduationCap },
  { href: "/admin/events", label: "Events", icon: Trophy },
  { href: "/admin/blog", label: "Blog", icon: FileText },
  { href: "/admin/riders", label: "Riders", icon: Users },
  { href: "/admin/memberships", label: "Memberships", icon: Crown },
  { href: "/admin/instructors", label: "Instructors", icon: UserCheck },
  { href: "/admin/reviews", label: "Reviews", icon: Star },
  { href: "/admin/gallery", label: "Gallery", icon: ImageIcon },
  { href: "/admin/messages", label: "Messages", icon: Mail },
  { href: "/admin/corporate", label: "Corporate", icon: Building2 },
  { href: "/admin/coupons", label: "Coupons", icon: Tag },
  { href: "/admin/store", label: "Store", icon: ShoppingBag },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export function AdminMobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="lg:hidden">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-2 text-sm text-foreground/70 hover:text-orange transition-colors"
      >
        {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        <span>Menu</span>
      </button>

      {open && (
        <nav className="bg-surface border-b border-border px-2 py-2 grid grid-cols-2 gap-1">
          {sidebarLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-2 px-3 py-2.5 rounded-sm text-xs transition-colors",
                  isActive
                    ? "bg-orange/10 text-orange font-medium"
                    : "text-foreground/70 hover:bg-surface-light hover:text-orange"
                )}
              >
                <link.icon className={cn("w-3.5 h-3.5 shrink-0", isActive && "text-orange")} />
                {link.label}
              </Link>
            );
          })}
        </nav>
      )}
    </div>
  );
}
