"use client";

import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { AccountSidebar } from "@/components/layout/AccountSidebar";

const publicAuthPages = ["/login", "/signup", "/forgot-password", "/reset-password"];

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { status } = useSession();
  const showSidebar = status === "authenticated" && !publicAuthPages.includes(pathname);

  if (!showSidebar) {
    return (
      <>
        <Navbar />
        <main className="flex-1 pt-16 sm:pt-20">{children}</main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="pt-16 sm:pt-20 flex min-h-screen">
        <AccountSidebar />
        <main className="flex-1 min-w-0">{children}</main>
      </div>
      <Footer />
    </>
  );
}
