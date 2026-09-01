"use client";

import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Plus, Trash2 } from "lucide-react";

interface Bike {
  id: string;
  name: string;
  price: number;
  active: boolean;
}

export default function AdminBikesPage() {
  const [bikes, setBikes] = useState<Bike[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [saving, setSaving] = useState(false);

  const load = useCallback(() => {
    fetch("/api/admin/bikes")
      .then((r) => r.json())
      .then((d) => setBikes(d.bikes || []))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => load(), [load]);

  async function add() {
    if (!name.trim() || !price) return;
    setSaving(true);
    try {
      const res = await fetch("/api/admin/bikes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, price }),
      });
      if (res.ok) {
        setName("");
        setPrice("");
        load();
      }
    } finally {
      setSaving(false);
    }
  }

  async function toggle(b: Bike) {
    await fetch(`/api/admin/bikes/${b.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !b.active }),
    });
    load();
  }

  async function remove(b: Bike) {
    if (!confirm(`Delete "${b.name}"?`)) return;
    await fetch(`/api/admin/bikes/${b.id}`, { method: "DELETE" });
    load();
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="font-heading text-2xl font-bold">Rental Bikes</h1>
        <p className="text-sm text-muted mt-1">Bikes riders can rent from DRC during a program (own bike is always free).</p>
      </div>

      <div className="bg-surface border border-border rounded-sm p-4">
        <p className="text-sm font-semibold mb-3">Add a bike</p>
        <div className="flex flex-col sm:flex-row gap-3">
          <Input id="name" placeholder="e.g. Hero Xpulse 200" value={name} onChange={(e) => setName(e.target.value)} className="flex-1" />
          <Input id="price" type="number" placeholder="Price (₹)" value={price} onChange={(e) => setPrice(e.target.value)} className="sm:w-40" />
          <Button loading={saving} onClick={add}><Plus className="w-4 h-4" /> Add</Button>
        </div>
      </div>

      {loading ? (
        <p className="text-muted">Loading…</p>
      ) : bikes.length === 0 ? (
        <p className="text-muted text-sm">No rental bikes yet. Add one above.</p>
      ) : (
        <div className="space-y-2">
          {bikes.map((b) => (
            <div key={b.id} className="bg-surface border border-border rounded-sm p-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="font-heading font-bold">{b.name}</span>
                <span className="text-orange font-bold">₹{b.price.toLocaleString("en-IN")}</span>
                {!b.active && <Badge variant="error">Hidden</Badge>}
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => toggle(b)} className={`text-xs px-3 py-1.5 rounded-sm border ${b.active ? "border-success/40 text-success" : "border-border text-muted"}`}>
                  {b.active ? "Available" : "Hidden"}
                </button>
                <button onClick={() => remove(b)} className="p-2 text-muted hover:text-error"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
