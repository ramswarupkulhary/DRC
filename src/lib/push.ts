import webpush from "web-push";
import { prisma } from "@/lib/prisma";

let configured = false;

function ensureConfigured(): boolean {
    if (configured) return true;
    const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    const privateKey = process.env.VAPID_PRIVATE_KEY;
    if (!publicKey || !privateKey) return false;
    webpush.setVapidDetails("mailto:info@dirtridecamp.com", publicKey, privateKey);
    configured = true;
    return true;
}

export interface PushPayload {
    title: string;
    body: string;
    url?: string;
}

/** Sends a web-push notification to all of a user's subscribed devices. No-ops without VAPID keys. */
export async function sendPush(userId: string, payload: PushPayload): Promise<void> {
    if (!ensureConfigured()) return;

    const subs = await prisma.pushSubscription.findMany({ where: { userId } });
    await Promise.all(
        subs.map(async (sub) => {
            try {
                await webpush.sendNotification(
                    { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
                    JSON.stringify(payload)
                );
            } catch (err) {
                // Remove dead subscriptions (410 Gone / 404).
                const statusCode = (err as { statusCode?: number })?.statusCode;
                if (statusCode === 410 || statusCode === 404) {
                    await prisma.pushSubscription.delete({ where: { id: sub.id } }).catch(() => { });
                }
            }
        })
    );
}
