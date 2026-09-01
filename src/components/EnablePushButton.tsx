"use client";

import { useEffect, useState } from "react";
import { Bell } from "lucide-react";

function urlBase64ToUint8Array(base64String: string) {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
    const raw = atob(base64);
    const output = new Uint8Array(raw.length);
    for (let i = 0; i < raw.length; i++) output[i] = raw.charCodeAt(i);
    return output;
}

/** Lets a logged-in rider opt into push notifications (only shows when configured). */
export function EnablePushButton() {
    const vapid = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    const [state, setState] = useState<"idle" | "loading" | "enabled" | "unsupported">("idle");

    useEffect(() => {
        if (typeof window === "undefined" || !("serviceWorker" in navigator) || !("PushManager" in window) || !vapid) {
            setState("unsupported");
            return;
        }
        if (Notification.permission === "granted") setState("enabled");
    }, [vapid]);

    if (state === "unsupported" || !vapid) return null;

    async function enable() {
        setState("loading");
        try {
            const perm = Notification.permission === "granted" ? "granted" : await Notification.requestPermission();
            if (perm !== "granted") {
                setState("idle");
                return;
            }
            const reg = await navigator.serviceWorker.ready;
            const sub = await reg.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(vapid!),
            });
            await fetch("/api/push/subscribe", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(sub),
            });
            setState("enabled");
        } catch {
            setState("idle");
        }
    }

    return (
        <button
            onClick={enable}
            disabled={state === "enabled" || state === "loading"}
            className="inline-flex items-center gap-2 text-sm border border-border rounded-sm px-4 py-2 hover:border-orange/50 transition-colors disabled:opacity-60"
        >
            <Bell className="w-4 h-4 text-orange" />
            {state === "enabled" ? "Notifications On" : state === "loading" ? "Enabling…" : "Enable Notifications"}
        </button>
    );
}
