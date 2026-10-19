import assert from "node:assert/strict";
import { test } from "node:test";
import sharp from "sharp";
import { escapePassText, isValidSpectatorPassSignature, renderSpectatorPass, spectatorPassDownloadUrl, spectatorPassSignature } from "./spectatorPass";

test("spectator pass links reject modified registration IDs and signatures", () => {
    const previousSecret = process.env.NEXTAUTH_SECRET;
    process.env.NEXTAUTH_SECRET = "spectator-pass-test-secret";
    try {
        const signature = spectatorPassSignature("registration-one");
        assert.equal(isValidSpectatorPassSignature("registration-one", signature), true);
        assert.equal(isValidSpectatorPassSignature("registration-two", signature), false);
        assert.equal(isValidSpectatorPassSignature("registration-one", "invalid"), false);
        assert.equal(isValidSpectatorPassSignature("registration-one", "0".repeat(64)), false);
        const url = new URL(spectatorPassDownloadUrl("registration-one"));
        assert.equal(url.pathname, "/api/events/ultimate-rider/passes/registration-one");
        assert.equal(url.searchParams.get("signature"), signature);
    } finally {
        if (previousSecret === undefined) delete process.env.NEXTAUTH_SECRET;
        else process.env.NEXTAUTH_SECRET = previousSecret;
    }
});

test("spectator pass escapes names and renders a nonblank downloadable PNG", async () => {
    assert.equal(escapePassText('<Guest & "Friend">'), "&lt;Guest &amp; &quot;Friend&quot;&gt;");
    const image = await renderSpectatorPass({ id: "registration-one", name: '<Guest & "Friend">' });
    const metadata = await sharp(image).metadata();
    assert.equal(metadata.format, "png");
    assert.equal(metadata.width, 1200);
    assert.equal(metadata.height, 720);
    const stats = await sharp(image).stats();
    assert.ok(stats.channels.some((channel) => channel.stdev > 10));
    for (const region of [
        { label: "brand", top: 50, height: 45 },
        { label: "event title", top: 105, height: 75 },
        { label: "pass holder name", top: 345, height: 65 },
        { label: "event date", top: 430, height: 45 },
        { label: "admission", top: 480, height: 40 },
        { label: "registration reference", top: 580, height: 40 },
    ]) {
        const { data, info } = await sharp(image).extract({ left: 72, top: region.top, width: 1000, height: region.height })
            .flatten({ background: "#111111" }).removeAlpha().raw().toBuffer({ resolveWithObject: true });
        let visibleTextPixels = 0;
        for (let offset = 0; offset < data.length; offset += info.channels) {
            if (data[offset] > 180 && data[offset + 1] > 180 && data[offset + 2] > 180) visibleTextPixels++;
        }
        assert.ok(visibleTextPixels > 100, `${region.label} must contain visible light text, not only background or borders`);
    }
});

test("download endpoint serves only signed, confirmed spectator passes", async (context) => {
    const previousSecret = process.env.NEXTAUTH_SECRET;
    const previousDatabaseUrl = process.env.DATABASE_URL;
    process.env.NEXTAUTH_SECRET = "spectator-pass-endpoint-test-secret";
    process.env.DATABASE_URL ||= "postgresql://test:test@localhost:5432/test";
    let restoreLookup = () => { };
    try {
        const { prisma } = await import("./prisma");
        const { GET } = await import("../app/api/events/ultimate-rider/passes/[id]/route");
        let registration: { id: string; name: string; eventSlug: string; registrationType: string; paymentStatus: string; status: string } | null = {
            id: "registration-one",
            name: "Test Spectator",
            eventSlug: "drc-ultimate-rider",
            registrationType: "spectator",
            paymentStatus: "paid",
            status: "active",
        };
        const originalLookup = prisma.eventRegistration.findUnique;
        const lookup = context.mock.fn(async () => registration);
        prisma.eventRegistration.findUnique = lookup as unknown as typeof originalLookup;
        restoreLookup = () => { prisma.eventRegistration.findUnique = originalLookup; };
        const download = (url = spectatorPassDownloadUrl("registration-one")) => GET(new Request(url), { params: Promise.resolve({ id: "registration-one" }) });
        assert.equal((await download("https://example.com/api/events/ultimate-rider/passes/registration-one")).status, 404);
        assert.equal(lookup.mock.callCount(), 0);
        const response = await download();
        assert.equal(response.status, 200);
        assert.equal(response.headers.get("Content-Type"), "image/png");
        assert.match(response.headers.get("Content-Disposition") || "", /^attachment;/);
        assert.equal(response.headers.get("Cache-Control"), "private, no-store");
        assert.equal((await sharp(Buffer.from(await response.arrayBuffer())).metadata()).format, "png");
        registration.paymentStatus = "pending";
        assert.equal((await download()).status, 404);
        registration.paymentStatus = "paid";
        registration.status = "cancelled";
        assert.equal((await download()).status, 404);
        registration.status = "active";
        registration.registrationType = "rider";
        assert.equal((await download()).status, 404);
        registration.registrationType = "spectator";
        registration.eventSlug = "another-event";
        assert.equal((await download()).status, 404);
        registration = null;
        assert.equal((await download()).status, 404);
    } finally {
        restoreLookup();
        if (previousSecret === undefined) delete process.env.NEXTAUTH_SECRET;
        else process.env.NEXTAUTH_SECRET = previousSecret;
        if (previousDatabaseUrl === undefined) delete process.env.DATABASE_URL;
        else process.env.DATABASE_URL = previousDatabaseUrl;
    }
});