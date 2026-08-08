"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { X, Upload, Copy, Check, CheckCircle2 } from "lucide-react";
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

  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [upiId, setUpiId] = useState("");
  const [upiUrl, setUpiUrl] = useState("");
  const [qrLoading, setQrLoading] = useState(true);

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

    fetch(`/api/upi-qr?amount=${ridePrice}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.qrDataUrl) {
          setQrDataUrl(data.qrDataUrl);
          setUpiId(data.upiId);
          setUpiUrl(data.upiUrl || "");
        }
      })
      .catch(() => {})
      .finally(() => setQrLoading(false));
  }, [ridePrice]);

  const copyUpi = useCallback(() => {
    navigator.clipboard.writeText(upiId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [upiId]);

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

          {!loading && !success && profile && !hasEmergency && !emergencySaved && (
            <div className="space-y-4">
              <div className="text-center space-y-2 pb-2">
                <h4 className="font-heading text-lg font-bold text-orange">Emergency Contact Required</h4>
                <p className="text-sm text-muted">Fill in your emergency contact details to continue registration.</p>
              </div>

              {error && <div className="bg-error/10 border border-error/30 text-error text-sm p-3 rounded-sm">{error}</div>}

              <div className="space-y-3">
                <Input
                  id="emergName"
                  label="Emergency Contact Name"
                  value={emergencyName}
                  onChange={(e) => setEmergencyName(e.target.value)}
                  required
                  placeholder="Full name"
                />
                <Input
                  id="emergPhone"
                  label="Emergency Contact Phone"
                  value={emergencyPhone}
                  onChange={(e) => setEmergencyPhone(e.target.value)}
                  required
                  placeholder="Phone number"
                />
                <div>
                  <label className="text-sm font-medium text-foreground block mb-1.5">Blood Group</label>
                  <select
                    value={bloodGroup}
                    onChange={(e) => setBloodGroup(e.target.value)}
                    className="w-full px-3 py-2 bg-background border border-border rounded-sm text-sm text-foreground focus:border-orange focus:outline-none"
                  >
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
                <p className="text-orange font-heading text-2xl font-bold mt-1">{formatPrice(ridePrice)}</p>
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

                <div className="bg-background border border-border rounded-sm p-4 space-y-4">
                  <p className="text-sm text-muted">Pay <span className="text-orange font-bold">{formatPrice(ridePrice)}</span> via UPI, then upload the screenshot below.</p>

                  {upiUrl && (
                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-muted uppercase tracking-wider">Pay directly via app</p>
                      <div className="grid grid-cols-2 gap-2">
                        <a href={upiUrl} className="flex items-center justify-center gap-2 px-3 py-2.5 bg-surface border border-border rounded-sm text-sm font-medium text-foreground hover:border-orange/50 transition-colors">
                          <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/f/f2/Google_Pay_Logo.svg/512px-Google_Pay_Logo.svg.png" alt="GPay" className="w-5 h-5 object-contain" />
                          Google Pay
                        </a>
                        <a href={upiUrl} className="flex items-center justify-center gap-2 px-3 py-2.5 bg-surface border border-border rounded-sm text-sm font-medium text-foreground hover:border-orange/50 transition-colors">
                          <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/Paytm_Logo_%28standalone%29.svg/512px-Paytm_Logo_%28standalone%29.svg.png" alt="Paytm" className="w-5 h-5 object-contain" />
                          Paytm
                        </a>
                        <a href={upiUrl} className="flex items-center justify-center gap-2 px-3 py-2.5 bg-surface border border-border rounded-sm text-sm font-medium text-foreground hover:border-orange/50 transition-colors">
                          <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/7/71/PhonePe_Logo.svg/512px-PhonePe_Logo.svg.png" alt="PhonePe" className="w-5 h-5 object-contain" />
                          PhonePe
                        </a>
                        <a href={upiUrl} className="flex items-center justify-center gap-2 px-3 py-2.5 bg-surface border border-border rounded-sm text-sm font-medium text-foreground hover:border-orange/50 transition-colors">
                          <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/UPI-Logo-vector.svg/512px-UPI-Logo-vector.svg.png" alt="UPI" className="w-5 h-5 object-contain" />
                          Other UPI
                        </a>
                      </div>
                      <p className="text-[10px] text-muted text-center">Tap a button above to open the app directly on mobile</p>
                    </div>
                  )}

                  <div className="border-t border-border pt-4">
                    <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-3">Or scan QR code</p>

                  {qrLoading ? (
                    <div className="flex justify-center py-6">
                      <div className="w-[200px] h-[200px] bg-surface-lighter animate-pulse rounded-sm" />
                    </div>
                  ) : qrDataUrl ? (
                    <div className="flex flex-col items-center gap-3">
                      <div className="bg-white p-3 rounded-lg">
                        <img src={qrDataUrl} alt="UPI QR Code" className="w-[220px] h-[220px]" />
                      </div>
                      <p className="text-xs text-muted">Scan with any UPI app (GPay, PhonePe, Paytm, etc.)</p>
                    </div>
                  ) : null}
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-border">
                    <span className="text-xs text-muted">UPI ID:</span>
                    <code className="text-orange font-mono text-sm font-bold flex-1">{upiId || "ramswarup.kulhary@ybl"}</code>
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
