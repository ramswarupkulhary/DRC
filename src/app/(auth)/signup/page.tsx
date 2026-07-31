"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Signup failed.");
        setLoading(false);
        return;
      }

      const signInRes = await signIn("credentials", {
        email: form.email,
        password: form.password,
        redirect: false,
      });

      if (signInRes?.ok) {
        router.push("/profile");
        router.refresh();
      }
    } catch {
      setError("Something went wrong.");
    } finally {
      setLoading(false);
    }
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
          <p className="text-muted mt-2">Create your rider account</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-surface border border-border rounded-sm p-6 sm:p-8 space-y-5">
          {error && (
            <div className="bg-error/10 border border-error/30 text-error text-sm p-3 rounded-sm">
              {error}
            </div>
          )}

          <Input id="name" label="Full Name" placeholder="Your name" value={form.name} onChange={(e) => update("name", e.target.value)} required />
          <Input id="email" label="Email" type="email" placeholder="you@example.com" value={form.email} onChange={(e) => update("email", e.target.value)} required />
          <Input id="phone" label="Phone" type="tel" placeholder="+91 ..." value={form.phone} onChange={(e) => update("phone", e.target.value)} />
          <Input id="password" label="Password" type="password" placeholder="Min 6 characters" value={form.password} onChange={(e) => update("password", e.target.value)} required minLength={6} />

          <Button type="submit" size="md" className="w-full" loading={loading}>
            Create Account
          </Button>
        </form>

        <p className="text-center text-sm text-muted">
          Already have an account?{" "}
          <Link href="/login" className="text-orange hover:underline font-medium">
            Log In
          </Link>
        </p>
      </div>
    </div>
  );
}
