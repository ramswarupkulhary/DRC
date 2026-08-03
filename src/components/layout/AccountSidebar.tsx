"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  User,
  Bell,
  FileText,
  BookOpen,
  Trophy,
  Crown,
  Award,
  Brain,
  Images,
} from "lucide-react";
import { cn } from "@/lib/utils";

const sidebarLinks = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/my-registrations", label: "My Registrations", icon: FileText },
  { href: "/my-gallery", label: "My Gallery", icon: Images },
  { href: "/notifications", label: "Notifications", icon: Bell },
  { href: "/ride-journal", label: "Ride Journal", icon: BookOpen },
  { href: "/skill-assessment", label: "Skill Assessment", icon: Brain },
  { href: "/membership", label: "Membership", icon: Crown },
  { href: "/certificates", label: "Certificates", icon: Award },
  { href: "/leaderboard", label: "Leaderboard", icon: Trophy },
  { href: "/profile", label: "My Profile", icon: User },
];

export function AccountSidebar() {
  const pathname = usePathname();

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:block w-60 shrink-0 border-r border-border bg-surface/50 min-h-[calc(100vh-4rem)]">
        <nav className="sticky top-20 py-6 px-3 space-y-1">
          <p className="px-3 mb-4 text-xs font-semibold text-muted uppercase tracking-wider">
            Account
          </p>
          {sidebarLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 text-sm rounded-sm transition-colors",
                  isActive
                    ? "bg-orange/10 text-orange font-medium"
                    : "text-foreground/70 hover:text-foreground hover:bg-surface-light"
                )}
              >
                <link.icon className={cn("w-4 h-4", isActive && "text-orange")} />
                {link.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Mobile horizontal nav */}
      <div className="md:hidden overflow-x-auto border-b border-border bg-surface/50 px-4 py-2">
        <div className="flex gap-1 min-w-max">
          {sidebarLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-2 text-xs rounded-sm whitespace-nowrap transition-colors",
                  isActive
                    ? "bg-orange/10 text-orange font-medium"
                    : "text-foreground/70 hover:text-foreground hover:bg-surface-light"
                )}
              >
                <link.icon className="w-3.5 h-3.5" />
                {link.label}
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
}
