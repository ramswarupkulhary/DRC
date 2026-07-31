"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Gift } from "lucide-react";

export default function GiftVouchersPage() {
  const [amount, setAmount] = useState("2000");
  const [recipientName, setRecipientName] = useState("");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [voucher, setVoucher] = useState<{ code: string; amount: number } | null>(null);

  const presets = [1000, 2000, 3000, 5000];

  async function handlePurchase(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const res = await fetch("/api/gift-vouchers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount: parseInt(amount),
        recipientName: recipientName || null,
        recipientEmail: recipientEmail || null,
        message: message || null,
      }),
    });

    const data = await res.json();
    setLoading(false);
    if (res.ok) setVoucher(data);
  }

  if (voucher) {
    return (
      <div className="max-w-lg mx-auto px-4 py-12 text-center space-y-6">
        <Gift className="w-16 h-16 text-orange mx-auto" />
        <h2 className="font-heading text-3xl font-bold">Voucher Created!</h2>
        <div className="bg-surface border border-orange/30 rounded-sm p-8">
          <p className="text-muted text-sm">Gift Voucher Code</p>
          <p className="font-heading text-3xl font-bold text-orange mt-2 tracking-wider">{voucher.code}</p>
          <p className="text-muted text-sm mt-4">Value: &#8377;{voucher.amount.toLocaleString("en-IN")}</p>
        </div>
        <p className="text-sm text-muted">Share this code with the recipient. They can apply it during ride/training registration.</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
      <SectionHeader accent="The perfect gift" title="Gift Vouchers" subtitle="Give the gift of adventure. DRC gift vouchers can be used for any ride, training, or merchandise." />

      <form onSubmit={handlePurchase} className="mt-12 space-y-6">
        <div className="bg-surface border border-border rounded-sm p-6 space-y-5">
          <h3 className="font-heading text-lg font-semibold text-tan">Select Amount</h3>
          <div className="grid grid-cols-4 gap-3">
            {presets.map((val) => (
              <button
                key={val}
                type="button"
                onClick={() => setAmount(String(val))}
                className={`py-3 rounded-sm border text-sm font-semibold transition-colors cursor-pointer ${amount === String(val) ? "border-orange bg-orange/10 text-orange" : "border-border hover:border-orange/50"}`}
              >
                &#8377;{val.toLocaleString("en-IN")}
              </button>
            ))}
          </div>
          <Input id="customAmount" label="Or enter custom amount" type="number" min="500" value={amount} onChange={(e) => setAmount(e.target.value)} />
        </div>

        <div className="bg-surface border border-border rounded-sm p-6 space-y-5">
          <h3 className="font-heading text-lg font-semibold text-tan">Recipient Details (Optional)</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Input id="recipientName" label="Recipient Name" value={recipientName} onChange={(e) => setRecipientName(e.target.value)} />
            <Input id="recipientEmail" label="Recipient Email" type="email" value={recipientEmail} onChange={(e) => setRecipientEmail(e.target.value)} />
          </div>
          <Textarea id="message" label="Personal Message" value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Happy birthday! Time to get dirty..." />
        </div>

        <Button type="submit" className="w-full" loading={loading}>
          Purchase Voucher — &#8377;{parseInt(amount || "0").toLocaleString("en-IN")}
        </Button>
      </form>
    </div>
  );
}
