import assert from "node:assert/strict";
import { test } from "node:test";
import { EventRefundError, requestEventRefund, type RefundableEventRegistration } from "./eventRefunds";

const registration: RefundableEventRegistration = { id: "registration-one", amount: 5000, currency: "INR", razorpayPaymentId: "payment-one", razorpayOrderId: "order-one" };

function gateway(options: { payment?: object; refund?: object; failure?: unknown } = {}) {
    let requests = 0;
    const client = {
        payments: {
            fetch: async () => ({ id: "payment-one", status: "captured", amount: 500000, currency: "INR", order_id: "order-one", amount_refunded: 0, ...options.payment }),
            refund: async (paymentId: string, body: { amount: number; notes: { eventRegistrationId: string }; receipt: string }) => {
                requests++;
                assert.equal(paymentId, "payment-one");
                assert.equal(body.amount, 500000);
                assert.equal(body.notes.eventRegistrationId, "registration-one");
                assert.ok(body.receipt.length <= 40);
                if (options.failure) throw options.failure;
                return { id: "refund-one", payment_id: "payment-one", amount: 500000, currency: "INR", status: "pending", ...options.refund };
            },
        }
    } as unknown as Parameters<typeof requestEventRefund>[1];
    return { client, requests: () => requests };
}

test("explicit refund requests use the recorded payment and exact amount", async () => {
    const stub = gateway();
    const refund = await requestEventRefund(registration, stub.client, "admin-one", "Requested by rider");
    assert.equal(refund.status, "pending");
    assert.equal(stub.requests(), 1);
});

test("free, mismatched, uncaptured and already-refunded payments never request a refund", async () => {
    const free = gateway();
    await assert.rejects(requestEventRefund({ ...registration, amount: 0 }, free.client, "admin-one", ""));
    assert.equal(free.requests(), 0);
    for (const payment of [{ id: "other-payment" }, { status: "authorized" }, { amount: 100 }, { currency: "USD" }, { order_id: "other-order" }, { amount_refunded: 100 }]) {
        const stub = gateway({ payment });
        await assert.rejects(requestEventRefund(registration, stub.client, "admin-one", ""));
        assert.equal(stub.requests(), 0);
    }
});

test("network uncertainty is distinguished from a definite gateway rejection", async () => {
    await assert.rejects(requestEventRefund(registration, gateway({ failure: new Error("timeout") }).client, "admin-one", ""), (error: unknown) => error instanceof EventRefundError && error.uncertain);
    await assert.rejects(requestEventRefund(registration, gateway({ failure: { statusCode: 400 } }).client, "admin-one", ""), (error: unknown) => error instanceof EventRefundError && !error.uncertain);
    await assert.rejects(requestEventRefund(registration, gateway({ refund: { payment_id: "other-payment" } }).client, "admin-one", ""), (error: unknown) => error instanceof EventRefundError && error.uncertain);
});