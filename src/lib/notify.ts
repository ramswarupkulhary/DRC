import { prisma } from "@/lib/prisma";
import { sendEmail, drcEmailTemplate } from "@/lib/email";
import { sendPush } from "@/lib/push";
import { sendWhatsApp } from "@/lib/whatsapp";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://www.dirtridecamp.com";

interface NotifyArgs {
    userId: string;
    title: string;
    message: string;
    link?: string;
    type?: string;
    email?: boolean;
    push?: boolean;
    whatsapp?: boolean;
}

/**
 * Unified rider notification: always creates an in-app notification, and optionally
 * sends email / web-push / WhatsApp. External channels no-op silently if unconfigured.
 */
export async function notifyRider({
    userId,
    title,
    message,
    link,
    type = "system",
    email = false,
    push = true,
    whatsapp = false,
}: NotifyArgs): Promise<void> {
    await prisma.notification.create({ data: { userId, title, message, link: link || null, type } });

    if (!email && !push && !whatsapp) return;

    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { email: true, phone: true },
    });
    if (!user) return;

    const tasks: Promise<unknown>[] = [];
    if (push) tasks.push(sendPush(userId, { title, body: message, url: link ? `${BASE_URL}${link}` : BASE_URL }));
    if (email && user.email) {
        tasks.push(
            sendEmail({
                to: user.email,
                subject: title,
                html: drcEmailTemplate({ title, body: message, ctaText: link ? "View" : undefined, ctaUrl: link ? `${BASE_URL}${link}` : undefined }),
            }).catch(() => { })
        );
    }
    if (whatsapp && user.phone) tasks.push(sendWhatsApp(user.phone, `${title}\n\n${message}`));

    await Promise.allSettled(tasks);
}
