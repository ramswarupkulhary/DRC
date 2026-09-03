import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, Bike, GraduationCap, Users, Settings, LogOut, Star, Image as ImageIcon, Mail, Trophy, UserCheck, Building2, Tag, Calendar, FileText, Crown, ShoppingBag, History, MapPinned, Bike as BikeIcon } from "lucide-react";
import { AdminMobileNav } from "@/components/admin/AdminMobileNav";

const sidebarLinks = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/rides", label: "Rides", icon: Bike },
  { href: "/admin/past-rides", label: "Past Rides", icon: History },
  { href: "/admin/trainings", label: "Trainings & Trails", icon: GraduationCap },
  { href: "/admin/bikes", label: "Rental Bikes", icon: BikeIcon },
  { href: "/admin/program-bookings", label: "Program Bookings", icon: MapPinned },
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

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login?redirect=/admin/dashboard");
  }

  const role = (session.user as { role?: string }).role;
  if (role !== "admin" && role !== "coordinator") {
    redirect("/");
  }

  return (
    <div className="min-h-screen flex bg-background">
      {/* Sidebar */}
      <aside className="w-64 bg-surface border-r border-border flex flex-col shrink-0 hidden lg:flex">
        <div className="p-6 border-b border-border">
          <Link href="/admin/dashboard" className="flex items-center gap-2">
            <span className="font-heading text-2xl font-bold">
              <span className="text-foreground">D</span>
              <span className="text-orange">R</span>
              <span className="text-foreground">C</span>
            </span>
            <span className="text-xs text-muted uppercase tracking-wider">Admin</span>
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {sidebarLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-sm text-sm text-foreground/70 hover:bg-surface-light hover:text-orange transition-colors"
            >
              <link.icon className="w-4 h-4" />
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-border">
          <div className="text-sm text-muted truncate">{session.user.email}</div>
          <Link href="/" className="flex items-center gap-2 mt-3 text-sm text-muted hover:text-orange transition-colors">
            <LogOut className="w-4 h-4" />
            Back to Site
          </Link>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile header */}
        <header className="lg:hidden bg-surface border-b border-border px-4 py-3 flex items-center justify-between">
          <span className="font-heading text-xl font-bold">
            <span className="text-foreground">D</span>
            <span className="text-orange">R</span>
            <span className="text-foreground">C</span>
            <span className="text-xs text-muted ml-2">Admin</span>
          </span>
          <div className="flex items-center gap-3">
            <Link href="/" className="text-sm text-muted hover:text-orange">
              Site
            </Link>
          </div>
        </header>

        {/* Mobile nav - collapsible grid */}
        <AdminMobileNav />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
