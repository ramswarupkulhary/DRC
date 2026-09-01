"use client";

import Link from "next/link";
import { MapPin, Phone, Mail } from "lucide-react";
import { useSession } from "next-auth/react";

export function Footer() {
  const { data: session } = useSession();
  return (
    <footer className="bg-surface border-t border-border mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div>
              <span className="font-heading text-3xl font-bold tracking-tight">
                <span className="text-foreground">D</span>
                <span className="text-orange">R</span>
                <span className="text-foreground">C</span>
              </span>
              <p className="text-[10px] text-tan tracking-[0.25em] uppercase mt-1">
                Dirt Ride Camp
              </p>
            </div>
            <p className="text-sm text-muted leading-relaxed">
              Ride &middot; Explore &middot; Connect
            </p>
            <p className="text-sm text-muted leading-relaxed">
              Off-road adventures, camping rides & dirt riding training across India.
            </p>
            <div className="flex gap-3 pt-2">
              <a
                href="https://instagram.com/dirtridecamp"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-surface-light hover:bg-orange text-foreground hover:text-white rounded-sm transition-all"
                aria-label="Instagram"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
              </a>
              <a
                href="https://wa.me/919414870102"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-surface-light hover:bg-success text-foreground hover:text-white rounded-sm transition-all"
              >
                <Phone className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-heading text-sm font-semibold text-tan tracking-wider mb-4">
              Quick Links
            </h4>
            <ul className="space-y-2">
              {[
                { href: "/programs", label: "Programs" },
                { href: "/rides", label: "Upcoming Rides" },
                { href: "/trainings", label: "Training Programs" },
                { href: "/off-road-training-bangalore", label: "Off-Road Training Bangalore" },
                { href: "/dirt-bike-classes-bangalore", label: "Dirt Bike Classes Bangalore" },
                { href: "/bike-trips-near-bangalore", label: "Bike Trips Near Bangalore" },
                { href: "/events", label: "Events & Races" },
                { href: "/calendar", label: "Calendar" },
                { href: "/store", label: "Merchandise" },
                { href: "/membership", label: "Membership" },
                { href: "/instructors", label: "Instructors" },
                { href: "/corporate", label: "Corporate" },
                { href: "/gallery", label: "Gallery" },
                { href: "/about", label: "Our Story" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted hover:text-orange transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* For Riders */}
          <div>
            <h4 className="font-heading text-sm font-semibold text-tan tracking-wider mb-4">
              For Riders
            </h4>
            <ul className="space-y-2">
              {(session
                ? [
                    { href: "/dashboard", label: "Rider Dashboard" },
                    { href: "/profile", label: "My Profile" },
                    { href: "/my-registrations", label: "My Registrations" },
                    { href: "/ride-journal", label: "Ride Journal" },
                    { href: "/gift-vouchers", label: "Gift Vouchers" },
                    { href: "/leaderboard", label: "Leaderboard" },
                  ]
                : [
                    { href: "/signup", label: "Join DRC" },
                    { href: "/login", label: "Rider Login" },
                    { href: "/leaderboard", label: "Leaderboard" },
                    { href: "/gift-vouchers", label: "Gift Vouchers" },
                    { href: "/blog", label: "Blog" },
                  ]
              ).map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted hover:text-orange transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-heading text-sm font-semibold text-tan tracking-wider mb-4">
              Get in Touch
            </h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-2 text-sm text-muted">
                <MapPin className="w-4 h-4 text-orange mt-0.5 shrink-0" />
                <span>Bangalore, Karnataka, India</span>
              </li>
              <li className="flex items-center gap-2 text-sm text-muted">
                <Phone className="w-4 h-4 text-orange shrink-0" />
                <a href="tel:+919414870102" className="hover:text-orange transition-colors">
                  +91 94148 70102
                </a>
              </li>
              <li className="flex items-center gap-2 text-sm text-muted">
                <Mail className="w-4 h-4 text-orange shrink-0" />
                <a href="mailto:info@dirtridecamp.com" className="hover:text-orange transition-colors">
                  info@dirtridecamp.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted">
            &copy; {new Date().getFullYear()} Dirt Ride Camp. All rights reserved.
          </p>
          <div className="flex gap-4 text-xs text-muted">
            <Link href="/contact" className="hover:text-orange transition-colors">
              Privacy Policy
            </Link>
            <Link href="/contact" className="hover:text-orange transition-colors">
              Terms & Conditions
            </Link>
            <Link href="/contact" className="hover:text-orange transition-colors">
              Cancellation Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
