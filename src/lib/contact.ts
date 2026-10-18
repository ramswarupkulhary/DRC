import { prisma } from "@/lib/prisma";

export interface ContactInfo {
    phone: string;
    instagram: string;
    whatsappGroupLink: string;
}

export const CONTACT_DEFAULTS: ContactInfo = {
    phone: "+91 94148 70102",
    instagram: "dirtridecamp",
    whatsappGroupLink: "",
};

const KEYS = {
    phone: "contact_phone",
    instagram: "contact_instagram",
    whatsappGroupLink: "whatsapp_group_link",
} as const;

/** Reads admin-editable contact info from SiteSetting, falling back to defaults. */
export async function getContactInfo(): Promise<ContactInfo> {
    try {
        const rows = await prisma.siteSetting.findMany({
            where: { key: { in: Object.values(KEYS) } },
        });
        const map: Record<string, string> = {};
        rows.forEach((r) => { map[r.key] = r.value; });
        return {
            phone: map[KEYS.phone]?.trim() || CONTACT_DEFAULTS.phone,
            instagram: (map[KEYS.instagram]?.trim() || CONTACT_DEFAULTS.instagram).replace(/^@/, ""),
            whatsappGroupLink: map[KEYS.whatsappGroupLink]?.trim() || CONTACT_DEFAULTS.whatsappGroupLink,
        };
    } catch {
        return CONTACT_DEFAULTS;
    }
}

/** Digits-only phone, usable for tel: and wa.me links. */
export function phoneDigits(phone: string): string {
    return phone.replace(/\D/g, "");
}
