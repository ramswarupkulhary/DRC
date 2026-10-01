"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Trash2, Plus, X, Check } from "lucide-react";

interface Category {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  fee: number;
  totalSlots: number | null;
  sortOrder: number;
  active: boolean;
}

export function EventCategoriesManager({
  eventId,
  eventTitle,
  onClose,
}: {
  eventId: string;
  eventTitle: string;
  onClose: () => void;
}) {
  const [cats, setCats] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [draft, setDraft] = useState({
    name: "",
    slug: "",
    description: "",
    fee: "",
    totalSlots: "",
    sortOrder: "0",
  });

  async function load() {
    setLoading(true);
    const res = await fetch(`/api/admin/events/${eventId}/categories`);
    if (res.ok) setCats(await res.json());
    setLoading(false);
  }

  useEffect(() => { load(); }, [eventId]);

  async function create() {
    setError("");
    const res = await fetch(`/api/admin/events/${eventId}/categories`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: draft.name,
        slug: draft.slug || undefined,
        description: draft.description || undefined,
        fee: parseInt(draft.fee || "0", 10),
        totalSlots: draft.totalSlots ? parseInt(draft.totalSlots, 10) : undefined,
        sortOrder: parseInt(draft.sortOrder || "0", 10),
      }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data?.error || "Could not create category.");
      return;
    }
    setDraft({ name: "", slug: "", description: "", fee: "", totalSlots: "", sortOrder: "0" });
    load();
  }

  async function update(cat: Category, patch: Partial<Category>) {
    const res = await fetch(`/api/admin/events/${eventId}/categories/${cat.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data?.error || "Could not update category.");
      return;
    }
    load();
  }

  async function remove(cat: Category) {
    if (!confirm(`Delete "${cat.name}"? Existing registrations will keep their stored category details.`)) return;
    const res = await fetch(`/api/admin/events/${eventId}/categories/${cat.id}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data?.error || "Could not delete category.");
      return;
    }
    load();
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-start justify-center overflow-y-auto p-4 sm:p-8">
      <div className="w-full max-w-4xl bg-background border border-border">
        <div className="flex items-center justify-between p-5 border-b border-border">
          <div>
            <h2 className="font-heading text-xl font-bold uppercase tracking-tight">Categories & Entry Fees</h2>
            <p className="text-xs text-muted mt-1">{eventTitle}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:text-orange" aria-label="Close">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="m-5 p-3 border border-error/40 bg-error/10 text-error text-sm">{error}</div>
        )}

        <div className="p-5 space-y-6">
          {loading ? (
            <p className="text-muted text-sm">Loading…</p>
          ) : cats.length === 0 ? (
            <p className="text-muted text-sm">No categories yet. Add the first one below.</p>
          ) : (
            <div className="border border-border overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-surface border-b border-border">
                  <tr className="text-left">
                    <th className="px-3 py-2 font-mono text-[10px] uppercase tracking-widest text-muted">Order</th>
                    <th className="px-3 py-2 font-mono text-[10px] uppercase tracking-widest text-muted">Name</th>
                    <th className="px-3 py-2 font-mono text-[10px] uppercase tracking-widest text-muted">Slug</th>
                    <th className="px-3 py-2 font-mono text-[10px] uppercase tracking-widest text-muted">Fee (₹)</th>
                    <th className="px-3 py-2 font-mono text-[10px] uppercase tracking-widest text-muted">Slots</th>
                    <th className="px-3 py-2 font-mono text-[10px] uppercase tracking-widest text-muted">Description</th>
                    <th className="px-3 py-2 font-mono text-[10px] uppercase tracking-widest text-muted">Active</th>
                    <th className="px-3 py-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {cats.map((c) => (
                    <tr key={c.id} className="border-b border-border align-top">
                      <td className="px-2 py-2">
                        <input type="number" defaultValue={c.sortOrder} onBlur={(e) => update(c, { sortOrder: parseInt(e.target.value || "0", 10) })} className="w-16 bg-background border border-border px-2 py-1 text-sm" />
                      </td>
                      <td className="px-2 py-2">
                        <input defaultValue={c.name} onBlur={(e) => e.target.value !== c.name && update(c, { name: e.target.value })} className="w-full bg-background border border-border px-2 py-1 text-sm" />
                      </td>
                      <td className="px-2 py-2">
                        <input defaultValue={c.slug} onBlur={(e) => e.target.value !== c.slug && update(c, { slug: e.target.value })} className="w-full bg-background border border-border px-2 py-1 text-sm font-mono text-xs" />
                      </td>
                      <td className="px-2 py-2">
                        <input type="number" defaultValue={c.fee} onBlur={(e) => parseInt(e.target.value, 10) !== c.fee && update(c, { fee: parseInt(e.target.value || "0", 10) })} className="w-24 bg-background border border-border px-2 py-1 text-sm" />
                      </td>
                      <td className="px-2 py-2">
                        <input type="number" defaultValue={c.totalSlots ?? ""} onBlur={(e) => update(c, { totalSlots: e.target.value ? parseInt(e.target.value, 10) : null })} placeholder="∞" className="w-20 bg-background border border-border px-2 py-1 text-sm" />
                      </td>
                      <td className="px-2 py-2 min-w-[200px]">
                        <input defaultValue={c.description ?? ""} onBlur={(e) => update(c, { description: e.target.value || null })} className="w-full bg-background border border-border px-2 py-1 text-sm" />
                      </td>
                      <td className="px-2 py-2 text-center">
                        <button onClick={() => update(c, { active: !c.active })} className={`inline-flex items-center justify-center w-6 h-6 border ${c.active ? "border-orange bg-orange/10 text-orange" : "border-border text-muted"}`}>
                          {c.active && <Check className="w-3 h-3" strokeWidth={3} />}
                        </button>
                      </td>
                      <td className="px-2 py-2">
                        <button onClick={() => remove(c)} className="p-1 text-muted hover:text-error" aria-label="Delete category">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* New row */}
          <div className="border border-border p-4 bg-surface">
            <h3 className="font-heading text-sm font-bold uppercase tracking-tight mb-3">Add category</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <Input label="Name *" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} placeholder="e.g. Pro Enduro" />
              <Input label="Slug" value={draft.slug} onChange={(e) => setDraft({ ...draft, slug: e.target.value })} placeholder="auto from name if blank" />
              <Input label="Fee (₹) *" type="number" value={draft.fee} onChange={(e) => setDraft({ ...draft, fee: e.target.value })} placeholder="4999" />
              <Input label="Total slots" type="number" value={draft.totalSlots} onChange={(e) => setDraft({ ...draft, totalSlots: e.target.value })} placeholder="unlimited" />
              <Input label="Sort order" type="number" value={draft.sortOrder} onChange={(e) => setDraft({ ...draft, sortOrder: e.target.value })} />
            </div>
            <Textarea label="Description" value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} rows={2} />
            <div className="mt-3">
              <Button onClick={create}><Plus className="w-4 h-4" /> Add category</Button>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end p-5 border-t border-border">
          <Button variant="outline" onClick={onClose}>Done</Button>
        </div>
      </div>
    </div>
  );
}
