"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { RideRegistrationModal } from "./RideRegistrationModal";

interface Props {
  trainingId: string;
  trainingSlug: string;
  trainingTitle: string;
  trainingPrice: number;
}

export function TrainingRegisterButton({ trainingId, trainingSlug, trainingTitle, trainingPrice }: Props) {
  const { status: authStatus } = useSession();
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [regStatus, setRegStatus] = useState<{ status: string | null; notes: string | null }>({ status: null, notes: null });
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    if (authStatus === "authenticated") {
      setChecking(true);
      fetch(`/api/registrations/status?trainingId=${trainingId}`)
        .then((r) => r.json())
        .then((data) => setRegStatus(data))
        .finally(() => setChecking(false));
    }
  }, [authStatus, trainingId]);

  function handleClick() {
    if (authStatus !== "authenticated") {
      router.push(`/login?redirect=/trainings/${trainingSlug}`);
      return;
    }
    setShowModal(true);
  }

  if (checking) {
    return <div className="h-12 bg-surface-lighter animate-pulse rounded-sm" />;
  }

  if (regStatus.status && regStatus.status !== "rejected") {
    const statusLabels: Record<string, string> = {
      pending: "Enrollment Pending",
      confirmed: "Enrollment Confirmed",
      checked_in: "Checked In",
    };
    const statusColors: Record<string, "warning" | "success"> = {
      pending: "warning",
      confirmed: "success",
      checked_in: "success",
    };
    return (
      <div className="space-y-2 text-center">
        <Badge variant={statusColors[regStatus.status] || "warning"} className="text-base px-4 py-2">
          {statusLabels[regStatus.status] || regStatus.status}
        </Badge>
        <p className="text-xs text-muted">You have already enrolled for this training</p>
      </div>
    );
  }

  return (
    <>
      {regStatus.status === "rejected" && (
        <div className="bg-error/10 border border-error/30 rounded-sm p-3 mb-3">
          <p className="text-error text-sm font-semibold">Previous enrollment was rejected</p>
          {regStatus.notes && <p className="text-error/80 text-xs mt-1">{regStatus.notes}</p>}
        </div>
      )}

      <Button size="lg" className="w-full" onClick={handleClick}>
        Enroll Now
      </Button>

      {showModal && (
        <RideRegistrationModal
          rideId={trainingId}
          rideTitle={trainingTitle}
          ridePrice={trainingPrice}
          onClose={() => setShowModal(false)}
          isTraining
        />
      )}
    </>
  );
}
