import assert from "node:assert/strict";
import { test } from "node:test";
import { createRequire } from "node:module";
import { createHmac } from "node:crypto";

const loadModule = createRequire(`${process.cwd()}/package.json`);

test("event cancellation refunds require explicit intent and cannot duplicate financial requests", async (context) => {
    const previousDatabase = process.env.DATABASE_URL;
    process.env.DATABASE_URL ||= "postgresql://test:test@localhost:5432/test";
    let session: { user: { id: string; role: string } } | null = { user: { id: "admin-one", role: "admin" } };
    const auth = loadModule("next-auth/next") as { getServerSession: (...args: unknown[]) => Promise<unknown> };
    const mail = loadModule("nodemailer") as { createTransport: (...args: unknown[]) => unknown };
    const api = loadModule("razorpay/dist/api") as { prototype: { get: (...args: unknown[]) => Promise<unknown>; post: (...args: unknown[]) => Promise<unknown> } };
    const messages: Record<string, unknown>[] = [];
    context.mock.method(auth, "getServerSession", async () => session);
    context.mock.method(mail, "createTransport", () => ({ sendMail: async (message: Record<string, unknown>) => { messages.push(message); return { messageId: "test-only" }; } }));
    const fixture = () => ({ id: "registration-one", eventSlug: "event-one", userId: "rider-one", name: "Test Rider", email: "rider@example.com", categoryName: "Class 1", amount: 5000, currency: "INR", status: "active", paymentStatus: "paid", razorpayPaymentId: "payment-one", razorpayOrderId: "order-one", refundId: null as string | null, refundStatus: null as string | null, refundAmount: 0, refundRequestedById: null as string | null, cancelledAt: null as Date | null, cancelledById: null as string | null, cancellationReason: null as string | null });
    let registration = fixture();
    let refundRequests = 0;
    let paymentReads = 0;
    let refundFailure: unknown;
    let held = false;
    let onStarted: (() => void) | undefined;
    let release: ((value: object) => void) | undefined;
    let providerStatus = "pending";
    const refund = () => ({ id: "refund-one", payment_id: "payment-one", currency: "INR", amount: 500000, status: providerStatus });
    context.mock.method(api.prototype, "get", async (args: unknown) => {
        const url = (args as { url: string }).url;
        if (url.includes("refund")) return refund();
        paymentReads++;
        return { id: "payment-one", status: "captured", currency: "INR", amount: 500000, order_id: "order-one", amount_refunded: 0 };
    });
    context.mock.method(api.prototype, "post", async (args: unknown) => {
        const payload = args as { url: string; data: { amount: number; notes: { eventRegistrationId: string } } };
        assert.match(payload.url, /payments\/payment-one\/refund/);
        assert.equal(payload.data.amount, 500000);
        assert.equal(payload.data.notes.eventRegistrationId, "registration-one");
        refundRequests++;
        if (refundFailure) throw refundFailure;
        if (held) return new Promise<object>((resolve) => { release = resolve; onStarted?.(); });
        return refund();
    });
    const restores: (() => void)[] = [];
    function stub(delegate: object, name: string, implementation: (...args: unknown[]) => unknown) {
        const target = delegate as Record<string, unknown>;
        const original = target[name];
        target[name] = implementation;
        restores.push(() => { target[name] = original; });
    }
    function matches(where: Record<string, unknown>): boolean {
        for (const key of ["id", "eventSlug", "paymentStatus", "status", "refundId", "refundStatus", "razorpayPaymentId"]) {
            if (!(key in where)) continue;
            const expected = where[key];
            const actual = registration[key as keyof typeof registration];
            if (expected && typeof expected === "object") {
                if ("in" in expected && !(expected.in as unknown[]).includes(actual)) return false;
                if ("not" in expected && actual === expected.not) return false;
            } else if (actual !== expected) return false;
        }
        return !Array.isArray(where.OR) || where.OR.some((condition) => matches(condition));
    }
    function reset() {
        registration = fixture(); refundRequests = 0; paymentReads = 0; refundFailure = undefined; held = false; providerStatus = "pending";
        session = { user: { id: "admin-one", role: "admin" } };
    }
    try {
        const { prisma } = await import("./prisma");
        const { PATCH } = await import("../app/api/admin/event-registrations/[id]/route");
        const webhook = await import("../app/api/webhooks/razorpay/route");
        stub(prisma.siteSetting, "findMany", async () => [{ key: "razorpay_key_id", value: "rzp_test_fake" }, { key: "razorpay_key_secret", value: "fake-api-secret" }, { key: "razorpay_webhook_secret", value: "fake-webhook-secret" }]);
        stub(prisma.eventRegistration, "findFirst", async (args) => matches((args as { where: Record<string, unknown> }).where) ? { ...registration } : null);
        stub(prisma.eventRegistration, "findUniqueOrThrow", async () => ({ ...registration }));
        stub(prisma.eventRegistration, "updateMany", async (args) => {
            const { where, data } = args as { where: Record<string, unknown>; data: Partial<typeof registration> };
            if (!matches(where)) return { count: 0 };
            registration = { ...registration, ...data };
            return { count: 1 };
        });
        stub(prisma.event, "findUnique", async () => ({ title: "Test Event" }));
        stub(prisma.notification, "create", async () => ({}));
        const call = (body: object) => PATCH(new Request("https://example.com", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "cancel", eventSlug: "event-one", ...body }) }), { params: Promise.resolve({ id: "registration-one" }) });

        await context.test("without-refund cancellation never contacts the gateway", async () => {
            reset();
            const response = await call({ refund: false });
            assert.equal(response.status, 200);
            assert.equal(registration.status, "cancelled");
            assert.equal(registration.paymentStatus, "paid");
            assert.equal(paymentReads, 0);
            assert.equal(refundRequests, 0);
            assert.equal((await response.json()).refundIssued, false);
        });

        await context.test("authorization and explicit confirmation are required", async () => {
            reset();
            assert.equal((await call({ refund: true })).status, 400);
            assert.equal(refundRequests, 0);
            session = { user: { id: "rider-one", role: "rider" } };
            assert.equal((await call({ refund: true, confirmRefund: true })).status, 403);
            reset(); registration.amount = 0;
            assert.equal((await call({ refund: true, confirmRefund: true })).status, 400);
            reset(); registration.paymentStatus = "pending";
            assert.equal((await call({ refund: true, confirmRefund: true })).status, 400);
            assert.equal(refundRequests, 0);
        });

        await context.test("accepted refunds stay pending and repeated clicks do not refund twice", async () => {
            reset();
            const response = await call({ refund: true, confirmRefund: true });
            assert.equal(response.status, 200);
            assert.equal(registration.status, "cancelled");
            assert.equal(registration.paymentStatus, "refund_pending");
            assert.equal(registration.refundId, "refund-one");
            assert.equal(registration.refundRequestedById, "admin-one");
            assert.equal((await response.json()).refundIssued, false);
            assert.equal((await call({ refund: true, confirmRefund: true })).status, 200);
            assert.equal(refundRequests, 1);
        });

        await context.test("concurrent refund requests share an atomic claim", { timeout: 5000 }, async () => {
            reset(); held = true;
            const started = new Promise<void>((resolve) => { onStarted = resolve; });
            const first = call({ refund: true, confirmRefund: true });
            await started;
            try { assert.equal((await call({ refund: true, confirmRefund: true })).status, 409); }
            finally { held = false; release?.(refund()); }
            assert.equal((await first).status, 200);
            assert.equal(refundRequests, 1);
        });

        await context.test("uncertain outcomes block another financial request", async () => {
            reset(); refundFailure = new Error("network timeout");
            assert.equal((await call({ refund: true, confirmRefund: true })).status, 502);
            assert.equal(registration.refundStatus, "unknown");
            assert.equal(registration.paymentStatus, "paid");
            assert.equal(registration.status, "cancelled");
            refundFailure = undefined;
            assert.equal((await call({ refund: true, confirmRefund: true })).status, 409);
            assert.equal(refundRequests, 1);
        });

        await context.test("a definite rejection does not claim a refund succeeded", async () => {
            reset(); refundFailure = { statusCode: 400 };
            assert.equal((await call({ refund: true, confirmRefund: true })).status, 502);
            assert.equal(registration.status, "active");
            assert.equal(registration.paymentStatus, "paid");
            assert.equal(registration.refundStatus, "failed");
        });

        await context.test("previously cancelled paid bookings can be explicitly refunded", async () => {
            reset(); registration.status = "cancelled";
            assert.equal((await call({ refund: true, confirmRefund: true })).status, 200);
            assert.equal(registration.paymentStatus, "refund_pending");
            assert.equal(refundRequests, 1);
        });

        await context.test("an immediately processed provider refund is marked refunded", async () => {
            reset(); providerStatus = "processed";
            const response = await call({ refund: true, confirmRefund: true });
            assert.equal(response.status, 200);
            assert.equal((await response.json()).refundIssued, true);
            assert.equal(registration.paymentStatus, "refunded");
            assert.equal(registration.refundStatus, "processed");
            assert.equal(refundRequests, 1);
        });

        await context.test("refreshing a refund checks the provider without creating another refund", async () => {
            reset(); registration.status = "cancelled"; registration.refundStatus = "pending"; registration.refundId = "refund-one"; registration.paymentStatus = "refund_pending"; providerStatus = "processed";
            assert.equal((await call({ action: "refresh_refund" })).status, 200);
            assert.equal(registration.paymentStatus, "refunded");
            assert.equal(registration.refundStatus, "processed");
            assert.equal(refundRequests, 0);
        });

        const sendWebhook = (body: string, signature?: string) => webhook.POST(new Request("https://example.com", { method: "POST", headers: signature ? { "x-razorpay-signature": signature } : {}, body }));
        await context.test("only signed matching webhook outcomes can mark the refund complete", async () => {
            reset(); registration.status = "cancelled"; registration.refundStatus = "pending"; registration.refundId = "refund-one"; registration.paymentStatus = "refund_pending";
            const body = JSON.stringify({ event: "refund.processed", payload: { refund: { entity: { ...refund(), status: "processed" } } } });
            assert.equal((await sendWebhook(body)).status, 401);
            assert.equal((await sendWebhook(body, "0".repeat(64))).status, 400);
            assert.equal(registration.paymentStatus, "refund_pending");
            const mismatched = JSON.stringify({ event: "refund.processed", payload: { refund: { entity: { ...refund(), status: "processed", amount: 1 } } } });
            assert.equal((await sendWebhook(mismatched, createHmac("sha256", "fake-webhook-secret").update(mismatched).digest("hex"))).status, 400);
            assert.equal(registration.paymentStatus, "refund_pending");
            const signature = createHmac("sha256", "fake-webhook-secret").update(body).digest("hex");
            assert.equal((await sendWebhook(body, signature)).status, 200);
            assert.equal(registration.paymentStatus, "refunded");
            const messageCount = messages.length;
            assert.equal((await sendWebhook(body, signature)).status, 200);
            assert.equal(messages.length, messageCount);
            const failed = JSON.stringify({ event: "refund.failed", payload: { refund: { entity: { ...refund(), status: "failed" } } } });
            assert.equal((await sendWebhook(failed, createHmac("sha256", "fake-webhook-secret").update(failed).digest("hex"))).status, 200);
            assert.equal(registration.paymentStatus, "refunded");
        });
    } finally {
        for (const restore of restores.reverse()) restore();
        if (previousDatabase === undefined) delete process.env.DATABASE_URL; else process.env.DATABASE_URL = previousDatabase;
    }
});