"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

interface Props {
  rideId: string;
  rideSlug: string;
  soldOut: boolean;
}

export function RegisterButton({ rideId, rideSlug, soldOut }: Props) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleRegister() {
    if (status !== "authenticated") {
      router.push(`/login?redirect=/rides/${rideSlug}`);
      return;
    }

    setLoading(true);
    setError("");

    const res = await fetch("/api/registrations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rideId }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      if (data.code === "EMERGENCY_CONTACT_REQUIRED") {
        router.push("/profile?section=emergency");
        return;
      }
      setError(data.error || "Registration failed");
      return;
    }

    setSuccess(true);
    setTimeout(() => router.push("/my-registrations"), 1500);
  }

  if (success) {
    return (
      <div className="bg-success/10 border border-success/30 text-success text-sm p-3 rounded-sm text-center">
        Registered successfully! Redirecting...
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Button
        size="lg"
        className="w-full"
        disabled={soldOut}
        loading={loading}
        onClick={handleRegister}
      >
        {soldOut ? "Sold Out" : "Register Now"}
      </Button>
      {error && (
        <p className="text-error text-sm text-center">{error}</p>
      )}
    </div>
  );
}
