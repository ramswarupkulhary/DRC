import assert from "node:assert/strict";
import { test } from "node:test";
import { createRequire } from "node:module";
import { createHmac } from "node:crypto";

const loadModule = createRequire(`${process.cwd()}/package.json`);

test("admin deletion removes entries from working lists without refunds or audit destruction", async (context) => {
    const previousDatabase = process.env.DATABASE_URL;
    process.env.DATABASE_URL ||= "postgresql://test:test@localhost:5432/test";
    let session: { user: { id: string; role: string } } | null = { user: { id: "admin-one", role: "admin" } };
    const auth = loadModule("next-auth/next") as { getServerSession: (...args: unknown[]) => Promise<unknown> };
    context.mock.method(auth, "getServerSession", async () => session);
    const api = loadModule("razorpay/dist/api") as { prototype: { post: (...args: unknown[]) => Promise<unknown> } };
    let financialCalls = 0;
    context.mock.method(api.prototype, "post", async () => { financialCalls++; throw new Error("Deletion must not call a financial API"); });
    const fixture = () => ({ id: "entry-one", eventSlug: "event-one", status: "active", deletedAt: null as Date | null, deletedById: null as string | null, refundStatus: null as string | null, paymentStatus: "paid", amount: 5000, razorpayPaymentId: "payment-one", cancelledAt: null, cancelledById: null, cancellationReason: null });
    let event = fixture();
    let registration = fixture();
    let program = fixture();
    let writes = 0;
    let concurrentRefund = false;
    const restores: (() => void)[] = [];
    function stub(delegate: object, method: string, implementation: (...args: unknown[]) => unknown) {
        const target = delegate as Record<string, unknown>;
        const original = target[method];
        target[method] = implementation;
        restores.push(() => { target[method] = original; });
    }
    function inspectDeletion(data: Record<string, unknown>) {
        assert.equal(data.deletedById, "admin-one");
        assert.ok(data.deletedAt instanceof Date);
        assert.equal(data.status, "cancelled");
        for (const key of ["paymentStatus", "amount", "razorpayPaymentId", "paymentId", "refundStatus", "refundId"]) assert.equal(Object.hasOwn(data, key), false);
    }
    function reset() {
        event = fixture(); registration = fixture(); program = fixture(); writes = 0; concurrentRefund = false;
        session = { user: { id: "admin-one", role: "admin" } };
    }
    try {
        const { prisma } = await import("./prisma");
        const eventRoute = await import("../app/api/admin/event-registrations/[id]/route");
        const registrationRoute = await import("../app/api/admin/registrations/[id]/route");
        const programRoute = await import("../app/api/admin/program-bookings/[id]/route");
        const documentRoute = await import("../app/api/admin/events/[id]/documents/route");
        const paymentVerification = await import("../app/api/payments/verify/route");
        const programVerification = await import("../app/api/programs/verify/route");
        stub(prisma.eventRegistration, "findFirst", async (args) => {
            const where = (args as { where: { id: string; eventSlug: string } }).where;
            return where.id === event.id && where.eventSlug === event.eventSlug ? { ...event } : null;
        });
        stub(prisma.eventRegistration, "updateMany", async (args) => {
            const { where, data } = args as { where: { deletedAt: null; OR: unknown[] }; data: Record<string, unknown> };
            assert.equal(where.deletedAt, null);
            assert.ok(where.OR.length > 0);
            if (concurrentRefund) event.refundStatus = "processing";
            if (event.deletedAt || ["processing", "unknown", "pending"].includes(event.refundStatus || "")) return { count: 0 };
            inspectDeletion(data); writes++;
            event = { ...event, ...data };
            return { count: 1 };
        });
        stub(prisma.registration, "findUnique", async () => ({ ...registration }));
        stub(prisma.registration, "updateMany", async (args) => {
            const { where, data } = args as { where: { deletedAt: null }; data: Record<string, unknown> };
            assert.equal(where.deletedAt, null); inspectDeletion(data); writes++;
            registration = { ...registration, ...data };
            return { count: 1 };
        });
        stub(prisma.programBooking, "findUnique", async () => ({ ...program }));
        stub(prisma.programBooking, "updateMany", async (args) => {
            const { where, data } = args as { where: { deletedAt: null }; data: Record<string, unknown> };
            assert.equal(where.deletedAt, null); inspectDeletion(data); writes++;
            program = { ...program, ...data };
            return { count: 1 };
        });
        const params = { params: Promise.resolve({ id: "entry-one" }) };
        const req = (body: object) => new Request("https://example.com", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });

        await context.test("deletion requires admin authorization, confirmation and the correct event", async () => {
            reset(); session = null;
            assert.equal((await eventRoute.DELETE(req({ confirmDelete: true, eventSlug: "event-one" }), params)).status, 403);
            reset();
            assert.equal((await eventRoute.DELETE(req({ eventSlug: "event-one" }), params)).status, 400);
            assert.equal((await eventRoute.DELETE(req({ confirmDelete: true, eventSlug: "another-event" }), params)).status, 404);
            session = { user: { id: "rider-one", role: "rider" } };
            assert.equal((await registrationRoute.DELETE(req({ confirmDelete: true }), params)).status, 403);
            assert.equal((await programRoute.DELETE(req({ confirmDelete: true }), params)).status, 403);
            assert.equal(writes, 0);
        });

        await context.test("event and spectator entries are removed idempotently, with payment data unchanged", async () => {
            reset();
            const response = await eventRoute.DELETE(req({ confirmDelete: true, eventSlug: "event-one" }), params);
            assert.equal(response.status, 200);
            assert.equal((await response.json()).refundIssued, false);
            assert.ok(event.deletedAt instanceof Date);
            assert.equal(event.paymentStatus, "paid");
            assert.equal(event.amount, 5000);
            assert.equal(event.razorpayPaymentId, "payment-one");
            assert.equal((await eventRoute.DELETE(req({ confirmDelete: true, eventSlug: "event-one" }), params)).status, 200);
            assert.equal(writes, 1);
        });

        await context.test("ride/training and program deletion preserve payment records", async () => {
            reset();
            assert.equal((await registrationRoute.DELETE(req({ confirmDelete: true }), params)).status, 200);
            assert.equal((await programRoute.DELETE(req({ confirmDelete: true }), params)).status, 200);
            assert.ok(registration.deletedAt instanceof Date);
            assert.ok(program.deletedAt instanceof Date);
            assert.equal(registration.paymentStatus, "paid");
            assert.equal(program.paymentStatus, "paid");
            assert.equal(writes, 2);
        });

        await context.test("pending refunds and concurrent refund claims prevent deletion", async () => {
            for (const status of ["processing", "unknown", "pending"]) {
                reset(); event.refundStatus = status;
                assert.equal((await eventRoute.DELETE(req({ confirmDelete: true, eventSlug: "event-one" }), params)).status, 409);
                assert.equal(event.deletedAt, null);
            }
            reset(); concurrentRefund = true;
            assert.equal((await eventRoute.DELETE(req({ confirmDelete: true, eventSlug: "event-one" }), params)).status, 409);
            assert.equal(event.deletedAt, null);
            assert.equal(writes, 0);
            assert.equal(financialCalls, 0);
        });

        await context.test("replayed payment callbacks cannot recreate deleted registrations or program bookings", async () => {
            reset();
            stub(prisma.siteSetting, "findUnique", async () => ({ value: "deletion-test-secret" }));
            stub(prisma.registration, "findFirst", async () => ({ ...registration, deletedAt: new Date(), userId: "admin-one", rideId: "ride-one" }));
            stub(prisma.programBooking, "findFirst", async () => ({ ...program, deletedAt: new Date(), userId: "admin-one", programSlug: "program-one" }));
            const signature = createHmac("sha256", "deletion-test-secret").update("order-one|payment-one").digest("hex");
            const body = { razorpay_order_id: "order-one", razorpay_payment_id: "payment-one", razorpay_signature: signature, type: "ride", itemId: "ride-one", programSlug: "program-one" };
            const verify = () => new Request("https://example.com", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
            assert.equal((await paymentVerification.POST(verify())).status, 409);
            assert.equal((await programVerification.POST(verify())).status, 409);
            assert.equal(financialCalls, 0);
        });

        await context.test("the upload endpoint accepts a real 12 MB multipart PDF", async () => {
            reset();
            stub(prisma.event, "findUnique", async () => ({ id: "event-one" }));
            const content = Buffer.alloc(12 * 1024 * 1024);
            content.write("%PDF-1.7\n");
            stub(prisma.eventDocument, "create", async (args) => {
                const data = (args as { data: { content: Uint8Array; size: number; displayText: string } }).data;
                assert.equal(data.content.byteLength, content.byteLength);
                assert.equal(data.size, content.byteLength);
                assert.equal(data.displayText, "Full Race Brief");
                return { id: "document-one" };
            });
            const form = new FormData();
            form.set("displayText", "Full Race Brief");
            form.set("file", new File([content], "brief.pdf", { type: "application/pdf" }));
            const response = await documentRoute.POST(new Request("https://example.com", { method: "POST", body: form }), { params: Promise.resolve({ id: "event-one" }) });
            assert.equal(response.status, 201);
        });
    } finally {
        for (const restore of restores.reverse()) restore();
        if (previousDatabase === undefined) delete process.env.DATABASE_URL; else process.env.DATABASE_URL = previousDatabase;
    }
});