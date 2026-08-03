"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { RideRegistrationModal } from "./RideRegistrationModal";
import { MessageCircle } from "lucide-react";

interface Props {
  rideId: string;
  rideSlug: string;
  rideTitle: string;
  ridePrice: number;
  soldOut: boolean;
}

export function RegisterButton({ rideId, rideSlug, rideTitle, ridePrice, soldOut }: Props) {
  const { status: authStatus } = useSession();
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [regStatus, setRegStatus] = useState<{ status: string | null; notes: string | null; whatsappGroupLink: string | null }>({ status: null, notes: null, whatsappGroupLink: null });
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    if (authStatus === "authenticated") {
      setChecking(true);
      fetch(`/api/registrations/status?rideId=${rideId}`)
        .then((r) => r.json())
        .then((data) => setRegStatus(data))
        .finally(() => setChecking(false));
    }
  }, [authStatus, rideId]);

  function handleClick() {
    if (authStatus !== "authenticated") {
      router.push(`/login?redirect=/rides/${rideSlug}`);
      return;
    }
    setShowModal(true);
  }

  if (checking) {
    return <div className="h-12 bg-surface-lighter animate-pulse rounded-sm" />;
  }

  if (regStatus.status && regStatus.status !== "rejected") {
    const statusLabels: Record<string, string> = {
      pending: "Registration Pending",
      confirmed: "Registration Confirmed",
      checked_in: "Checked In",
    };
    const statusColors: Record<string, "warning" | "success"> = {
      pending: "warning",
      confirmed: "success",
      checked_in: "success",
    };
    return (
      <div className="space-y-3 text-center">
        <Badge variant={statusColors[regStatus.status] || "warning"} className="text-base px-4 py-2">
          {statusLabels[regStatus.status] || regStatus.status}
        </Badge>
        <p className="text-xs text-muted">You have already registered for this ride</p>
        {(regStatus.status === "confirmed" || regStatus.status === "checked_in") && regStatus.whatsappGroupLink && (
          <a
            href={regStatus.whatsappGroupLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium bg-[#25D366]/10 text-[#25D366] border border-[#25D366]/20 rounded-sm hover:bg-[#25D366]/20 transition-colors"
          >
            <MessageCircle className="w-4 h-4" />
            Join WhatsApp Group
          </a>
        )}
      </div>
    );
  }

  return (
    <>
      {regStatus.status === "rejected" && (
        <div className="bg-error/10 border border-error/30 rounded-sm p-3 mb-3">
          <p className="text-error text-sm font-semibold">Previous registration was rejected</p>
          {regStatus.notes && <p className="text-error/80 text-xs mt-1">{regStatus.notes}</p>}
        </div>
      )}

      <Button
        size="lg"
        className="w-full"
        disabled={soldOut}
        onClick={handleClick}
      >
        {soldOut ? "Sold Out" : "Register Now"}
      </Button>

      {showModal && (
        <RideRegistrationModal
          rideId={rideId}
          rideTitle={rideTitle}
          ridePrice={ridePrice}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
}
