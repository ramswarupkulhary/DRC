"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Check, Package, Shirt, Award, Calendar, Crown, Copy, Upload, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/ui/Animations";
import { CouponInput, type AppliedCoupon } from "@/components/payments/CouponInput";

const SIZES = ["S", "M", "L", "XL", "XXL"] as const;

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => { open: () => void };
  }
}

interface MembershipData {
  membership: {
    id: string;
    planName: string;
    tshirtSize: string | null;
    startDate: string;
    endDate: string;
    status: string;
  } | null;
  plan: {
    id: string;
    name: string;
    price: number;
    duration: number;
    benefits: string[];
    upiId: string;
  } | null;
}

export default function MembershipJoinPage() {
  const { status } = useSession();
  const router = useRouter();
  const [data, setData] = useState<MembershipData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState("");
  const [paymentProof, setPaymentProof] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [coupon, setCoupon] = useState<AppliedCoupon | null>(null);
  const [razorpayEnabled, setRazorpayEnabled] = useState<boolean | null>(null);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login?redirect=/membership");
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/membership/status")
        .then((r) => r.json())
        .then((d) => {
          setData(d);
          setLoading(false);
          if (d?.plan) {
            fetch(`/api/payment-config?amount=${d.plan.price}`)
              .then((r) => r.json())
              .then((c) => {
                setRazorpayEnabled(c.razorpayEnabled);
                if (!c.razorpayEnabled) {
                  fetch(`/api/upi-qr?amount=${d.plan.price}&note=DRC+Membership`)
                    .then((r) => r.json())
                    .then((q) => q.qrDataUrl && setQrCode(q.qrDataUrl))
                    .catch(() => { });
                }
              })
              .catch(() => setRazorpayEnabled(false));
          }
        })
        .catch(() => setLoading(false));
    }
  }, [status]);

  const copyUpi = useCallback(() => {
    if (data?.plan?.upiId) {
      navigator.clipboard.writeText(data.plan.upiId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [data]);

  const uploadProof = useCallback(async (file: File) => {
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      if (!res.ok) throw new Error();
      const { url } = await res.json();
      setPaymentProof(url);
    } catch {
      alert("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  }, []);

  const submitRequest = useCallback(async () => {
    if (!data?.plan || !selectedSize || !paymentProof) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/membership/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId: data.plan.id, tshirtSize: selectedSize, paymentProof }),
      });
      if (!res.ok) {
        const err = await res.json();
        alert(err.error || "Failed to submit");
        return;
      }
      router.refresh();
      window.location.reload();
    } catch {
      alert("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }, [data, selectedSize, paymentProof, router]);

  const handleRazorpayJoin = useCallback(async () => {
    if (!data?.plan || !selectedSize) {
      setError("Please select a T-shirt size first.");
      return;
    }
    setPaying(true);
    setError("");
    try {
      // 100%-off coupon → activate membership directly, no payment.
      if ((coupon?.finalAmount ?? data.plan.price) === 0) {
        const res = await fetch("/api/payments/free-checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type: "membership", itemId: data.plan.id, couponCode: coupon?.code ?? null, metadata: { tshirtSize: selectedSize } }),
        });
        const d = await res.json();
        if (res.ok) {
          window.location.reload();
        } else {
          setError(d.error || "Could not complete booking.");
          setPaying(false);
        }
        return;
      }

      const orderRes = await fetch("/api/payments/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "membership", itemId: data.plan.id, couponCode: coupon?.code ?? null }),
      });
      if (!orderRes.ok) {
        const err = await orderRes.json();
        setError(err.error || "Failed to start payment");
        setPaying(false);
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
        description: `${data.plan.name} Membership`,
        order_id: orderId,
        theme: { color: "#E8622C" },
        handler: async (response: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => {
          const verifyRes = await fetch("/api/payments/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              ...response,
              type: "membership",
              itemId: data.plan!.id,
              metadata: { tshirtSize: selectedSize },
              couponCode: coupon?.code ?? null,
            }),
          });
          if (verifyRes.ok) {
            window.location.reload();
          } else {
            setError("Payment verification failed. Contact support.");
            setPaying(false);
          }
        },
        modal: { ondismiss: () => setPaying(false) },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch {
      setError("Payment failed. Please try again.");
      setPaying(false);
    }
  }, [data, selectedSize, coupon]);

  if (loading || !data) {
    return <div className="min-h-[60vh] flex items-center justify-center text-muted">Loading...</div>;
  }

  if (!data.plan) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 text-center">
        <SectionHeader accent="Coming soon" title="DRC Membership" />
        <p className="text-muted mt-6">Membership plans are being set up. Please check back later.</p>
      </div>
    );
  }

  if (data.membership) {
    const isPending = data.membership.status === "pending";
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        <SectionHeader accent={isPending ? "Request submitted" : "You're in"} title={isPending ? "Pending Approval" : "DRC Member"} align="center" />

        <FadeIn>
          <motion.div className="mt-10 bg-surface border border-orange/30 rounded-sm overflow-hidden" initial={{ scale: 0.95 }} animate={{ scale: 1 }}>
            <div className={`px-6 py-8 text-center text-white ${isPending ? "bg-gradient-to-r from-yellow-600 to-orange" : "bg-gradient-to-r from-orange to-red-600"}`}>
              <Crown className="w-12 h-12 mx-auto mb-3" />
              <h2 className="font-heading text-3xl font-bold">{isPending ? "Awaiting Approval" : "DRC Member"}</h2>
              <p className="text-white/80 mt-1">{isPending ? "Your payment is being verified" : "Welcome to the tribe"}</p>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-background p-4 rounded-sm border border-border">
                  <p className="text-xs text-muted uppercase tracking-wider">Status</p>
                  <Badge variant={isPending ? "orange" : "success"} className="mt-1">{isPending ? "Pending" : "Active"}</Badge>
                </div>
                <div className="bg-background p-4 rounded-sm border border-border">
                  <p className="text-xs text-muted uppercase tracking-wider">T-Shirt Size</p>
                  <p className="font-heading text-xl font-bold text-orange mt-1">{data.membership.tshirtSize || "—"}</p>
                </div>
                {!isPending && (
                  <>
                    <div className="bg-background p-4 rounded-sm border border-border">
                      <p className="text-xs text-muted uppercase tracking-wider">Member Since</p>
                      <p className="text-sm font-semibold mt-1">{new Date(data.membership.startDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p>
                    </div>
                    <div className="bg-background p-4 rounded-sm border border-border">
                      <p className="text-xs text-muted uppercase tracking-wider">Valid Until</p>
                      <p className="text-sm font-semibold mt-1">{new Date(data.membership.endDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p>
                    </div>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        </FadeIn>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
      <SectionHeader accent="Join the tribe" title="DRC Membership" subtitle="Get your welcome kit, exclusive perks, and be part of the DRC community." />

      <div className="mt-12 grid grid-cols-1 lg:grid-cols-5 gap-8">
        <div className="lg:col-span-3 space-y-8">
          <FadeIn>
            <div className="bg-surface border border-border rounded-sm overflow-hidden">
              <div className="bg-gradient-to-br from-orange/20 to-transparent px-6 py-5 border-b border-border">
                <div className="flex items-center gap-3">
                  <Package className="w-6 h-6 text-orange" />
                  <h3 className="font-heading text-xl font-bold">Welcome Kit</h3>
                </div>
                <p className="text-sm text-muted mt-1">Delivered to your doorstep after membership confirmation</p>
              </div>
              <div className="p-6">
                <StaggerContainer className="grid grid-cols-1 sm:grid-cols-3 gap-4" staggerDelay={0.1}>
                  {[
                    { icon: Shirt, label: "DRC T-Shirt", desc: "Premium cotton, exclusive design" },
                    { icon: Award, label: "DRC Badge & Stickers", desc: "Collector's edition merch" },
                    { icon: Calendar, label: "Membership Card", desc: "Your DRC identity" },
                  ].map((item) => (
                    <StaggerItem key={item.label}>
                      <div className="text-center p-4 border border-border rounded-sm bg-background">
                        <item.icon className="w-8 h-8 text-orange mx-auto" />
                        <p className="font-semibold text-sm mt-2">{item.label}</p>
                        <p className="text-xs text-muted mt-1">{item.desc}</p>
                      </div>
                    </StaggerItem>
                  ))}
                </StaggerContainer>
              </div>
            </div>
          </FadeIn>

          <FadeIn delay={0.15}>
            <div className="bg-surface border border-border rounded-sm p-6">
              <h3 className="font-heading text-lg font-semibold mb-4">Member Benefits</h3>
              <ul className="space-y-3">
                {data.plan.benefits.map((benefit, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-success shrink-0 mt-0.5" />
                    <span className="text-sm">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
          </FadeIn>
        </div>

        <div className="lg:col-span-2">
          <FadeIn delay={0.2}>
            <div className="bg-surface border border-orange/30 rounded-sm p-6 sticky top-24 space-y-6">
              <div className="text-center">
                <p className="text-sm text-muted uppercase tracking-wider">Annual Membership</p>
                <div className="mt-2">
                  <span className="font-heading text-5xl font-bold text-orange">&#8377;{data.plan.price.toLocaleString("en-IN")}</span>
                  <span className="text-muted text-sm">/year</span>
                </div>
              </div>

              <div className="border-t border-border pt-5">
                <label className="text-sm font-medium text-foreground block mb-3">Select T-Shirt Size <span className="text-error">*</span></label>
                <div className="flex flex-wrap gap-2">
                  {SIZES.map((size) => (
                    <button key={size} type="button" onClick={() => setSelectedSize(size)} className={`px-4 py-2 rounded-sm text-sm font-semibold border transition-all ${selectedSize === size ? "bg-orange text-white border-orange" : "bg-background border-border text-foreground/70 hover:border-orange/50"}`}>
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {error && <div className="bg-error/10 border border-error/30 text-error text-sm p-3 rounded-sm">{error}</div>}

              {razorpayEnabled ? (
                <div className="border-t border-border pt-5 space-y-4">
                  <CouponInput amount={data.plan.price} onChange={setCoupon} />
                  <p className="text-sm text-muted text-center">
                    Pay <span className="text-orange font-bold">&#8377;{(coupon?.finalAmount ?? data.plan.price).toLocaleString("en-IN")}</span>
                    {coupon && <span className="text-success text-xs ml-1">(saved ₹{coupon.discount.toLocaleString("en-IN")})</span>} securely via Razorpay. GPay, PhonePe, Paytm, cards &amp; netbanking supported. Membership activates instantly.
                  </p>
                  <Button className="w-full" size="lg" disabled={!selectedSize || paying} loading={paying} onClick={handleRazorpayJoin}>
                    {(coupon?.finalAmount ?? data.plan.price) === 0 ? "Join for Free" : "Pay & Join Now"}
                  </Button>
                  <p className="text-xs text-center text-muted">Instant activation. Welcome kit dispatched within 7 working days.</p>
                </div>
              ) : (
                <>
                  <div className="border-t border-border pt-5">
                    <label className="text-sm font-medium text-foreground block mb-3">Pay via UPI</label>
                    <div className="bg-background border border-border rounded-sm p-4 text-center">
                      {qrCode ? (
                        <div className="space-y-3">
                          <img src={qrCode} alt="UPI QR Code" className="w-48 h-48 mx-auto rounded-sm" />
                          <p className="text-xs text-muted">Scan with any UPI app (GPay, PhonePe, Paytm, etc.)</p>
                          <p className="text-xs text-muted">Amount: <strong className="text-orange">₹{data.plan.price.toLocaleString("en-IN")}</strong></p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <p className="text-xs text-muted mb-1">UPI ID</p>
                          <div className="flex items-center justify-center gap-2">
                            <code className="text-orange font-mono text-lg font-bold">{data.plan.upiId}</code>
                            <button onClick={copyUpi} className="p-2 hover:bg-surface-light rounded-sm transition-colors" title="Copy UPI ID">
                              {copied ? <CheckCircle2 className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4 text-muted" />}
                            </button>
                          </div>
                          <p className="text-xs text-muted">Pay ₹{data.plan.price.toLocaleString("en-IN")} using any UPI app</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="border-t border-border pt-5">
                    <label className="text-sm font-medium text-foreground block mb-3">Upload Payment Proof <span className="text-error">*</span></label>
                    {paymentProof ? (
                      <div className="relative">
                        <img src={paymentProof} alt="Payment proof" className="w-full rounded-sm border border-border" />
                        <button onClick={() => setPaymentProof(null)} className="absolute top-2 right-2 p-1 bg-black/70 rounded-full text-white text-xs px-2">Remove</button>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border hover:border-orange/50 rounded-sm cursor-pointer transition-colors">
                        <input type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && uploadProof(e.target.files[0])} className="hidden" />
                        {uploading ? (
                          <div className="flex flex-col items-center gap-2">
                            <div className="w-6 h-6 border-2 border-orange border-t-transparent rounded-full animate-spin" />
                            <span className="text-xs text-muted">Uploading...</span>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center gap-2 text-muted">
                            <Upload className="w-8 h-8" />
                            <span className="text-xs">Upload payment screenshot</span>
                          </div>
                        )}
                      </label>
                    )}
                  </div>

                  <Button className="w-full" size="lg" disabled={!selectedSize || !paymentProof || submitting} loading={submitting} onClick={submitRequest}>
                    Submit Membership Request
                  </Button>

                  <p className="text-xs text-center text-muted">Your request will be verified and approved within 24 hours. Welcome kit dispatched within 7 working days.</p>
                </>
              )}
            </div>
          </FadeIn>
        </div>
      </div>
    </div>
  );
}
