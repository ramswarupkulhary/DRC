"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { SectionHeader } from "@/components/ui/SectionHeader";

const bloodGroupOptions = [
  { value: "", label: "Select" },
  { value: "A+", label: "A+" }, { value: "A-", label: "A-" },
  { value: "B+", label: "B+" }, { value: "B-", label: "B-" },
  { value: "AB+", label: "AB+" }, { value: "AB-", label: "AB-" },
  { value: "O+", label: "O+" }, { value: "O-", label: "O-" },
];

export default function WaiverPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [agreed, setAgreed] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!agreed) { setError("You must agree to the terms"); return; }
    setLoading(true);
    setError("");

    const form = new FormData(e.currentTarget);
    const res = await fetch("/api/waivers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fullName: form.get("fullName"),
        dateOfBirth: form.get("dateOfBirth") || null,
        emergencyName: form.get("emergencyName"),
        emergencyPhone: form.get("emergencyPhone"),
        medicalConditions: form.get("medicalConditions") || null,
        allergies: form.get("allergies") || null,
        medications: form.get("medications") || null,
        agreedTerms: agreed,
      }),
    });

    setLoading(false);
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Failed to submit");
    } else {
      setSuccess(true);
    }
  }

  if (success) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center space-y-6">
        <div className="w-20 h-20 bg-success/10 rounded-full flex items-center justify-center mx-auto">
          <svg className="w-10 h-10 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
        </div>
        <h2 className="font-heading text-3xl font-bold">Waiver Signed!</h2>
        <p className="text-muted">Your liability waiver and medical declaration has been recorded. You&apos;re all set for your next ride.</p>
        <Button onClick={() => router.push("/rides")}>Browse Rides</Button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
      <SectionHeader accent="Safety first" title="Liability Waiver & Medical Declaration" align="left" />

      <form onSubmit={handleSubmit} className="mt-8 space-y-6">
        {error && <div className="bg-error/10 border border-error/30 text-error text-sm p-3 rounded-sm">{error}</div>}

        <div className="bg-surface border border-border rounded-sm p-6 space-y-5">
          <h3 className="font-heading text-lg font-semibold text-tan">Personal Details</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Input name="fullName" id="fullName" label="Full Legal Name" required />
            <Input name="dateOfBirth" id="dateOfBirth" label="Date of Birth" type="date" />
          </div>
        </div>

        <div className="bg-surface border border-border rounded-sm p-6 space-y-5">
          <h3 className="font-heading text-lg font-semibold text-tan">Emergency Contact</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Input name="emergencyName" id="emergencyName" label="Contact Name" required />
            <Input name="emergencyPhone" id="emergencyPhone" label="Contact Phone" type="tel" required />
            <Select name="bloodGroup" id="bloodGroup" label="Blood Group" options={bloodGroupOptions} />
          </div>
        </div>

        <div className="bg-surface border border-border rounded-sm p-6 space-y-5">
          <h3 className="font-heading text-lg font-semibold text-tan">Medical Information</h3>
          <Textarea name="medicalConditions" id="medicalConditions" label="Medical Conditions (if any)" placeholder="e.g., Asthma, heart condition, recent surgery..." />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Input name="allergies" id="allergies" label="Allergies" placeholder="e.g., Penicillin, dust" />
            <Input name="medications" id="medications" label="Current Medications" placeholder="e.g., Inhaler, insulin" />
          </div>
        </div>

        <div className="bg-surface border border-border rounded-sm p-6 space-y-4">
          <h3 className="font-heading text-lg font-semibold text-tan">Terms & Agreement</h3>
          <div className="text-sm text-muted space-y-2 max-h-40 overflow-y-auto pr-2">
            <p>I acknowledge that off-road motorcycle riding is an inherently dangerous activity. I understand the risks involved, including but not limited to: physical injury, equipment damage, and exposure to natural hazards.</p>
            <p>I confirm that I am physically fit to participate and have disclosed all relevant medical conditions. I agree to follow all safety instructions provided by DRC staff and ride leaders.</p>
            <p>I release Dirt Ride Camp (DRC), its organizers, staff, and affiliates from any liability arising from my participation in rides, training, or events.</p>
            <p>I authorize DRC to provide emergency medical treatment if needed and to use my emergency contact information in case of an incident.</p>
          </div>
          <label className="flex items-start gap-3 cursor-pointer">
            <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="w-5 h-5 mt-0.5 accent-orange" />
            <span className="text-sm">I have read and agree to the liability waiver, medical declaration, and terms of participation.</span>
          </label>
        </div>

        <Button type="submit" loading={loading} className="w-full">Sign Waiver</Button>
      </form>
    </div>
  );
}
