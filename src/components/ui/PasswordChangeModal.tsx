"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { X } from "lucide-react";

interface Props {
  onClose: () => void;
}

export function PasswordChangeModal({ onClose }: Props) {
  const { data: session } = useSession();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [currentPassword, setCurrentPassword] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [verificationId, setVerificationId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const email = session?.user?.email || "";

  async function handleVerifyAndSendOtp() {
    if (!currentPassword) {
      setError("Please enter your current password");
      return;
    }
    setLoading(true);
    setError("");

    const verifyRes = await fetch("/api/auth/verify-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword }),
    });

    const verifyData = await verifyRes.json();

    if (!verifyRes.ok) {
      setLoading(false);
      setError(verifyData.error || "Password verification failed");
      return;
    }

    const otpRes = await fetch("/api/auth/otp/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, type: "password_change" }),
    });

    const otpData = await otpRes.json();
    setLoading(false);

    if (!otpRes.ok) {
      setError(otpData.error || "Failed to send verification code");
      return;
    }

    setStep(2);
  }

  async function handleVerifyOtp() {
    if (!otpCode || otpCode.length !== 6) {
      setError("Please enter the 6-digit code");
      return;
    }
    setLoading(true);
    setError("");

    const res = await fetch("/api/auth/otp/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, code: otpCode, type: "password_change" }),
    });

    setLoading(false);
    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "Invalid code");
      return;
    }

    setVerificationId(data.verificationId);
    setStep(3);
  }

  async function handleChangePassword() {
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    setError("");

    const res = await fetch("/api/auth/change-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword, newPassword, verificationId }),
    });

    setLoading(false);
    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "Failed to change password");
      return;
    }

    setSuccess(true);
    setTimeout(onClose, 2000);
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-surface border border-border rounded-sm w-full max-w-md overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h3 className="font-heading text-lg font-semibold text-foreground">Update Password</h3>
          <button onClick={onClose} className="p-1 text-muted hover:text-foreground transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 py-6 space-y-4">
          {/* Step indicator */}
          <div className="flex items-center gap-2 mb-2">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${step >= s ? "bg-orange text-white" : "bg-surface-lighter text-muted"}`}>
                  {s}
                </div>
                {s < 3 && <div className={`w-8 h-0.5 ${step > s ? "bg-orange" : "bg-border"}`} />}
              </div>
            ))}
          </div>

          {error && <div className="bg-error/10 border border-error/30 text-error text-sm p-3 rounded-sm">{error}</div>}
          {success && <div className="bg-success/10 border border-success/30 text-success text-sm p-3 rounded-sm">Password changed successfully!</div>}

          {step === 1 && !success && (
            <>
              <p className="text-sm text-muted">Enter your current password to verify your identity.</p>
              <Input
                id="currentPw"
                label="Current Password"
                type="password"
                value={currentPassword}
                onChange={(e) => { setCurrentPassword(e.target.value); setError(""); }}
                required
              />
              <Button onClick={handleVerifyAndSendOtp} loading={loading} className="w-full">
                Verify & Send Code
              </Button>
            </>
          )}

          {step === 2 && !success && (
            <>
              <p className="text-sm text-muted">Enter the 6-digit code sent to <strong className="text-foreground">{email}</strong></p>
              <Input
                id="otpCode"
                label="Verification Code"
                value={otpCode}
                onChange={(e) => { setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6)); setError(""); }}
                placeholder="000000"
                className="text-center text-2xl tracking-[0.5em] font-mono"
                required
              />
              <Button onClick={handleVerifyOtp} loading={loading} className="w-full">
                Verify Code
              </Button>
            </>
          )}

          {step === 3 && !success && (
            <>
              <p className="text-sm text-muted">Set your new password.</p>
              <Input
                id="newPw"
                label="New Password"
                type="password"
                value={newPassword}
                onChange={(e) => { setNewPassword(e.target.value); setError(""); }}
                required
              />
              <Input
                id="confirmPw"
                label="Confirm New Password"
                type="password"
                value={confirmPassword}
                onChange={(e) => { setConfirmPassword(e.target.value); setError(""); }}
                required
              />
              <Button onClick={handleChangePassword} loading={loading} className="w-full">
                Change Password
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
