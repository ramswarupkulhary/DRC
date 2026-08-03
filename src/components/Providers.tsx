"use client";

import { SessionProvider } from "next-auth/react";
import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

function RefreshRedirect() {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const exempt = ["/", "/login", "/register", "/forgot-password", "/signup"];
    if (exempt.includes(pathname)) {
      sessionStorage.setItem("drc-active", "1");
      return;
    }
    if (pathname.startsWith("/api") || pathname.startsWith("/_next")) return;

    const entries = performance.getEntriesByType("navigation") as PerformanceNavigationTiming[];
    if (entries.length > 0) {
      const navType = entries[0].type;
      if (navType === "reload" || navType === "navigate") {
        if (!sessionStorage.getItem("drc-active")) {
          router.replace("/");
          return;
        }
      }
    }
    sessionStorage.setItem("drc-active", "1");
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
