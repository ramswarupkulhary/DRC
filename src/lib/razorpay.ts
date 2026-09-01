import { prisma } from "@/lib/prisma";
import Razorpay from "razorpay";

/** Loads Razorpay keys from site settings (falling back to env) and returns an instance. */
export async function getRazorpay() {
    const settings = await prisma.siteSetting.findMany({
        where: { key: { in: ["razorpay_key_id", "razorpay_key_secret"] } },
    });
    const map: Record<string, string> = {};
    settings.forEach((s) => {
        map[s.key] = s.value;
    });

    const keyId = map.razorpay_key_id || process.env.RAZORPAY_KEY_ID || "";
    const keySecret = map.razorpay_key_secret || process.env.RAZORPAY_KEY_SECRET || "";

    if (!keyId || !keySecret) return null;

    return { instance: new Razorpay({ key_id: keyId, key_secret: keySecret }), keyId, keySecret };
}

export async function getRazorpaySecret(): Promise<string> {
    const setting = await prisma.siteSetting.findUnique({ where: { key: "razorpay_key_secret" } });
    return setting?.value || process.env.RAZORPAY_KEY_SECRET || "";
}
/**
 * Refunds a Razorpay payment. Returns true on success, false if not configured/failed.
 * amount is in rupees; omit for a full refund.
 */
export async function refundPayment(paymentId: string | null | undefined, amount?: number): Promise<boolean> {
    if (!paymentId) return false;
    const rz = await getRazorpay();
    if (!rz) return false;
    try {
        await rz.instance.payments.refund(paymentId, {
            ...(amount ? { amount: Math.round(amount * 100) } : {}),
            speed: "normal",
        });
        return true;
    } catch {
        return false;
    }
}