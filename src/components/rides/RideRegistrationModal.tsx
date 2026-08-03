"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { X, Upload, Copy, Check, AlertTriangle, CheckCircle2 } from "lucide-react";
import { formatPrice } from "@/lib/utils";

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

const UPI_ID = "ramswarup.kulhary@ybl";

export function RideRegistrationModal({ rideId, rideTitle, ridePrice, onClose, isTraining }: Props) {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [paymentProof, setPaymentProof] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [copied, setCopied] = useState(false);

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
  }, []);

  const copyUpi = useCallback(() => {
    navigator.clipboard.writeText(UPI_ID);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, []);

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

  async function handleSubmit() {
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

  const hasEmergency = !!(profile?.emergencyName && profile?.emergencyPhone);

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
              <h4 className="font-heading text-xl font-bold">Registered Successfully!</h4>
              <p className="text-sm text-muted">Redirecting to your registrations...</p>
            </div>
          )}

          {!loading && !success && profile && !hasEmergency && (
            <div className="text-center space-y-4 py-6">
              <AlertTriangle className="w-16 h-16 text-orange mx-auto" />
              <h4 className="font-heading text-xl font-bold">Emergency Contact Required</h4>
              <p className="text-sm text-muted">Please update your emergency contact details before registering.</p>
              <Button
                onClick={() => { onClose(); router.push("/profile?section=emergency"); }}
                className="w-full"
              >
                Update Emergency Contact
              </Button>
            </div>
          )}

          {!loading && !success && profile && hasEmergency && (
            <>
              {error && <div className="bg-error/10 border border-error/30 text-error text-sm p-3 rounded-sm">{error}</div>}

              {/* Ride info */}
              <div className="bg-background border border-border rounded-sm p-4">
                <p className="text-xs text-muted uppercase tracking-wider mb-1">{isTraining ? "Training" : "Ride"}</p>
                <h4 className="font-heading text-lg font-bold text-foreground">{rideTitle}</h4>
                <p className="text-orange font-heading text-2xl font-bold mt-1">{formatPrice(ridePrice)}</p>
              </div>

              {/* Rider details */}
              <div className="space-y-3">
                <h5 className="font-heading text-sm font-semibold uppercase tracking-wider text-muted">Rider Details</h5>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Input id="regName" label="Name" value={name} onChange={(e) => setName(e.target.value)} />
                  <Input id="regEmail" label="Email" value={profile.email} disabled />
                  <Input id="regPhone" label="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
                </div>
              </div>

              {/* Emergency contact */}
              <div className="space-y-3">
                <h5 className="font-heading text-sm font-semibold uppercase tracking-wider text-muted">Emergency Contact</h5>
                <div className="bg-background border border-border rounded-sm p-4 grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                  <div>
                    <span className="text-muted text-xs">Name</span>
                    <p className="text-foreground font-medium">{profile.emergencyName}</p>
                  </div>
                  <div>
                    <span className="text-muted text-xs">Phone</span>
                    <p className="text-foreground font-medium">{profile.emergencyPhone}</p>
                  </div>
                  {profile.bloodGroup && (
                    <div>
                      <span className="text-muted text-xs">Blood Group</span>
                      <p className="text-foreground font-medium">{profile.bloodGroup}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Payment */}
              <div className="space-y-3">
                <h5 className="font-heading text-sm font-semibold uppercase tracking-wider text-muted">Payment</h5>
                <div className="bg-background border border-border rounded-sm p-4 space-y-3">
                  <p className="text-sm text-muted">Pay <span className="text-orange font-bold">{formatPrice(ridePrice)}</span> via UPI and upload the screenshot below.</p>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted">UPI ID:</span>
                    <code className="text-orange font-mono text-lg font-bold flex-1">{UPI_ID}</code>
                    <button onClick={copyUpi} className="p-2 text-muted hover:text-orange transition-colors" title="Copy UPI ID">
                      {copied ? <Check className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
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
              </div>

              <Button
                onClick={handleSubmit}
                loading={submitting}
                disabled={!paymentProof}
                className="w-full"
                size="lg"
              >
                Confirm Registration
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
