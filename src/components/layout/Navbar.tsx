"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { Menu, X, User, LogOut, ChevronDown, Crown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { motion, AnimatePresence } from "framer-motion";
import { useSession, signOut } from "next-auth/react";
import { NotificationBell } from "@/components/ui/NotificationBell";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/rides", label: "Rides" },
  { href: "/trainings", label: "Training" },
  { href: "/events", label: "Events" },
  { href: "/calendar", label: "Calendar" },
  { href: "/store", label: "Store" },
  { href: "/blog", label: "Blog" },
  { href: "/leaderboard", label: "Leaderboard" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

const userMenuLinks = [
  { href: "/profile", label: "My Profile", icon: User },
];

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { data: session } = useSession();
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    handler();
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    if (userMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [userMenuOpen]);

  const userName = session?.user?.name || "Rider";
  const userEmail = session?.user?.email || "";
  const userRole = (session?.user as { role?: string } | undefined)?.role || "rider";
  const isMember = (session?.user as { isMember?: boolean } | undefined)?.isMember || false;
  const userInitials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: [0.25, 0.4, 0.25, 1] }}
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled
          ? "bg-background/95 backdrop-blur-md border-b border-border shadow-lg shadow-black/20"
          : "bg-background/80 backdrop-blur-sm border-b border-transparent"
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={cn("flex items-center justify-between transition-all duration-300", scrolled ? "h-16" : "h-16 sm:h-20")}>
          <Link href="/" className="flex items-center gap-3 shrink-0">
            <div className="flex flex-col">
              <span className="font-heading text-2xl sm:text-3xl font-bold tracking-tight leading-none">
                <span className="text-foreground">D</span>
                <span className="text-orange">R</span>
                <span className="text-foreground">C</span>
              </span>
              <span className="text-[9px] sm:text-[10px] text-tan tracking-[0.25em] uppercase">
                Dirt Ride Camp
              </span>
            </div>
          </Link>

          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-3 py-2 text-sm font-medium text-foreground/80 hover:text-orange transition-colors uppercase tracking-wider relative group"
              >
                {link.label}
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-orange transition-all duration-300 group-hover:w-full" />
              </Link>
            ))}
          </div>

          <div className="hidden lg:flex items-center gap-3">
            {session ? (
              <>
                <NotificationBell />
                <Link href="/membership">
                  <Button variant={isMember ? "ghost" : "outline"} size="sm" className={isMember ? "text-orange border-orange/30 bg-orange/10 hover:bg-orange/20" : ""}>
                    <Crown className="w-4 h-4 mr-1.5" />
                    {isMember ? "Member" : "Membership"}
                  </Button>
                </Link>
                <div ref={userMenuRef} className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 px-2 py-1.5 rounded-sm hover:bg-surface-light transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-orange flex items-center justify-center text-white text-xs font-bold relative">
                      {session.user?.image ? (
                        <img src={session.user.image} alt={userName} className="w-full h-full rounded-full object-cover" />
                      ) : (
                        userInitials
                      )}
                      {isMember && (
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-orange rounded-full flex items-center justify-center border-2 border-background">
                          <Crown className="w-2.5 h-2.5 text-white" />
                        </div>
                      )}
                    </div>
                    <div className="text-left hidden xl:block">
                      <p className="text-sm font-medium text-foreground leading-tight">{userInitials}</p>
                    </div>
                    <ChevronDown className={cn("w-4 h-4 text-muted transition-transform", userMenuOpen && "rotate-180")} />
                  </button>

                  <AnimatePresence>
                    {userMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.96 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 top-full mt-2 w-64 bg-surface border border-border rounded-sm shadow-xl shadow-black/30 overflow-hidden"
                      >
                        <div className="px-4 py-3 border-b border-border">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-orange flex items-center justify-center text-white text-sm font-bold shrink-0 relative">
                              {session.user?.image ? (
                                <img src={session.user.image} alt={userName} className="w-full h-full rounded-full object-cover" />
                              ) : (
                                userInitials
                              )}
                              {isMember && (
                                <div className="absolute -top-1 -right-1 w-4 h-4 bg-orange rounded-full flex items-center justify-center border-2 border-surface">
                                  <Crown className="w-2.5 h-2.5 text-white" />
                                </div>
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-foreground truncate">{userName}</p>
                              <p className="text-xs text-muted truncate">{userEmail}</p>
                            </div>
                          </div>
                          <div className="mt-2">
                            <span className="inline-block text-[10px] px-2 py-0.5 bg-orange/15 text-orange rounded-full uppercase tracking-wider font-semibold">
                              {userRole}
                            </span>
                          </div>
                        </div>

                        <div className="py-1">
                          {userMenuLinks.map((link) => (
                            <Link
                              key={link.href}
                              href={link.href}
                              onClick={() => setUserMenuOpen(false)}
                              className="flex items-center gap-3 px-4 py-2.5 text-sm text-foreground/80 hover:text-orange hover:bg-surface-light transition-colors"
                            >
                              <link.icon className="w-4 h-4" />
                              {link.label}
                            </Link>
                          ))}
                        </div>

                        <div className="border-t border-border py-1">
                          <button
                            onClick={() => {
                              setUserMenuOpen(false);
                              signOut({ callbackUrl: "/" });
                            }}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-error/80 hover:text-error hover:bg-error/5 transition-colors w-full"
                          >
                            <LogOut className="w-4 h-4" />
                            Log Out
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="outline" size="sm">
                    Login
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button variant="ghost" size="sm">
                    Sign Up
                  </Button>
                </Link>
              </>
            )}
            <Link href="/rides">
              <Button size="sm">Book a Ride</Button>
            </Link>
          </div>

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden p-2 text-foreground hover:text-orange transition-colors"
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.25, 0.4, 0.25, 1] }}
            className="lg:hidden overflow-y-auto max-h-[calc(100vh-4rem)] bg-surface border-t border-border"
          >
            <div className="px-4 py-4 space-y-1">
              {navLinks.map((link, i) => (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05, duration: 0.3 }}
                >
                  <Link
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className="block px-3 py-2.5 text-sm font-medium text-foreground/80 hover:text-orange hover:bg-surface-light rounded-sm transition-colors uppercase tracking-wider"
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="pt-3 border-t border-border"
              >
                {session ? (
                  <div className="space-y-1">
                    <div className="flex items-center gap-3 px-3 py-3 mb-2">
                      <div className="w-10 h-10 rounded-full bg-orange flex items-center justify-center text-white text-sm font-bold shrink-0 relative">
                        {session.user?.image ? (
                          <img src={session.user.image} alt={userName} className="w-full h-full rounded-full object-cover" />
                        ) : (
                          userInitials
                        )}
                        {isMember && (
                          <div className="absolute -top-1 -right-1 w-4 h-4 bg-orange rounded-full flex items-center justify-center border-2 border-surface">
                            <Crown className="w-2.5 h-2.5 text-white" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-foreground truncate">{userName}</p>
                        <p className="text-xs text-muted truncate">{userEmail}</p>
                        <span className="inline-block text-[10px] px-2 py-0.5 bg-orange/15 text-orange rounded-full uppercase tracking-wider font-semibold mt-1">
                          {userRole}
                        </span>
                      </div>
                    </div>

                    <Link
                      href="/profile"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-3 px-3 py-2.5 text-sm text-foreground/80 hover:text-orange hover:bg-surface-light rounded-sm transition-colors"
                    >
                      <User className="w-4 h-4" />
                      My Profile
                    </Link>

                    <button
                      onClick={() => {
                        setMobileOpen(false);
                        signOut({ callbackUrl: "/" });
                      }}
                      className="flex items-center gap-3 px-3 py-2.5 text-sm text-error/80 hover:text-error hover:bg-error/5 rounded-sm transition-colors w-full mt-2"
                    >
                      <LogOut className="w-4 h-4" />
                      Log Out
                    </button>

                    <Link href="/rides" onClick={() => setMobileOpen(false)} className="block mt-3">
                      <Button size="sm" className="w-full">Book a Ride</Button>
                    </Link>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    <Link href="/login" onClick={() => setMobileOpen(false)}>
                      <Button variant="outline" size="sm" className="w-full">Login</Button>
                    </Link>
                    <Link href="/signup" onClick={() => setMobileOpen(false)}>
                      <Button variant="ghost" size="sm" className="w-full">Sign Up</Button>
                    </Link>
                    <Link href="/rides" onClick={() => setMobileOpen(false)}>
                      <Button size="sm" className="w-full">Book a Ride</Button>
                    </Link>
                  </div>
                )}
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
