import { createHash } from "node:crypto";
import type Razorpay from "razorpay";

export interface RefundableEventRegistration {
    id: string;
    amount: number;
    currency: string;
    razorpayPaymentId: string | null;
    razorpayOrderId: string | null;
}

export class EventRefundError extends Error {
    constructor(message: string, public readonly uncertain = false) {
        super(message);
    }
}

export async function requestEventRefund(registration: RefundableEventRegistration, gateway: Pick<Razorpay, "payments">, adminId: string, reason: string) {
    if (!registration.razorpayPaymentId || registration.amount <= 0) throw new EventRefundError("A paid Razorpay payment is required for a refund.");
    const amount = Math.round(registration.amount * 100);
    const payment = await gateway.payments.fetch(registration.razorpayPaymentId);
    if (payment.id !== registration.razorpayPaymentId || payment.status !== "captured" || payment.currency !== registration.currency || Number(payment.amount) !== amount || (registration.razorpayOrderId && payment.order_id !== registration.razorpayOrderId)) {
        throw new EventRefundError("The gateway payment does not match this registration. No refund was requested.");
    }
    if (Number(payment.amount_refunded || 0) !== 0) throw new EventRefundError("This payment already has a refund. Check it in Razorpay before continuing.");
    let refund;
    try {
        refund = await gateway.payments.refund(registration.razorpayPaymentId, {
            amount,
            speed: "normal",
            receipt: `event-${createHash("sha256").update(registration.id).digest("hex").slice(0, 28)}`,
            notes: { eventRegistrationId: registration.id, adminId, reason: reason.slice(0, 250) || "Admin explicitly requested cancellation with refund" },
        });
    } catch (error) {
        const statusCode = typeof error === "object" && error !== null && "statusCode" in error ? Number(error.statusCode) : 0;
        throw new EventRefundError(statusCode >= 400 && statusCode < 500
            ? "Razorpay rejected the refund request. The payment record is unchanged."
            : "The refund result is uncertain. Check Razorpay before attempting another refund.", !(statusCode >= 400 && statusCode < 500));
    }
    if (!refund.id || refund.payment_id !== registration.razorpayPaymentId || Number(refund.amount) !== amount || refund.currency !== registration.currency) {
        throw new EventRefundError("The refund response did not match this registration. Check Razorpay before continuing.", true);
    }
    if (refund.status === "failed") throw new EventRefundError("Razorpay reports this refund failed. Check the payment in Razorpay before continuing.", true);
    if (!["pending", "processed"].includes(refund.status)) throw new EventRefundError("Unexpected refund status. Check Razorpay before continuing.", true);
    return refund;
}