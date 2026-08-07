"use client";

import { useState } from "react";
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
  Gift,
  Shield,
  Menu,
  X,
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
  { href: "/skill-passport", label: "Skill Passport", icon: Shield },
  { href: "/referrals", label: "Refer & Earn", icon: Gift },
  { href: "/leaderboard", label: "Leaderboard", icon: Trophy },
  { href: "/profile", label: "My Profile", icon: User },
];

export function AccountSidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const currentPage = sidebarLinks.find((l) => l.href === pathname);

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

      {/* Mobile collapsible nav */}
      <div className="md:hidden sticky top-16 z-30">
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="w-full flex items-center justify-between px-4 py-3 bg-surface border-b border-border text-sm"
        >
          <span className="flex items-center gap-2 text-foreground/80">
            {currentPage && <currentPage.icon className="w-4 h-4 text-orange" />}
            <span className="font-medium">{currentPage?.label || "Account"}</span>
          </span>
          {mobileOpen ? <X className="w-4 h-4 text-muted" /> : <Menu className="w-4 h-4 text-muted" />}
        </button>

        {mobileOpen && (
          <nav className="bg-surface border-b border-border px-2 py-2 grid grid-cols-2 gap-1">
            {sidebarLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
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
    </>
  );
}
