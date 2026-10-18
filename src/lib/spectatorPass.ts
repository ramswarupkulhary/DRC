import { createHmac, timingSafeEqual } from "node:crypto";
import { ImageResponse } from "next/og";
import { createElement } from "react";

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
    const text = (value: string, top: number, fontSize: number, color = "#FFFFFF") => createElement("div", {
        style: { position: "absolute", display: "flex", left: 72, top, width: 1056, fontSize, color, lineHeight: 1.2 },
    }, value);
    const divider = (top: number) => createElement("div", {
        style: { position: "absolute", left: 72, top, width: 1056, height: 1, backgroundColor: "#555555" },
    });
    const nameSize = Math.max(16, Math.min(44, Math.floor(1584 / Math.max(Array.from(registration.name).length, 1))));
    const image = new ImageResponse(createElement("div", {
        style: { position: "relative", display: "flex", width: 1200, height: 720, backgroundColor: "#111111", fontFamily: "sans-serif" },
    },
    createElement("div", { style: { position: "absolute", left: 0, top: 0, width: 18, height: 720, backgroundColor: "#E8622C" } }),
    text("DRC MOTORSPORTS", 56, 26),
    text("DRC ULTIMATE RIDER", 112, 54),
    text("SPECTATOR PASS", 190, 30, "#E8622C"),
    divider(270),
    text("PASS HOLDER", 306, 20, "#BBBBBB"),
    text(registration.name, 348, nameSize),
    text("12-13 December 2026 | Bengaluru", 434, 28),
    text("Free general admission", 482, 26),
    divider(554),
    text(`Registration: ${registration.id}`, 582, 20),
    text("Spectator admission only. No race entry, meals or tent stay included.", 632, 18, "#BBBBBB")), {
        width: 1200,
        height: 720,
    });
    return Buffer.from(await image.arrayBuffer());
}