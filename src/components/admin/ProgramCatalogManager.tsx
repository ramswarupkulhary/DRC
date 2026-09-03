"use client";

import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Badge } from "@/components/ui/Badge";
import { Plus, Pencil, Trash2, X } from "lucide-react";

interface Program {
    id: string;
    slug: string;
    category: string;
    name: string;
    price: number;
    priceUnit: string | null;
    duration: string;
    difficulty: string;
    description: string;
    lunch: string | null;
    optionalLunch: number | null;
    personPrice: number | null;
    kidPrice: number | null;
    requiresRiding: boolean;
    supportsCompanions: boolean;
    active: boolean;
    featured: boolean;
    sortOrder: number;
    content: string | null;
}

const CATEGORY_LABELS: Record<string, string> = {
    training: "Training",
    trails: "Trails",
    special: "Family & Friends",
};

interface Props {
    /** Only programs in these categories are listed and creatable here. */
    categories: string[];
    defaultCategory: string;
    title: string;
    subtitle?: string;
    newLabel?: string;
}

export function ProgramCatalogManager({ categories, defaultCategory, title, subtitle, newLabel = "New" }: Props) {
    const empty: Partial<Program> = {
        slug: "", category: defaultCategory, name: "", price: 0, priceUnit: "per rider",
        duration: "", difficulty: "", description: "", lunch: "", optionalLunch: null,
        personPrice: null, kidPrice: null,
        requiresRiding: true, supportsCompanions: defaultCategory === "special", active: true, featured: false, content: "",
    };

    const [programs, setPrograms] = useState<Program[]>([]);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState<Partial<Program> | null>(null);
    const [isNew, setIsNew] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    const load = useCallback(() => {
        fetch("/api/admin/programs")
            .then((r) => r.json())
            .then((d) => setPrograms((d.programs || []).filter((p: Program) => categories.includes(p.category))))
            .finally(() => setLoading(false));
    }, [categories]);

    useEffect(() => load(), [load]);

    async function toggleActive(p: Program) {
        await fetch(`/api/admin/programs/${p.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ active: !p.active }),
        });
        load();
    }

    async function save() {
        if (!editing) return;
        setSaving(true);
        setError("");
        try {
            const url = isNew ? "/api/admin/programs" : `/api/admin/programs/${editing.id}`;
            const res = await fetch(url, {
                method: isNew ? "POST" : "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(editing),
            });
            if (!res.ok) {
                const e = await res.json();
                setError(e.error || "Save failed");
                return;
            }
            setEditing(null);
            load();
        } finally {
            setSaving(false);
        }
    }

    async function remove(p: Program) {
        if (!confirm(`Delete "${p.name}"? This cannot be undone.`)) return;
        await fetch(`/api/admin/programs/${p.id}`, { method: "DELETE" });
        load();
    }

    function set<K extends keyof Program>(key: K, value: Program[K]) {
        setEditing((prev) => (prev ? { ...prev, [key]: value } : prev));
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                    <h2 className="font-heading text-2xl font-bold">{title}</h2>
                    {subtitle && <p className="text-muted mt-1 text-sm">{subtitle}</p>}
                </div>
                <Button size="sm" onClick={() => { setEditing({ ...empty }); setIsNew(true); }}>
                    <Plus className="w-4 h-4" /> {newLabel}
                </Button>
            </div>

            {loading ? (
                <p className="text-muted">Loading…</p>
            ) : programs.length === 0 ? (
                <p className="text-muted text-sm">Nothing here yet. Click “{newLabel}” to add one.</p>
            ) : (
                <div className="space-y-3">
                    {programs.map((p) => (
                        <div key={p.id} className="bg-surface border border-border rounded-sm p-4 flex items-center justify-between gap-4 flex-wrap">
                            <div>
                                <div className="flex items-center gap-2">
                                    <h3 className="font-heading font-bold">{p.name}</h3>
                                    <Badge variant="muted">{CATEGORY_LABELS[p.category] || p.category}</Badge>
                                    {!p.active && <Badge variant="error">Hidden</Badge>}
                                    {p.featured && <Badge variant="warning">Featured</Badge>}
                                </div>
                                <p className="text-xs text-muted mt-1">₹{p.price.toLocaleString("en-IN")} {p.priceUnit} · {p.duration} · {p.difficulty}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <button onClick={() => toggleActive(p)} className={`text-xs px-3 py-1.5 rounded-sm border ${p.active ? "border-success/40 text-success" : "border-border text-muted"}`}>
                                    {p.active ? "Published" : "Hidden"}
                                </button>
                                <button onClick={() => { setEditing(p); setIsNew(false); }} className="p-2 text-muted hover:text-orange"><Pencil className="w-4 h-4" /></button>
                                <button onClick={() => remove(p)} className="p-2 text-muted hover:text-error"><Trash2 className="w-4 h-4" /></button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {editing && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={() => setEditing(null)}>
                    <div className="bg-surface border border-border rounded-sm w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between px-6 py-4 border-b border-border sticky top-0 bg-surface z-10">
                            <h3 className="font-heading text-lg font-bold">{isNew ? `${newLabel}` : "Edit"}</h3>
                            <button onClick={() => setEditing(null)} className="text-muted hover:text-foreground"><X className="w-5 h-5" /></button>
                        </div>
                        <div className="px-6 py-6 space-y-4">
                            {error && <div className="bg-error/10 border border-error/30 text-error text-sm p-3 rounded-sm">{error}</div>}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <Input id="name" label="Name" value={editing.name || ""} onChange={(e) => set("name", e.target.value)} />
                                <Input id="slug" label="Slug (URL)" value={editing.slug || ""} onChange={(e) => set("slug", e.target.value)} disabled={!isNew} />
                                <div>
                                    <label className="block text-sm font-medium text-tan-light mb-1">Category</label>
                                    <select value={editing.category} onChange={(e) => set("category", e.target.value)} className="w-full px-4 py-2.5 bg-surface border border-border rounded-sm text-foreground focus:border-orange focus:outline-none">
                                        {categories.map((c) => <option key={c} value={c}>{CATEGORY_LABELS[c] || c}</option>)}
                                    </select>
                                </div>
                                <Input id="price" label="Price (₹)" type="number" value={editing.price ?? 0} onChange={(e) => set("price", Number(e.target.value))} />
                                <Input id="priceUnit" label="Price unit" value={editing.priceUnit || ""} onChange={(e) => set("priceUnit", e.target.value)} />
                                <Input id="duration" label="Duration" value={editing.duration || ""} onChange={(e) => set("duration", e.target.value)} />
                                <Input id="difficulty" label="Difficulty" value={editing.difficulty || ""} onChange={(e) => set("difficulty", e.target.value)} />
                                <Input id="lunch" label="Lunch label" value={editing.lunch || ""} onChange={(e) => set("lunch", e.target.value)} />
                                <Input id="optionalLunch" label="Optional lunch add-on (₹)" type="number" value={editing.optionalLunch ?? ""} onChange={(e) => set("optionalLunch", e.target.value ? Number(e.target.value) : null)} />
                            </div>
                            {editing.supportsCompanions && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-background border border-border rounded-sm p-3">
                                    <Input id="personPrice" label="Price per person / adult (above 8 yrs) (₹)" type="number" value={editing.personPrice ?? ""} onChange={(e) => set("personPrice", e.target.value ? Number(e.target.value) : null)} />
                                    <Input id="kidPrice" label="Price per kid (8 yrs & under) (₹)" type="number" value={editing.kidPrice ?? ""} onChange={(e) => set("kidPrice", e.target.value ? Number(e.target.value) : null)} />
                                </div>
                            )}
                            <Textarea id="description" label="Description" value={editing.description || ""} onChange={(e) => set("description", e.target.value)} />
                            <div className="flex flex-wrap gap-4">
                                <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={!!editing.active} onChange={(e) => set("active", e.target.checked)} className="accent-orange" /> Published</label>
                                <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={!!editing.featured} onChange={(e) => set("featured", e.target.checked)} className="accent-orange" /> Featured</label>
                                <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={!!editing.supportsCompanions} onChange={(e) => set("supportsCompanions", e.target.checked)} className="accent-orange" /> Companions (family/friends)</label>
                                <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={editing.requiresRiding ?? true} onChange={(e) => set("requiresRiding", e.target.checked)} className="accent-orange" /> Requires riding</label>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-tan-light mb-1">Advanced content (JSON — modules, schedule, itinerary, inclusions)</label>
                                <textarea
                                    value={editing.content || ""}
                                    onChange={(e) => set("content", e.target.value)}
                                    rows={8}
                                    spellCheck={false}
                                    placeholder='{"included":["..."],"learn":[{"title":"...","items":["..."]}]}'
                                    className="w-full px-3 py-2 bg-background border border-border rounded-sm text-xs font-mono text-foreground focus:border-orange focus:outline-none"
                                />
                                <p className="text-[11px] text-muted mt-1">Optional. Leave as-is if you only need to change price/name/status.</p>
                            </div>
                            <div className="flex gap-2 pt-2">
                                <Button className="flex-1" loading={saving} onClick={save}>Save</Button>
                                <Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
