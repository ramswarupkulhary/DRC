"use client";

import { useEffect } from "react";

/** Registers the service worker for offline support + push delivery. */
export function PWA() {
    useEffect(() => {
        if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;
        const onLoad = () => {
            navigator.serviceWorker.register("/sw.js").catch(() => { });
        };
        if (document.readyState === "complete") onLoad();
        else window.addEventListener("load", onLoad, { once: true });
    }, []);

    return null;
}
