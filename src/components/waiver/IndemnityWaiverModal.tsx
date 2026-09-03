"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { X, ShieldCheck, CheckCircle2 } from "lucide-react";

interface Props {
  context: string; // e.g. "Ride: Shoolagiri Trail" or "Program: Overnighter"
  registrationId?: string;
  programBookingId?: string;
  onClose: () => void;
  onSigned?: () => void;
}

const ACKS = [
  "I understand that off-road motorcycling and adventure riding involve inherent and significant risks — including falls, collisions, mechanical failure, changing terrain, weather and environmental hazards — that can result in serious injury, disability or death.",
  "I voluntarily assume all such risks, and I release, waive and discharge Dirt Ride Camp (DRC), its organisers, instructors, ride leaders, staff, partners and affiliates from any and all liability, claims or damages arising from my participation, to the fullest extent permitted by law.",
  "I agree to indemnify and hold harmless DRC against any claims brought by me or on my behalf in connection with this activity.",
  "I confirm I am medically fit to participate, that all information I have provided (including emergency contact and medical details) is accurate, and I consent to emergency medical treatment if required.",
  "I agree to ride within my ability, wear proper safety gear, and follow all instructions from DRC ride leaders and trainers at all times.",
];

export function IndemnityWaiverModal({ context, registrationId, programBookingId, onClose, onSigned }: Props) {
  const [checked, setChecked] = useState<boolean[]>(ACKS.map(() => false));
  const [signature, setSignature] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const allChecked = checked.every(Boolean);
  const today = new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });

  function toggle(i: number) {
    setChecked((prev) => prev.map((c, idx) => (idx === i ? !c : c)));
  }

  async function sign() {
    setError("");
    if (!allChecked) return setError("Please tick all acknowledgements to continue.");
    if (!signature.trim()) return setError("Please type your full legal name as your signature.");
    setSubmitting(true);
    try {
      const res = await fetch("/api/waivers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "indemnity",
          fullName: signature.trim(),
          signature: signature.trim(),
          agreedTerms: true,
          context,
          registrationId,
          programBookingId,
        }),
      });
      if (!res.ok) {
        const e = await res.json();
        setError(e.error || "Could not record your signature.");
        return;
      }
      setDone(true);
      onSigned?.();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-x-0 bottom-0 top-16 sm:top-20 z-40 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-surface border border-border rounded-sm w-full max-w-2xl max-h-full overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-border sticky top-0 bg-surface z-10">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-orange" />
            <div>
              <p className="text-xs text-muted uppercase tracking-wider">Liability Waiver & Indemnity</p>
              <h3 className="font-heading text-lg font-bold text-foreground">Digital Signature Required</h3>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-muted hover:text-foreground" aria-label="Close"><X className="w-5 h-5" /></button>
        </div>

        {done ? (
          <div className="px-6 py-12 text-center space-y-3">
            <CheckCircle2 className="w-16 h-16 text-success mx-auto" />
            <h4 className="font-heading text-2xl font-bold">Waiver Signed</h4>
            <p className="text-muted max-w-md mx-auto">Thank you, {signature}. Your indemnity waiver has been recorded with a timestamp for {context}.</p>
            <Button onClick={onClose} className="mt-2">Done</Button>
          </div>
        ) : (
          <div className="px-6 py-6 space-y-5">
            <p className="text-sm text-muted">
              For <span className="text-foreground font-medium">{context}</span>. Please read carefully — this is a legally binding agreement.
            </p>

            {error && <div className="bg-error/10 border border-error/30 text-error text-sm p-3 rounded-sm">{error}</div>}

            <div className="space-y-3">
              {ACKS.map((text, i) => (
                <label key={i} className="flex items-start gap-3 bg-background border border-border rounded-sm p-3 cursor-pointer">
                  <input type="checkbox" checked={checked[i]} onChange={() => toggle(i)} className="w-4 h-4 mt-0.5 accent-orange shrink-0" />
                  <span className="text-sm text-foreground/85 leading-relaxed">{text}</span>
                </label>
              ))}
            </div>

            <div className="border-t border-border pt-4 space-y-2">
              <label className="block text-sm font-medium text-tan-light">Type your full legal name to sign *</label>
              <Input id="signature" value={signature} onChange={(e) => setSignature(e.target.value)} placeholder="Your full legal name" className="font-heading text-lg" />
              <p className="text-xs text-muted">By typing your name and clicking &quot;Sign &amp; Agree&quot;, you are signing this waiver electronically on <strong className="text-foreground">{today}</strong>. This carries the same legal effect as a handwritten signature.</p>
            </div>

            <Button size="lg" className="w-full" loading={submitting} disabled={!allChecked || !signature.trim()} onClick={sign}>
              Sign &amp; Agree
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
