"use client";

import { useState, useEffect, useCallback } from "react";
import { Crown, Save, IndianRupee, QrCode } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface PlanData {
  id: string;
  name: string;
  price: number;
  duration: number;
  description: string;
  benefits: string;
  upiId: string;
}

export default function AdminSettingsPage() {
  const [plan, setPlan] = useState<PlanData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [price, setPrice] = useState("");
  const [upiId, setUpiId] = useState("");
  const [benefits, setBenefits] = useState("");
  const [planName, setPlanName] = useState("");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState("");

  const [payUpiId, setPayUpiId] = useState("");
  const [payUpiName, setPayUpiName] = useState("");
  const [savingUpi, setSavingUpi] = useState(false);
  const [upiSaved, setUpiSaved] = useState(false);

  useEffect(() => {
    fetch("/api/admin/membership-plan")
      .then((r) => r.json())
      .then((d) => {
        if (d.plan) {
          setPlan(d.plan);
          setPrice(String(d.plan.price));
          setUpiId(d.plan.upiId);
          setBenefits((() => {
            try { return JSON.parse(d.plan.benefits).join("\n"); } catch { return d.plan.benefits; }
          })());
          setPlanName(d.plan.name);
          setDescription(d.plan.description);
          setDuration(String(d.plan.duration));
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));

    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then((d) => {
        setPayUpiId(d.upi_id || "");
        setPayUpiName(d.upi_name || "");
      })
      .catch(() => {});
  }, []);

  const savePlan = useCallback(async () => {
    setSaving(true);
    setSaved(false);
    const benefitsList = benefits.split("\n").map((b) => b.trim()).filter(Boolean);
    try {
      const res = await fetch("/api/admin/membership-plan", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          price: Number(price),
          upiId,
          benefits: JSON.stringify(benefitsList),
          name: planName,
          description,
          duration: Number(duration),
        }),
      });
      if (res.ok) {
        const d = await res.json();
        setPlan(d.plan);
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch {
      alert("Failed to save.");
    } finally {
      setSaving(false);
    }
  }, [price, upiId, benefits, planName, description, duration]);

  const saveUpiSettings = useCallback(async () => {
    setSavingUpi(true);
    setUpiSaved(false);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ upi_id: payUpiId, upi_name: payUpiName }),
      });
      if (res.ok) {
        setUpiSaved(true);
        setTimeout(() => setUpiSaved(false), 3000);
      }
    } catch {
      alert("Failed to save UPI settings.");
    } finally {
      setSavingUpi(false);
    }
  }, [payUpiId, payUpiName]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-bold">Settings</h1>
        <p className="text-muted mt-1">Site configuration and preferences</p>
      </div>

      {/* Membership Settings */}
      <div className="bg-surface border border-orange/30 rounded-sm overflow-hidden">
        <div className="bg-gradient-to-br from-orange/10 to-transparent px-6 py-4 border-b border-border flex items-center gap-3">
          <Crown className="w-5 h-5 text-orange" />
          <h3 className="font-heading text-lg font-semibold">Membership Settings</h3>
        </div>
        <div className="p-6 space-y-5">
          {loading ? (
            <p className="text-muted text-sm">Loading...</p>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="text-sm font-medium text-foreground block mb-1.5">Plan Name</label>
                  <input type="text" value={planName} onChange={(e) => setPlanName(e.target.value)} placeholder="DRC Membership" className="w-full px-3 py-2 bg-background border border-border rounded-sm text-sm text-foreground focus:border-orange focus:outline-none" />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground block mb-1.5">Duration (days)</label>
                  <input type="number" value={duration} onChange={(e) => setDuration(e.target.value)} placeholder="365" className="w-full px-3 py-2 bg-background border border-border rounded-sm text-sm text-foreground focus:border-orange focus:outline-none" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="text-sm font-medium text-foreground flex items-center gap-1.5 mb-1.5">
                    <IndianRupee className="w-3.5 h-3.5" /> Price
                  </label>
                  <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="999" className="w-full px-3 py-2 bg-background border border-border rounded-sm text-sm text-foreground focus:border-orange focus:outline-none" />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground block mb-1.5">UPI ID</label>
                  <input type="text" value={upiId} onChange={(e) => setUpiId(e.target.value)} placeholder="ramswarup.kulhary@ybl" className="w-full px-3 py-2 bg-background border border-border rounded-sm text-sm text-foreground focus:border-orange focus:outline-none font-mono" />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground block mb-1.5">Description</label>
                <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Annual DRC membership with welcome kit" className="w-full px-3 py-2 bg-background border border-border rounded-sm text-sm text-foreground focus:border-orange focus:outline-none" />
              </div>

              <div>
                <label className="text-sm font-medium text-foreground block mb-1.5">Benefits (one per line)</label>
                <textarea value={benefits} onChange={(e) => setBenefits(e.target.value)} rows={6} placeholder={"Welcome Kit with DRC T-Shirt\nPriority Ride Booking\nMember-only Rides & Events"} className="w-full px-3 py-2 bg-background border border-border rounded-sm text-sm text-foreground focus:border-orange focus:outline-none resize-y" />
              </div>

              <div className="flex items-center gap-3">
                <Button onClick={savePlan} loading={saving} disabled={saving}>
                  <Save className="w-4 h-4 mr-2" />
                  {plan ? "Update Plan" : "Create Plan"}
                </Button>
                {saved && <span className="text-sm text-success">Saved successfully!</span>}
              </div>
            </>
          )}
        </div>
      </div>

      {/* UPI Payment Config */}
      <div className="bg-surface border border-orange/30 rounded-sm overflow-hidden">
        <div className="bg-gradient-to-br from-orange/10 to-transparent px-6 py-4 border-b border-border flex items-center gap-3">
          <QrCode className="w-5 h-5 text-orange" />
          <h3 className="font-heading text-lg font-semibold">UPI Payment (QR Code)</h3>
        </div>
        <div className="p-6 space-y-5">
          <p className="text-sm text-muted">Configure UPI details for automatic QR code generation on ride registrations.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="text-sm font-medium text-foreground block mb-1.5">UPI ID</label>
              <input type="text" value={payUpiId} onChange={(e) => setPayUpiId(e.target.value)} placeholder="yourname@upi" className="w-full px-3 py-2 bg-background border border-border rounded-sm text-sm text-foreground focus:border-orange focus:outline-none font-mono" />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground block mb-1.5">Merchant / Payee Name</label>
              <input type="text" value={payUpiName} onChange={(e) => setPayUpiName(e.target.value)} placeholder="Dirt Ride Camp" className="w-full px-3 py-2 bg-background border border-border rounded-sm text-sm text-foreground focus:border-orange focus:outline-none" />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button onClick={saveUpiSettings} loading={savingUpi} disabled={savingUpi}>
              <Save className="w-4 h-4 mr-2" />
              Save UPI Settings
            </Button>
            {upiSaved && <span className="text-sm text-success">Saved!</span>}
          </div>
        </div>
      </div>

      <div className="bg-surface border border-border rounded-sm p-6 space-y-4">
        <h3 className="font-heading text-lg font-semibold text-tan">Admin Credentials</h3>
        <p className="text-sm text-muted">
          Default admin login: <strong className="text-foreground">admin@dirtridecamp.com</strong> / <strong className="text-foreground">admin123</strong>
        </p>
        <p className="text-xs text-error">Change this password before going to production!</p>
      </div>

      <div className="bg-surface border border-border rounded-sm p-6 space-y-4">
        <h3 className="font-heading text-lg font-semibold text-tan">Payment Gateway</h3>
        <p className="text-sm text-muted">
          Razorpay integration is prepared. Add your <code className="text-orange">RAZORPAY_KEY_ID</code> and <code className="text-orange">RAZORPAY_KEY_SECRET</code> to the <code>.env</code> file to enable payments.
        </p>
      </div>

      <div className="bg-surface border border-border rounded-sm p-6 space-y-4">
        <h3 className="font-heading text-lg font-semibold text-tan">Contact Info</h3>
        <p className="text-sm text-muted">
          WhatsApp: +91 94148 70102<br />
          Instagram: @dirtridecamp<br />
          Email: info@dirtridecamp.com
        </p>
      </div>
    </div>
  );
}
