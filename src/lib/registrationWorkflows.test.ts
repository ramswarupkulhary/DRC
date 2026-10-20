import assert from "node:assert/strict";
import { test } from "node:test";
import { createRequire } from "node:module";
import { createHmac } from "node:crypto";
import JSZip from "jszip";

const loadModule = createRequire(`${process.cwd()}/package.json`);

test("registration, admin and document workflows stay scoped and never refund implicitly", async (context) => {
    const previousDatabase = process.env.DATABASE_URL;
    const previousSecret = process.env.NEXTAUTH_SECRET;
    process.env.DATABASE_URL ||= "postgresql://test:test@localhost:5432/test";
    process.env.NEXTAUTH_SECRET = "workflow-test-secret";
    let currentSession: { user: { id: string; email: string; role?: string } } | null = null;
    const messages: Record<string, unknown>[] = [];
    const auth = loadModule("next-auth/next") as { getServerSession: (...args: unknown[]) => Promise<unknown> };
    const mail = loadModule("nodemailer") as { createTransport: (...args: unknown[]) => unknown };
    context.mock.method(auth, "getServerSession", async () => currentSession);
    context.mock.method(mail, "createTransport", () => ({ sendMail: async (message: Record<string, unknown>) => { messages.push(message); return { messageId: "test", accepted: [message.to] }; } }));
    const restores: (() => void)[] = [];
    function stub(delegate: object, method: string, implementation: (...args: unknown[]) => unknown) {
        const target = delegate as Record<string, unknown>;
        const original = target[method];
        target[method] = implementation;
        restores.push(() => { target[method] = original; });
    }
    const admin = { user: { id: "admin-one", email: "admin@example.com", role: "admin" } };
    const member = { user: { id: "account-one", email: "rider@example.com", role: "rider" } };
    const request = (url: string, body: unknown, method = "POST") => new Request(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    try {
        const { prisma } = await import("./prisma");
        const history = await import("../app/api/registrations/mine/route");
        const adminList = await import("../app/api/admin/event-registrations/route");
        const cancellation = await import("../app/api/admin/event-registrations/[id]/route");
        const documents = await import("../app/api/admin/events/[id]/documents/route");
        const download = await import("../app/api/event-documents/[id]/route");
        const notify = await import("../app/api/admin/notify-riders/route");
        const verification = await import("../app/api/events/ultimate-rider/verify/route");
        const eventOrder = await import("../app/api/events/ultimate-rider/create-order/route");

        await context.test("history includes all five booking types and queries only the signed-in account", async () => {
            currentSession = member;
            stub(prisma.user, "findUnique", async () => ({ id: "account-one" }));
            const createdAt = new Date("2026-10-19T00:00:00Z");
            const base = { amount: 5000, paymentStatus: "paid", status: "confirmed", createdAt };
            stub(prisma.registration, "findMany", async (args) => {
                assert.deepEqual((args as { where: unknown }).where, { userId: "account-one", deletedAt: null });
                return [{ ...base, id: "ride", ride: { title: "Ride", slug: "ride" }, training: null }, { ...base, id: "training", ride: null, training: { title: "Training", slug: "training" } }];
            });
            stub(prisma.eventRegistration, "findMany", async (args) => {
                assert.deepEqual((args as { where: unknown }).where, { userId: "account-one", deletedAt: null, paymentStatus: { in: ["paid", "refunded", "refund_pending"] } });
                return [{ ...base, id: "race", eventSlug: "drc-ultimate-rider", categoryName: "Class 1", registrationType: "rider", status: "active" }, { ...base, id: "spectator", eventSlug: "drc-ultimate-rider", categoryName: "Spectator pass", registrationType: "spectator", status: "active" }];
            });
            stub(prisma.programBooking, "findMany", async (args) => {
                assert.deepEqual((args as { where: unknown }).where, { userId: "account-one", deletedAt: null });
                return [{ ...base, id: "program", programName: "Family Program", programSlug: "family", companions: [] }];
            });
            stub(prisma.event, "findMany", async () => [{ slug: "drc-ultimate-rider", title: "Ultimate Rider", location: "Bengaluru", date: createdAt }]);
            const response = await history.GET();
            const data = await response.json();
            assert.deepEqual(data.registrations.map((row: { kind: string }) => row.kind).sort(), ["event", "program", "ride", "spectator", "training"]);
            assert.match(data.registrations.find((row: { kind: string }) => row.kind === "spectator").passUrl, /\/passes\/spectator\?signature=/);
            currentSession = null;
            assert.equal((await history.GET()).status, 401);
        });

        await context.test("spectator registration is temporarily closed for accounts and guests without creating records or emails", async () => {
            let created = 0;
            stub(prisma.eventRegistration, "create", async () => { created++; return { id: "must-not-be-created" }; });
            const body = { registrationType: "spectator", name: "Test Spectator", email: "spectator@example.com", phone: "001234", city: "Bengaluru" };
            const emailCount = messages.length;
            currentSession = member;
            assert.equal((await eventOrder.POST(request("https://example.com", body))).status, 403);
            currentSession = null;
            assert.equal((await eventOrder.POST(request("https://example.com", body))).status, 403);
            assert.equal(created, 0);
            assert.equal(messages.length, emailCount);
        });

        await context.test("rider tent checkout uses supported Razorpay fields and retains the database hold", async () => {
            currentSession = member;
            const event = { id: "event-one", slug: "drc-ultimate-rider", stayEnabled: true, stayTotalTents: 50, stayPrice: 1599 };
            stub(prisma.event, "findUnique", async () => event);
            stub(prisma.eventCategory, "findUnique", async () => ({ id: "category-one", slug: "foreign-bikes", name: "Foreign Bikes", fee: 5999, active: true }));
            stub(prisma.user, "findUnique", async () => ({ id: "account-one", membership: null }));
            stub(prisma.siteSetting, "findMany", async () => [{ key: "razorpay_key_id", value: "rzp_test_fake" }, { key: "razorpay_key_secret", value: "fake-secret" }]);
            const api = loadModule("razorpay/dist/api") as { prototype: { post: (...args: unknown[]) => Promise<unknown> } };
            const orderRequest = context.mock.method(api.prototype, "post", async (args: unknown) => {
                const payload = args as { url: string; data: Record<string, unknown> };
                assert.equal(payload.url, "/orders");
                assert.equal(Object.hasOwn(payload.data, "expire_by"), false);
                assert.equal(payload.data.amount, 759800);
                assert.equal(payload.data.currency, "INR");
                return { id: "order-with-tent", amount: payload.data.amount, currency: "INR" };
            });
            let saved = false;
            stub(prisma, "$transaction", async (callback, options) => {
                assert.deepEqual(options, { isolationLevel: "Serializable" });
                const execute = callback as (transaction: object) => Promise<string>;
                return execute({ eventRegistration: {
                    count: async () => 0,
                    create: async ({ data }: { data: { userId: string; amount: number; stayBooked: boolean; stayAmount: number; reservationExpiresAt: Date } }) => {
                        assert.equal(data.userId, "account-one");
                        assert.equal(data.amount, 7598);
                        assert.equal(data.stayBooked, true);
                        assert.equal(data.stayAmount, 1599);
                        assert.ok(data.reservationExpiresAt.getTime() > Date.now() + 14 * 60 * 1000);
                        assert.ok(data.reservationExpiresAt.getTime() <= Date.now() + 15 * 60 * 1000);
                        saved = true;
                        return { id: "rider-with-tent" };
                    },
                } });
            });
            const response = await eventOrder.POST(request("https://example.com", { registrationType: "rider", categories: ["foreign-bikes"], name: "Test Rider", email: "rider@example.com", phone: "001234", city: "Bengaluru", bikeMake: "Test", bikeModel: "Bike", experience: "advanced", acknowledgeOrganiser: true, stayBooked: true }));
            const data = await response.json();
            assert.equal(response.status, 200);
            assert.equal(data.orderId, "order-with-tent");
            assert.equal(data.stayAmount, 1599);
            assert.equal(data.amount, 7598);
            assert.equal(saved, true);
            assert.equal(orderRequest.mock.callCount(), 1);
            orderRequest.mock.restore();
        });

        await context.test("admin table requires an event and export applies that event and rider/category filters", async () => {
            currentSession = admin;
            let queries = 0;
            stub(prisma.eventRegistration, "findMany", async (args) => {
                queries++;
                const where = (args as { where: { eventSlug: string; registrationType: string; OR: unknown[]; paymentStatus: unknown } }).where;
                assert.equal(where.eventSlug, "event-one");
                assert.equal((args as { where: { deletedAt: unknown } }).where.deletedAt, null);
                assert.equal(where.registrationType, "rider");
                assert.equal(where.OR.length, 4);
                assert.deepEqual(where.paymentStatus, { in: ["paid", "refunded", "refund_pending"] });
                return [{ id: "row-one", category: "class-one,class-two", registrationType: "rider", name: "Test Rider", email: "rider@example.com", phone: "001234", createdAt: new Date(), amount: 5000, status: "active", paymentStatus: "paid" }];
            });
            assert.equal((await adminList.GET(new Request("https://example.com/api/admin/event-registrations"))).status, 400);
            assert.equal(queries, 0);
            assert.equal((await adminList.GET(new Request("https://example.com/api/admin/event-registrations?eventSlug=event-one&paymentStatus=pending&format=xlsx"))).status, 400);
            assert.equal(queries, 0);
            stub(prisma.event, "findUnique", async () => ({ id: "event-one", title: "Event One" }));
            stub(prisma.eventCategory, "findMany", async () => [{ slug: "class-one", name: "One", classLabel: "Class 1" }]);
            const response = await adminList.GET(new Request("https://example.com/api/admin/event-registrations?eventSlug=event-one&registrationType=rider&category=class-one&format=category-zip"));
            assert.equal(response.status, 200);
            const archive = await JSZip.loadAsync(await response.arrayBuffer());
            assert.deepEqual(Object.keys(archive.files), ["Class-1-class-one-registrations.xlsx"]);
            currentSession = null;
            assert.equal((await adminList.GET(new Request("https://example.com/api/admin/event-registrations?eventSlug=event-one"))).status, 403);
        });

        await context.test("cancellation retains paid status and rejects refund requests", async () => {
            currentSession = admin;
            const registration = { id: "registration-one", eventSlug: "event-one", status: "active", paymentStatus: "paid", amount: 5000, userId: "account-one", email: "rider@example.com", categoryName: "Class 1" };
            stub(prisma.eventRegistration, "findFirst", async () => registration);
            stub(prisma.eventRegistration, "updateMany", async (args) => {
                const data = (args as { data: Record<string, unknown> }).data;
                assert.equal(data.status, "cancelled");
                assert.equal(data.cancelledById, "admin-one");
                assert.equal(Object.hasOwn(data, "paymentStatus"), false);
                return { count: 1 };
            });
            stub(prisma.eventRegistration, "findUniqueOrThrow", async () => ({ ...registration, status: "cancelled" }));
            stub(prisma.notification, "create", async () => ({}));
            const params = { params: Promise.resolve({ id: registration.id }) };
            const response = await cancellation.PATCH(request("https://example.com", { action: "cancel", eventSlug: "event-one", reason: "Test reason" }, "PATCH"), params);
            const data = await response.json();
            assert.equal(data.refundIssued, false);
            assert.equal(data.registration.status, "cancelled");
            assert.equal(data.registration.paymentStatus, "paid");
            assert.equal((await cancellation.PATCH(request("https://example.com", { action: "cancel", eventSlug: "event-one", refund: true }, "PATCH"), params)).status, 400);
            currentSession = member;
            assert.equal((await cancellation.PATCH(request("https://example.com", { action: "cancel", eventSlug: "event-one" }, "PATCH"), params)).status, 403);
        });

        await context.test("PDF upload is admin-only and validates file contents", async () => {
            const params = { params: Promise.resolve({ id: "event-one" }) };
            currentSession = null;
            assert.equal((await documents.POST(new Request("https://example.com", { method: "POST" }), params)).status, 403);
            currentSession = admin;
            stub(prisma.eventDocument, "create", async (args) => {
                const data = (args as { data: { eventId: string; displayText: string; content: Uint8Array } }).data;
                assert.equal(data.eventId, "event-one");
                assert.equal(data.displayText, "Rider Handbook");
                assert.equal(Buffer.from(data.content).toString(), "%PDF-1.7\n%%EOF");
                return { id: "document-one", displayText: data.displayText };
            });
            const form = new FormData();
            form.set("displayText", "Rider Handbook");
            form.set("file", new File(["%PDF-1.7\n%%EOF"], "brief.pdf", { type: "application/pdf" }));
            assert.equal((await documents.POST(new Request("https://example.com", { method: "POST", body: form }), params)).status, 201);
            form.set("file", new File(["not a pdf"], "brief.pdf", { type: "application/pdf" }));
            assert.equal((await documents.POST(new Request("https://example.com", { method: "POST", body: form }), params)).status, 400);
        });

        await context.test("public PDF download logs available identity and notifies admin, but HEAD does not", async () => {
            currentSession = member;
            const pdf = Buffer.from("%PDF-1.7\n%%EOF");
            stub(prisma.eventDocument, "findFirst", async () => ({ id: "document-one", displayText: "Rider Handbook", filename: "brief.pdf", size: pdf.length, content: pdf, event: { title: "Event One", slug: "event-one" } }));
            stub(prisma.eventDocumentDownload, "count", async () => 0);
            stub(prisma.user, "findUnique", async () => ({ id: "account-one", name: "Test Rider", email: "rider@example.com", phone: "001234" }));
            let logs = 0;
            stub(prisma.eventDocumentDownload, "create", async (args) => { logs++; return { id: "download-one", downloadedAt: new Date(), ...(args as { data: object }).data }; });
            stub(prisma.eventDocumentDownload, "update", async () => ({}));
            const params = { params: Promise.resolve({ id: "document-one" }) };
            const req = new Request("https://example.com/api/event-documents/document-one", { headers: { "x-forwarded-for": "203.0.113.10", "user-agent": "Test browser" } });
            const mailCount = messages.length;
            const preview = await download.GET(new Request("https://example.com/api/event-documents/document-one?view=inline"), params);
            assert.equal(await preview.text(), pdf.toString());
            assert.match(preview.headers.get("Content-Disposition") || "", /^inline;/);
            assert.equal(preview.headers.get("X-Frame-Options"), "SAMEORIGIN");
            assert.equal(logs, 0);
            assert.equal(messages.length, mailCount);
            const response = await download.GET(req, params);
            assert.equal(await response.text(), pdf.toString());
            assert.match(response.headers.get("Content-Disposition") || "", /^attachment;/);
            assert.equal(logs, 1);
            assert.match(String(messages.at(-1)?.html), /Test Rider/);
            assert.match(String(messages.at(-1)?.html), /203.0.113.10/);
            await download.HEAD(req, params);
            assert.equal(logs, 1);
            currentSession = null;
            await download.GET(req, params);
            assert.match(String(messages.at(-1)?.html), /Anonymous visitor/);
            stub(prisma.eventDocumentDownload, "count", async () => 10);
            assert.equal((await download.GET(req, params)).status, 429);
        });

        await context.test("event notifications use the selected event destination", async () => {
            currentSession = admin;
            stub(prisma.event, "findUnique", async () => ({ id: "event-one", title: "Event One", slug: "event-one", date: new Date(), location: "Bengaluru", price: 0 }));
            stub(prisma.user, "findMany", async () => [{ id: "account-one", email: "rider@example.com", name: "Test Rider" }]);
            stub(prisma.notification, "create", async (args) => {
                assert.equal((args as { data: { link: string } }).data.link, "/events/event-one");
                return {};
            });
            const response = await notify.POST(request("https://example.com", { eventId: "event-one", riderIds: ["account-one"] }));
            assert.equal((await response.json()).sent, 1);
            assert.match(String(messages.at(-1)?.html), /\/events\/event-one/);
        });

        await context.test("rider receipt uses the current admin contact, not a hardcoded number", async () => {
            currentSession = member;
            stub(prisma.siteSetting, "findUnique", async () => ({ value: "payment-test-secret" }));
            stub(prisma.siteSetting, "findMany", async () => [{ key: "contact_phone", value: "8660697613" }]);
            const registration = { id: "race-one", userId: "account-one", eventSlug: "drc-ultimate-rider", status: "active", registrationType: "rider", category: "class-one", categoryName: "Class 1", stayBooked: false, stayAmount: 0, foodAmount: 0, paymentStatus: "pending", amount: 5000, membershipDiscount: 0 };
            stub(prisma.eventRegistration, "findFirst", async () => registration);
            stub(prisma.eventRegistration, "updateMany", async () => ({ count: 1 }));
            stub(prisma.eventRegistration, "findUniqueOrThrow", async () => ({ ...registration, paymentStatus: "paid" }));
            const signature = createHmac("sha256", "payment-test-secret").update("order-one|payment-one").digest("hex");
            const response = await verification.POST(request("https://example.com", { razorpay_order_id: "order-one", razorpay_payment_id: "payment-one", razorpay_signature: signature, registrationType: "rider", categories: ["class-one"], stayBooked: false, name: "Test Rider", email: "rider@example.com" }));
            assert.equal(response.status, 200);
            const html = String(messages.at(-1)?.html);
            assert.match(html, /8660697613/);
            assert.match(html, /wa.me\/918660697613/);
            assert.doesNotMatch(html, /94148/);
        });
    } finally {
        for (const restore of restores.reverse()) restore();
        if (previousDatabase === undefined) delete process.env.DATABASE_URL; else process.env.DATABASE_URL = previousDatabase;
        if (previousSecret === undefined) delete process.env.NEXTAUTH_SECRET; else process.env.NEXTAUTH_SECRET = previousSecret;
    }
});