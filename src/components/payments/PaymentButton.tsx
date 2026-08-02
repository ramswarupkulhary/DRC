"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { CreditCard, CheckCircle2 } from "lucide-react";

interface PaymentButtonProps {
  type: "ride" | "training" | "membership" | "order";
  itemId: string;
  amount: number;
  itemName: string;
  couponCode?: string;
  metadata?: Record<string, string>;
  onSuccess?: (paymentId: string) => void;
  className?: string;
  disabled?: boolean;
}

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => { open: () => void };
  }
}

export function PaymentButton({ type, itemId, amount, itemName, couponCode, metadata, onSuccess, className, disabled }: PaymentButtonProps) {
  const [loading, setLoading] = useState(false);
  const [paid, setPaid] = useState(false);

  async function handlePayment() {
    setLoading(true);

    try {
      const orderRes = await fetch("/api/payments/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, itemId, amount, couponCode }),
      });

      if (!orderRes.ok) {
        const err = await orderRes.json();
        alert(err.error || "Failed to create order");
        return;
      }

      const { orderId, amount: finalAmount, key } = await orderRes.json();

      if (!window.Razorpay) {
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.async = true;
        await new Promise((resolve, reject) => {
          script.onload = resolve;
          script.onerror = reject;
          document.body.appendChild(script);
        });
      }

      const options = {
        key,
        amount: finalAmount * 100,
        currency: "INR",
        name: "Dirt Ride Camp",
        description: itemName,
        order_id: orderId,
        theme: { color: "#E8622C" },
        handler: async (response: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => {
          const verifyRes = await fetch("/api/payments/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              ...response,
              type,
              itemId,
              couponCode,
              metadata,
            }),
          });

          if (verifyRes.ok) {
            setPaid(true);
            const data = await verifyRes.json();
            onSuccess?.(data.paymentId);
          } else {
            alert("Payment verification failed. Please contact support.");
          }
        },
        prefill: {},
        notes: { type, itemId },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch {
      alert("Payment failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (paid) {
    return (
      <Button size="lg" className={className} disabled>
        <CheckCircle2 className="w-5 h-5" />
        Payment Successful
      </Button>
    );
  }

  return (
    <Button size="lg" className={className} onClick={handlePayment} loading={loading} disabled={disabled}>
      <CreditCard className="w-5 h-5" />
      Pay ₹{amount.toLocaleString("en-IN")}
    </Button>
  );
}
