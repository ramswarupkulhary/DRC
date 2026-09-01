/**
 * WhatsApp Cloud API sender. No-ops when not configured so the app never breaks.
 * Set WHATSAPP_TOKEN and WHATSAPP_PHONE_ID to enable.
 */
export async function sendWhatsApp(to: string | null | undefined, message: string): Promise<boolean> {
    const token = process.env.WHATSAPP_TOKEN;
    const phoneId = process.env.WHATSAPP_PHONE_ID;
    if (!token || !phoneId || !to) return false;

    // Normalise to digits with country code (default +91 for 10-digit Indian numbers).
    let phone = to.replace(/[^0-9]/g, "");
    if (phone.length === 10) phone = `91${phone}`;
    if (!phone) return false;

    try {
        const res = await fetch(`https://graph.facebook.com/v21.0/${phoneId}/messages`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                messaging_product: "whatsapp",
                to: phone,
                type: "text",
                text: { body: message },
            }),
        });
        return res.ok;
    } catch {
        return false;
    }
}
