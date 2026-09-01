"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { X, Upload, CheckCircle2 } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { CouponInput, type AppliedCoupon } from "@/components/payments/CouponInput";

interface Props {
  rideId: string;
  rideTitle: string;
  ridePrice: number;
  onClose: () => void;
  isTraining?: boolean;
}

interface Profile {
  name: string;
  email: string;
  phone: string;
  emergencyName: string | null;
  emergencyPhone: string | null;
  bloodGroup: string | null;
}

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => { open: () => void };
  }
}

export function RideRegistrationModal({ rideId, rideTitle, ridePrice, onClose, isTraining }: Props) {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [razorpayEnabled, setRazorpayEnabled] = useState<boolean | null>(null);
  const [upiIntentUrls, setUpiIntentUrls] = useState<Record<string, string>>({});
  const [paymentProof, setPaymentProof] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [effectiveAmount, setEffectiveAmount] = useState(ridePrice);
  const [coupon, setCoupon] = useState<AppliedCoupon | null>(null);
  const payable = coupon?.finalAmount ?? effectiveAmount;

  const [emergencyName, setEmergencyName] = useState("");
  const [emergencyPhone, setEmergencyPhone] = useState("");
  const [bloodGroup, setBloodGroup] = useState("");
  const [savingEmergency, setSavingEmergency] = useState(false);
  const [emergencySaved, setEmergencySaved] = useState(false);

  const hasEmergency = !!(profile?.emergencyName && profile?.emergencyPhone);

  useEffect(() => {
    fetch("/api/profile")
      .then((r) => r.json())
      .then((data) => {
        setProfile(data);
        setName(data.name || "");
        setPhone(data.phone || "");
      })
      .catch(() => setError("Failed to load profile"))
      .finally(() => setLoading(false));

    // Get the authoritative price (early-bird + member discount) for this user,
    // then load the payment config with that exact amount for UPI intents.
    const type = isTraining ? "training" : "ride";
    fetch(`/api/payments/quote?type=${type}&itemId=${rideId}`)
      .then((r) => r.json())
      .then((q) => {
        const amt = typeof q.finalAmount === "number" ? q.finalAmount : ridePrice;
        setEffectiveAmount(amt);
        return fetch(`/api/payment-config?amount=${amt}`);
      })
      .catch(() => fetch(`/api/payment-config?amount=${ridePrice}`))
      .then((r) => r?.json())
      .then((data) => {
        if (!data) return;
        setRazorpayEnabled(data.razorpayEnabled);
        if (!data.razorpayEnabled && data.upiIntentUrls) {
          setUpiIntentUrls(data.upiIntentUrls);
        }
      })
      .catch(() => setRazorpayEnabled(false));
  }, [ridePrice, rideId, isTraining]);

  async function saveEmergencyContact() {
    if (!emergencyName.trim() || !emergencyPhone.trim()) {
      setError("Emergency contact name and phone are required.");
      return;
    }
    setSavingEmergency(true);
    setError("");
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          emergencyName: emergencyName.trim(),
          emergencyPhone: emergencyPhone.trim(),
          bloodGroup: bloodGroup || null,
        }),
      });
      if (res.ok) {
        setProfile((prev) => prev ? {
          ...prev,
          emergencyName: emergencyName.trim(),
          emergencyPhone: emergencyPhone.trim(),
          bloodGroup: bloodGroup || null,
        } : prev);
        setEmergencySaved(true);
      } else {
        setError("Failed to save emergency contact.");
      }
    } catch {
      setError("Failed to save emergency contact.");
    } finally {
      setSavingEmergency(false);
    }
  }

  const handleRazorpay = useCallback(async () => {
    setPaying(true);
    setError("");

    try {
      const orderRes = await fetch("/api/payments/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: isTraining ? "training" : "ride",
          itemId: rideId,
          amount: ridePrice,
          couponCode: coupon?.code ?? null,
        }),
      });

      if (!orderRes.ok) {
        const err = await orderRes.json();
        setError(err.error || "Failed to create payment order");
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
        description: rideTitle,
        order_id: orderId,
        theme: { color: "#E8622C" },
        handler: async (response: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => {
          const verifyRes = await fetch("/api/payments/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              ...response,
              type: isTraining ? "training" : "ride",
              itemId: rideId,
              couponCode: coupon?.code ?? null,
            }),
          });

          if (verifyRes.ok) {
            setSuccess(true);
            setTimeout(() => {
              onClose();
              router.push("/my-registrations");
            }, 1500);
          } else {
            setError("Payment verification failed. Contact support.");
          }
        },
        prefill: {
          name: name || profile?.name || "",
          email: profile?.email || "",
          contact: phone || profile?.phone || "",
        },
        notes: { type: isTraining ? "training" : "ride", itemId: rideId },
        modal: {
          ondismiss: () => setPaying(false),
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch {
      setError("Payment failed. Please try again.");
      setPaying(false);
    }
  }, [rideId, rideTitle, ridePrice, isTraining, name, phone, profile, coupon, onClose, router]);

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
      setError("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  }, []);

  async function handleManualSubmit() {
    setSubmitting(true);
    setError("");
    const res = await fetch("/api/registrations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(isTraining ? { trainingId: rideId, paymentProof } : { rideId, paymentProof }),
    });
    const data = await res.json();
    setSubmitting(false);
    if (!res.ok) {
      setError(data.error || "Registration failed");
      return;
    }
    setSuccess(true);
    setTimeout(() => {
      onClose();
      router.push("/my-registrations");
    }, 1500);
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-surface border border-border rounded-sm w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-border sticky top-0 bg-surface z-10">
          <h3 className="font-heading text-lg font-semibold text-foreground">{isTraining ? "Training" : "Ride"} Registration</h3>
          <button onClick={onClose} className="p-1 text-muted hover:text-foreground transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 py-6 space-y-6">
          {loading && <div className="text-center text-muted py-8">Loading...</div>}

          {!loading && success && (
            <div className="text-center space-y-3 py-6">
              <CheckCircle2 className="w-16 h-16 text-success mx-auto" />
              <h4 className="font-heading text-xl font-bold">{razorpayEnabled ? "Payment Successful!" : "Registered Successfully!"}</h4>
              <p className="text-sm text-muted">{razorpayEnabled ? "Your registration is confirmed." : "Admin will verify your payment."} Redirecting...</p>
            </div>
          )}

          {!loading && !success && profile && !hasEmergency && !emergencySaved && (
            <div className="space-y-4">
              <div className="text-center space-y-2 pb-2">
                <h4 className="font-heading text-lg font-bold text-orange">Emergency Contact Required</h4>
                <p className="text-sm text-muted">Fill in your emergency contact details to continue registration.</p>
              </div>

              {error && <div className="bg-error/10 border border-error/30 text-error text-sm p-3 rounded-sm">{error}</div>}

              <div className="space-y-3">
                <Input id="emergName" label="Emergency Contact Name" value={emergencyName} onChange={(e) => setEmergencyName(e.target.value)} required placeholder="Full name" />
                <Input id="emergPhone" label="Emergency Contact Phone" value={emergencyPhone} onChange={(e) => setEmergencyPhone(e.target.value)} required placeholder="Phone number" />
                <div>
                  <label className="text-sm font-medium text-foreground block mb-1.5">Blood Group</label>
                  <select value={bloodGroup} onChange={(e) => setBloodGroup(e.target.value)} className="w-full px-3 py-2 bg-background border border-border rounded-sm text-sm text-foreground focus:border-orange focus:outline-none">
                    <option value="">Select blood group</option>
                    {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((g) => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>
              </div>

              <Button onClick={saveEmergencyContact} loading={savingEmergency} className="w-full" size="lg">
                Save & Continue
              </Button>
            </div>
          )}

          {!loading && !success && profile && (hasEmergency || emergencySaved) && (
            <>
              {error && <div className="bg-error/10 border border-error/30 text-error text-sm p-3 rounded-sm">{error}</div>}

              <div className="bg-background border border-border rounded-sm p-4">
                <p className="text-xs text-muted uppercase tracking-wider mb-1">{isTraining ? "Training" : "Ride"}</p>
                <h4 className="font-heading text-lg font-bold text-foreground">{rideTitle}</h4>
                <p className="text-orange font-heading text-2xl font-bold mt-1">{formatPrice(effectiveAmount)}</p>
              </div>

              <div className="space-y-3">
                <h5 className="font-heading text-sm font-semibold uppercase tracking-wider text-muted">Rider Details</h5>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Input id="regName" label="Name" value={name} onChange={(e) => setName(e.target.value)} />
                  <Input id="regEmail" label="Email" value={profile.email} disabled />
                  <Input id="regPhone" label="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
                </div>
              </div>

              <div className="space-y-3">
                <h5 className="font-heading text-sm font-semibold uppercase tracking-wider text-muted">Emergency Contact</h5>
                <div className="bg-background border border-border rounded-sm p-4 grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                  <div>
                    <span className="text-muted text-xs">Name</span>
                    <p className="text-foreground font-medium">{profile.emergencyName || emergencyName}</p>
                  </div>
                  <div>
                    <span className="text-muted text-xs">Phone</span>
                    <p className="text-foreground font-medium">{profile.emergencyPhone || emergencyPhone}</p>
                  </div>
                  {(profile.bloodGroup || bloodGroup) && (
                    <div>
                      <span className="text-muted text-xs">Blood Group</span>
                      <p className="text-foreground font-medium">{profile.bloodGroup || bloodGroup}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <h5 className="font-heading text-sm font-semibold uppercase tracking-wider text-muted">Payment</h5>
                {razorpayEnabled && (
                  <>
                    <CouponInput amount={effectiveAmount} onChange={setCoupon} />
                    {coupon && (
                      <div className="flex items-center justify-between text-sm px-1">
                        <span className="text-muted">Discount applied</span>
                        <span className="text-success">− {formatPrice(coupon.discount)}</span>
                      </div>
                    )}
                  </>
                )}
                <div className="bg-background border border-border rounded-sm p-4 space-y-4">
                  {razorpayEnabled ? (
                    <>
                      <p className="text-sm text-muted">Pay <span className="text-orange font-bold">{formatPrice(payable)}</span> securely via Razorpay. GPay, PhonePe, Paytm, cards, netbanking all supported.</p>
                      <div className="grid grid-cols-2 gap-2">
                        <button onClick={handleRazorpay} disabled={paying} className="flex items-center justify-center gap-2 px-3 py-3 bg-surface border border-border rounded-sm text-sm font-medium text-foreground hover:border-orange/50 transition-colors disabled:opacity-50">
                          <span className="w-6 h-6 rounded-full bg-[#4285F4] flex items-center justify-center text-white text-[11px] font-bold shrink-0">G</span>
                          Google Pay
                        </button>
                        <button onClick={handleRazorpay} disabled={paying} className="flex items-center justify-center gap-2 px-3 py-3 bg-surface border border-border rounded-sm text-sm font-medium text-foreground hover:border-orange/50 transition-colors disabled:opacity-50">
                          <span className="w-6 h-6 rounded-full bg-[#5F259F] flex items-center justify-center text-white text-[10px] font-bold shrink-0">Pe</span>
                          PhonePe
                        </button>
                        <button onClick={handleRazorpay} disabled={paying} className="flex items-center justify-center gap-2 px-3 py-3 bg-surface border border-border rounded-sm text-sm font-medium text-foreground hover:border-orange/50 transition-colors disabled:opacity-50">
                          <span className="w-6 h-6 rounded-full bg-[#00B9F5] flex items-center justify-center text-white text-[10px] font-bold shrink-0">Pt</span>
                          Paytm
                        </button>
                        <button onClick={handleRazorpay} disabled={paying} className="flex items-center justify-center gap-2 px-3 py-3 bg-surface border border-border rounded-sm text-sm font-medium text-foreground hover:border-orange/50 transition-colors disabled:opacity-50">
                          <span className="w-6 h-6 rounded-full bg-[#333] flex items-center justify-center text-white text-[10px] font-bold shrink-0">₹</span>
                          Card / UPI
                        </button>
                      </div>
                      <p className="text-[10px] text-muted text-center">Payments verified instantly via Razorpay. No manual approval needed.</p>
                    </>
                  ) : (
                    <>
                      <p className="text-sm text-muted">Pay <span className="text-orange font-bold">{formatPrice(payable)}</span> via UPI app, then upload screenshot below.</p>
                      <div className="grid grid-cols-2 gap-2">
                        <a href={upiIntentUrls.gpay || "#"} className="flex items-center justify-center gap-2 px-3 py-3 bg-surface border border-border rounded-sm text-sm font-medium text-foreground hover:border-orange/50 transition-colors">
                          <span className="w-6 h-6 rounded-full bg-[#4285F4] flex items-center justify-center text-white text-[11px] font-bold shrink-0">G</span>
                          Google Pay
                        </a>
                        <a href={upiIntentUrls.phonepe || "#"} className="flex items-center justify-center gap-2 px-3 py-3 bg-surface border border-border rounded-sm text-sm font-medium text-foreground hover:border-orange/50 transition-colors">
                          <span className="w-6 h-6 rounded-full bg-[#5F259F] flex items-center justify-center text-white text-[10px] font-bold shrink-0">Pe</span>
                          PhonePe
                        </a>
                        <a href={upiIntentUrls.paytm || "#"} className="flex items-center justify-center gap-2 px-3 py-3 bg-surface border border-border rounded-sm text-sm font-medium text-foreground hover:border-orange/50 transition-colors">
                          <span className="w-6 h-6 rounded-full bg-[#00B9F5] flex items-center justify-center text-white text-[10px] font-bold shrink-0">Pt</span>
                          Paytm
                        </a>
                        <a href={upiIntentUrls.generic || "#"} className="flex items-center justify-center gap-2 px-3 py-3 bg-surface border border-border rounded-sm text-sm font-medium text-foreground hover:border-orange/50 transition-colors">
                          <span className="w-6 h-6 rounded-full bg-[#4CAF50] flex items-center justify-center text-white text-[10px] font-bold shrink-0">₹</span>
                          Other UPI
                        </a>
                      </div>
                      <p className="text-[10px] text-muted text-center">Tap a button to open the app on mobile</p>

                      <div className="border-t border-border pt-4">
                        <label className="text-sm font-medium text-foreground block mb-2">Upload Payment Screenshot <span className="text-error">*</span></label>
                        {paymentProof ? (
                          <div className="space-y-2">
                            <img src={paymentProof} alt="Payment proof" className="w-full max-h-48 object-contain rounded-sm border border-border" />
                            <button onClick={() => setPaymentProof(null)} className="text-xs text-orange hover:underline">Change</button>
                          </div>
                        ) : (
                          <label className={`flex flex-col items-center justify-center w-full h-28 border-2 border-dashed rounded-sm cursor-pointer transition-colors ${uploading ? "border-orange/50 bg-orange/5" : "border-border hover:border-orange/50 hover:bg-surface-lighter"}`}>
                            <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && uploadProof(e.target.files[0])} disabled={uploading} />
                            {uploading ? (
                              <span className="text-xs text-muted">Uploading...</span>
                            ) : (
                              <>
                                <Upload className="w-8 h-8 text-muted" />
                                <span className="text-xs text-muted mt-1">Click to upload payment screenshot</span>
                              </>
                            )}
                          </label>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>

              {!razorpayEnabled && (
                <Button onClick={handleManualSubmit} loading={submitting} disabled={!paymentProof} className="w-full" size="lg">
                  Confirm Registration
                </Button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
