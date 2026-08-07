"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface NavLink {
  href: string;
  label: string;
  icon: LucideIcon;
}

export function AdminMobileNav({ links }: { links: NavLink[] }) {
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
          {links.map((link) => {
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
