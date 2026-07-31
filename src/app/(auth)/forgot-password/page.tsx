"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    setSent(true);
    setLoading(false);
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

        {sent ? (
          <div className="bg-surface border border-border rounded-sm p-6 sm:p-8 text-center space-y-4">
            <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-8 h-8 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="font-heading text-xl font-bold">Check your email</h2>
            <p className="text-sm text-muted">
              If an account exists for <strong className="text-foreground">{email}</strong>, we&apos;ve sent a password reset link.
            </p>
            <p className="text-xs text-muted">
              Note: In development, check the server console for the reset link.
            </p>
            <Link href="/login" className="text-orange hover:underline text-sm font-medium block mt-4">
              Back to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-surface border border-border rounded-sm p-6 sm:p-8 space-y-5">
            <p className="text-sm text-muted">
              Enter your email address and we&apos;ll send you a link to reset your password.
            </p>
            <Input
              id="email"
              label="Email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Button type="submit" size="md" className="w-full" loading={loading}>
              Send Reset Link
            </Button>
          </form>
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
