"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Plus, Trash2 } from "lucide-react";

interface CouponData {
  id: string;
  code: string;
  type: string;
  value: number;
  minAmount: number;
  maxUses: number | null;
  usedCount: number;
  validUntil: string;
  active: boolean;
}

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<CouponData[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);

  const [code, setCode] = useState("");
  const [type, setType] = useState("percentage");
  const [value, setValue] = useState("10");
  const [minAmount, setMinAmount] = useState("0");
  const [maxUses, setMaxUses] = useState("");
  const [validUntil, setValidUntil] = useState("");

  const fetchCoupons = async () => {
    const res = await fetch("/api/admin/coupons");
    if (res.ok) setCoupons(await res.json());
    setLoading(false);
  };

  useEffect(() => { fetchCoupons(); }, []);

  const handleSubmit = async () => {
    await fetch("/api/admin/coupons", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        code: code.toUpperCase(),
        type,
        value: parseInt(value),
        minAmount: parseInt(minAmount),
        maxUses: maxUses ? parseInt(maxUses) : null,
        validUntil: new Date(validUntil).toISOString(),
      }),
    });
    setCode(""); setType("percentage"); setValue("10"); setMinAmount("0"); setMaxUses(""); setValidUntil("");
    setShowForm(false); fetchCoupons();
  };

  const toggleActive = async (id: string, active: boolean) => {
    await fetch(`/api/admin/coupons/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !active }),
    });
    fetchCoupons();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this coupon?")) return;
    await fetch(`/api/admin/coupons/${id}`, { method: "DELETE" });
    fetchCoupons();
  };

  if (loading) return <p className="text-muted">Loading...</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-bold">Coupons</h1>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="w-4 h-4" /> Add Coupon
        </Button>
      </div>

      {showForm && (
        <div className="bg-surface border border-border rounded-sm p-6 space-y-4">
          <h3 className="font-heading text-lg font-bold">New Coupon</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Input label="Code" value={code} onChange={(e) => setCode(e.target.value)} placeholder="WELCOME20" />
            <div>
              <label className="block text-sm font-medium mb-1">Type</label>
              <select value={type} onChange={(e) => setType(e.target.value)} className="w-full bg-surface-light border border-border rounded-sm px-3 py-2 text-sm">
                <option value="percentage">Percentage</option>
                <option value="flat">Flat Amount</option>
              </select>
            </div>
            <Input label={type === "percentage" ? "Value (%)" : "Value (₹)"} type="number" value={value} onChange={(e) => setValue(e.target.value)} />
            <Input label="Min Amount (₹)" type="number" value={minAmount} onChange={(e) => setMinAmount(e.target.value)} />
            <Input label="Max Uses (blank = unlimited)" type="number" value={maxUses} onChange={(e) => setMaxUses(e.target.value)} />
            <Input label="Valid Until" type="date" value={validUntil} onChange={(e) => setValidUntil(e.target.value)} />
          </div>
          <div className="flex gap-3">
            <Button onClick={handleSubmit}>Create</Button>
            <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {coupons.map((c) => (
          <div key={c.id} className="bg-surface border border-border rounded-sm p-4 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-mono font-bold text-orange">{c.code}</h4>
                <Badge variant={c.active ? "success" : "muted"}>{c.active ? "Active" : "Inactive"}</Badge>
              </div>
              <p className="text-xs text-muted">
                {c.type === "percentage" ? `${c.value}% off` : `₹${c.value} off`}
                {c.minAmount > 0 && ` · Min ₹${c.minAmount}`}
                {c.maxUses && ` · ${c.usedCount}/${c.maxUses} used`}
                {!c.maxUses && ` · ${c.usedCount} used`}
                {` · Until ${new Date(c.validUntil).toLocaleDateString("en-IN")}`}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => toggleActive(c.id, c.active)} className="text-xs px-3 py-1 border border-border rounded-sm hover:border-orange">
                {c.active ? "Deactivate" : "Activate"}
              </button>
              <button onClick={() => handleDelete(c.id)} className="p-2 hover:text-error"><Trash2 className="w-4 h-4" /></button>
            </div>
          </div>
        ))}
        {coupons.length === 0 && <p className="text-muted text-sm">No coupons yet.</p>}
      </div>
    </div>
  );
}
