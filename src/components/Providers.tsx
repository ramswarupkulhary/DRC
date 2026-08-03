"use client";

import { SessionProvider } from "next-auth/react";
import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

function RefreshRedirect() {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const exempt = ["/", "/login", "/register", "/forgot-password", "/signup"];
    if (exempt.includes(pathname)) return;
    if (pathname.startsWith("/api") || pathname.startsWith("/_next") || pathname.startsWith("/admin")) return;

    const entries = performance.getEntriesByType("navigation") as PerformanceNavigationTiming[];
    if (entries.length === 0) return;

    const navEntry = entries[0];
    const navType = navEntry.type;

    if (navType === "reload") {
      router.replace("/");
      return;
    }

    if (navType === "navigate") {
      const loadedPath = new URL(navEntry.name).pathname;
      if (loadedPath === pathname) {
        router.replace("/");
      }
    }
  }, [pathname, router]);

  return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <RefreshRedirect />
      {children}
    </SessionProvider>
  );
}
