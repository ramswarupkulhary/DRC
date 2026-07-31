"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Badge } from "@/components/ui/Badge";
import { Plus, Pencil, Trash2 } from "lucide-react";

interface EventData {
  id: string;
  title: string;
  slug: string;
  description: string;
  type: string;
  date: string;
  location: string;
  price: number;
  totalSlots: number;
  status: string;
  featured: boolean;
  prizes: string | null;
  rules: string | null;
}

export default function AdminEventsPage() {
  const [events, setEvents] = useState<EventData[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<EventData | null>(null);
  const [loading, setLoading] = useState(true);

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("race");
  const [date, setDate] = useState("");
  const [location, setLocation] = useState("");
  const [price, setPrice] = useState("0");
  const [totalSlots, setTotalSlots] = useState("50");
  const [status, setStatus] = useState("upcoming");
  const [featured, setFeatured] = useState(false);
  const [prizes, setPrizes] = useState("");
  const [rules, setRules] = useState("");

  const fetchEvents = async () => {
    const res = await fetch("/api/admin/events");
    if (res.ok) setEvents(await res.json());
    setLoading(false);
  };

  useEffect(() => { fetchEvents(); }, []);

  const resetForm = () => {
    setTitle(""); setSlug(""); setDescription(""); setType("race");
    setDate(""); setLocation(""); setPrice("0"); setTotalSlots("50");
    setStatus("upcoming"); setFeatured(false); setPrizes(""); setRules("");
    setEditing(null); setShowForm(false);
  };

  const startEdit = (e: EventData) => {
    setTitle(e.title); setSlug(e.slug); setDescription(e.description);
    setType(e.type); setDate(e.date.split("T")[0]); setLocation(e.location);
    setPrice(String(e.price)); setTotalSlots(String(e.totalSlots));
    setStatus(e.status); setFeatured(e.featured);
    setPrizes(e.prizes ? JSON.parse(e.prizes).join("\n") : "");
    setRules(e.rules ? JSON.parse(e.rules).join("\n") : "");
    setEditing(e); setShowForm(true);
  };

  const handleSubmit = async () => {
    const body = {
      title, slug: slug || title.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      description, type, date: new Date(date).toISOString(), location,
      price: parseInt(price), totalSlots: parseInt(totalSlots), status, featured,
      prizes: prizes.trim() ? JSON.stringify(prizes.split("\n").filter(Boolean)) : null,
      rules: rules.trim() ? JSON.stringify(rules.split("\n").filter(Boolean)) : null,
    };

    if (editing) {
      await fetch(`/api/admin/events/${editing.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    } else {
      await fetch("/api/admin/events", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    }
    resetForm(); fetchEvents();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this event?")) return;
    await fetch(`/api/admin/events/${id}`, { method: "DELETE" });
    fetchEvents();
  };

  if (loading) return <p className="text-muted">Loading...</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-bold">Events</h1>
        <Button onClick={() => { resetForm(); setShowForm(true); }}>
          <Plus className="w-4 h-4" /> Add Event
        </Button>
      </div>

      {showForm && (
        <div className="bg-surface border border-border rounded-sm p-6 space-y-4">
          <h3 className="font-heading text-lg font-bold">{editing ? "Edit Event" : "New Event"}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Title" value={title} onChange={(e) => { setTitle(e.target.value); if (!editing) setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-")); }} />
            <Input label="Slug" value={slug} onChange={(e) => setSlug(e.target.value)} />
            <Input label="Date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            <Input label="Location" value={location} onChange={(e) => setLocation(e.target.value)} />
            <Input label="Price (₹)" type="number" value={price} onChange={(e) => setPrice(e.target.value)} />
            <Input label="Total Slots" type="number" value={totalSlots} onChange={(e) => setTotalSlots(e.target.value)} />
            <div>
              <label className="block text-sm font-medium mb-1">Type</label>
              <select value={type} onChange={(e) => setType(e.target.value)} className="w-full bg-surface-light border border-border rounded-sm px-3 py-2 text-sm">
                <option value="race">Race</option>
                <option value="rally">Rally</option>
                <option value="meetup">Meetup</option>
                <option value="workshop">Workshop</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full bg-surface-light border border-border rounded-sm px-3 py-2 text-sm">
                <option value="upcoming">Upcoming</option>
                <option value="ongoing">Ongoing</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
          <Textarea label="Description" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
          <Textarea label="Prizes (one per line)" value={prizes} onChange={(e) => setPrizes(e.target.value)} rows={3} />
          <Textarea label="Rules (one per line)" value={rules} onChange={(e) => setRules(e.target.value)} rows={3} />
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} />
            Featured
          </label>
          <div className="flex gap-3">
            <Button onClick={handleSubmit}>{editing ? "Update" : "Create"}</Button>
            <Button variant="outline" onClick={resetForm}>Cancel</Button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {events.map((e) => (
          <div key={e.id} className="bg-surface border border-border rounded-sm p-4 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-semibold">{e.title}</h4>
                <Badge variant="orange">{e.type}</Badge>
                <Badge variant={e.status === "upcoming" ? "success" : "muted"}>{e.status}</Badge>
              </div>
              <p className="text-xs text-muted">{new Date(e.date).toLocaleDateString("en-IN")} · {e.location} · ₹{e.price}</p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => startEdit(e)} className="p-2 hover:text-orange"><Pencil className="w-4 h-4" /></button>
              <button onClick={() => handleDelete(e.id)} className="p-2 hover:text-error"><Trash2 className="w-4 h-4" /></button>
            </div>
          </div>
        ))}
        {events.length === 0 && <p className="text-muted text-sm">No events yet.</p>}
      </div>
    </div>
  );
}
