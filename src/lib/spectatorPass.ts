import { createHmac, timingSafeEqual } from "node:crypto";
import sharp from "sharp";

export function spectatorPassSignature(registrationId: string): string {
    const secret = process.env.NEXTAUTH_SECRET;
    if (!secret) throw new Error("Pass signing is not configured.");
    return createHmac("sha256", secret).update(`ultimate-rider-spectator:${registrationId}`).digest("hex");
}

export function isValidSpectatorPassSignature(registrationId: string, signature: string): boolean {
    if (!/^[a-f0-9]{64}$/.test(signature)) return false;
    return timingSafeEqual(Buffer.from(signature, "hex"), Buffer.from(spectatorPassSignature(registrationId), "hex"));
}

export function spectatorPassDownloadUrl(registrationId: string): string {
    const url = new URL(`/api/events/ultimate-rider/passes/${encodeURIComponent(registrationId)}`, process.env.NEXT_PUBLIC_BASE_URL || "https://www.dirtridecamp.com");
    url.searchParams.set("signature", spectatorPassSignature(registrationId));
    return url.toString();
}

export function escapePassText(value: string): string {
    return value.replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;" })[character]!);
}

export async function renderSpectatorPass(registration: { id: string; name: string }): Promise<Buffer> {
    const nameWidth = Array.from(registration.name).length > 36 ? ' textLength="1040" lengthAdjust="spacingAndGlyphs"' : "";
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="720">
        <rect width="1200" height="720" fill="#111111"/>
        <rect width="18" height="720" fill="#E8622C"/>
        <g font-family="DejaVu Sans, sans-serif" fill="#FFFFFF">
            <text x="72" y="88" font-size="26" font-weight="bold">DRC MOTORSPORTS</text>
            <text x="72" y="170" font-size="54" font-weight="bold">DRC ULTIMATE RIDER</text>
            <text x="72" y="228" font-size="30" fill="#E8622C">SPECTATOR PASS</text>
            <path d="M72 270H1128" stroke="#555555"/>
            <text x="72" y="332" font-size="20" fill="#BBBBBB">PASS HOLDER</text>
            <text x="72" y="393" font-size="44" font-weight="bold"${nameWidth}>${escapePassText(registration.name)}</text>
            <text x="72" y="466" font-size="28">12-13 December 2026 | Bengaluru</text>
            <text x="72" y="512" font-size="26">Free general admission</text>
            <path d="M72 554H1128" stroke="#555555"/>
            <text x="72" y="608" font-size="20">Registration: ${escapePassText(registration.id)}</text>
            <text x="72" y="655" font-size="18" fill="#BBBBBB">Spectator admission only. No race entry, meals or tent stay included.</text>
        </g>
    </svg>`;
    return sharp(Buffer.from(svg)).png().toBuffer();
}