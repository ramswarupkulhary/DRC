import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ScrollToTop } from "@/components/ui/ScrollToTop";
import { prisma } from "@/lib/prisma";

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const upcomingRideCount = await prisma.ride.count({
    where: { status: "published", startDate: { gte: new Date() } },
  }).catch(() => 0);

  return (
    <>
      <Navbar hasUpcomingRides={upcomingRideCount > 0} />
      <main className="flex-1 pt-16 sm:pt-20">{children}</main>
      <Footer />
      <ScrollToTop />
    </>
  );
}
