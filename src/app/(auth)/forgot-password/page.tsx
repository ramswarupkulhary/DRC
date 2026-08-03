"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleSendOtp(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      if (data.notFound) {
        setError("No account found with this email. Please register first.");
      } else {
        setError(data.error || "Something went wrong");
      }
      return;
    }

    setStep(2);
  }

  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
    if (!otp || otp.length !== 6) {
      setError("Please enter the 6-digit code");
      return;
    }
    setStep(3);
  }

  async function handleResetPassword(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, otp, password: newPassword }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || "Failed to reset password");
      return;
    }

    setSuccess(true);
    setTimeout(() => router.push("/login"), 2000);
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="font-heading text-4xl font-bold">
            <span className="text-foreground">D</span>
            <span className="text-orange">R</span>
            <span className="text-foreground">C</span>
          </h1>
          <p className="text-muted mt-2">Reset your password</p>
        </div>

        {success ? (
          <div className="bg-surface border border-border rounded-sm p-6 sm:p-8 text-center space-y-4">
            <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-8 h-8 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="font-heading text-xl font-bold">Password Reset!</h2>
            <p className="text-sm text-muted">Redirecting to login...</p>
          </div>
        ) : (
          <div className="bg-surface border border-border rounded-sm p-6 sm:p-8 space-y-5">
            {/* Step indicator */}
            <div className="flex items-center justify-center gap-2 mb-2">
              {[1, 2, 3].map((s) => (
                <div key={s} className="flex items-center gap-2">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold ${step >= s ? "bg-orange text-white" : "bg-surface-lighter text-muted"}`}>
                    {s}
                  </div>
                  {s < 3 && <div className={`w-6 h-0.5 ${step > s ? "bg-orange" : "bg-border"}`} />}
                </div>
              ))}
            </div>

            {error && <div className="bg-error/10 border border-error/30 text-error text-sm p-3 rounded-sm">{error}</div>}

            {step === 1 && (
              <form onSubmit={handleSendOtp} className="space-y-5">
                <p className="text-sm text-muted">Enter your email address and we&apos;ll send you a verification code.</p>
                <Input
                  id="email"
                  label="Email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(""); }}
                  required
                />
                <Button type="submit" size="md" className="w-full" loading={loading}>
                  Send Verification Code
                </Button>
                {error && error.includes("register") && (
                  <Link href="/signup" className="block text-center text-orange hover:underline text-sm font-medium">
                    Create an Account
                  </Link>
                )}
              </form>
            )}

            {step === 2 && (
              <form onSubmit={handleVerifyOtp} className="space-y-5">
                <p className="text-sm text-muted">Enter the 6-digit code sent to <strong className="text-foreground">{email}</strong></p>
                <Input
                  id="otp"
                  label="Verification Code"
                  value={otp}
                  onChange={(e) => { setOtp(e.target.value.replace(/\D/g, "").slice(0, 6)); setError(""); }}
                  placeholder="000000"
                  className="text-center text-2xl tracking-[0.5em] font-mono"
                  required
                />
                <Button type="submit" size="md" className="w-full">
                  Verify Code
                </Button>
                <button type="button" onClick={() => setStep(1)} className="w-full text-center text-sm text-muted hover:text-orange">
                  Didn&apos;t receive? Try again
                </button>
              </form>
            )}

            {step === 3 && (
              <form onSubmit={handleResetPassword} className="space-y-5">
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
                  label="Confirm Password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => { setConfirmPassword(e.target.value); setError(""); }}
                  required
                />
                <Button type="submit" size="md" className="w-full" loading={loading}>
                  Reset Password
                </Button>
              </form>
            )}
          </div>
        )}

        <p className="text-center text-sm text-muted">
          Remember your password?{" "}
          <Link href="/login" className="text-orange hover:underline font-medium">
            Log In
          </Link>
        </p>
      </div>
    </div>
  );
}
