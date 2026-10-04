"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Badge } from "@/components/ui/Badge";
import { Plus, Pencil, Trash2, Tag } from "lucide-react";
import { EventCategoriesManager } from "@/components/admin/EventCategoriesManager";

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
  stayEnabled: boolean;
  stayPrice: number;
  stayTotalTents: number;
  stayBookedTents: number;
  stayAvailableTents: number;
  spectatorSaturdayFee: number;
  spectatorSundayFee: number;
  spectatorWeekendFee: number;
  spectatorFullMealName: string;
  spectatorFullMealDetails: string;
  spectatorFullMealFee: number;
  spectatorDayMealName: string;
  spectatorDayMealDetails: string;
  spectatorDayMealFee: number;
}

export default function AdminEventsPage() {
  const [events, setEvents] = useState<EventData[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<EventData | null>(null);
  const [loading, setLoading] = useState(true);
  const [categoriesFor, setCategoriesFor] = useState<EventData | null>(null);

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
  const [stayEnabled, setStayEnabled] = useState(false);
  const [stayPrice, setStayPrice] = useState("1599");
  const [stayTotalTents, setStayTotalTents] = useState("50");
  const [spectatorSaturdayFee, setSpectatorSaturdayFee] = useState("499");
  const [spectatorSundayFee, setSpectatorSundayFee] = useState("499");
  const [spectatorWeekendFee, setSpectatorWeekendFee] = useState("999");
  const [spectatorFullMealName, setSpectatorFullMealName] = useState("Two-day meal package");
  const [spectatorFullMealDetails, setSpectatorFullMealDetails] = useState("2 breakfasts, 2 lunches and 1 dinner");
  const [spectatorFullMealFee, setSpectatorFullMealFee] = useState("1999");
  const [spectatorDayMealName, setSpectatorDayMealName] = useState("Day meal package");
  const [spectatorDayMealDetails, setSpectatorDayMealDetails] = useState("1 breakfast and 1 lunch");
  const [spectatorDayMealFee, setSpectatorDayMealFee] = useState("599");

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
    setStayEnabled(false); setStayPrice("1599"); setStayTotalTents("50");
    setSpectatorSaturdayFee("499"); setSpectatorSundayFee("499"); setSpectatorWeekendFee("999");
    setSpectatorFullMealName("Two-day meal package"); setSpectatorFullMealDetails("2 breakfasts, 2 lunches and 1 dinner"); setSpectatorFullMealFee("1999");
    setSpectatorDayMealName("Day meal package"); setSpectatorDayMealDetails("1 breakfast and 1 lunch"); setSpectatorDayMealFee("599");
    setEditing(null); setShowForm(false);
  };

  const startEdit = (e: EventData) => {
    setTitle(e.title); setSlug(e.slug); setDescription(e.description);
    setType(e.type); setDate(e.date.split("T")[0]); setLocation(e.location);
    setPrice(String(e.price)); setTotalSlots(String(e.totalSlots));
    setStatus(e.status); setFeatured(e.featured);
    setPrizes(e.prizes ? JSON.parse(e.prizes).join("\n") : "");
    setRules(e.rules ? JSON.parse(e.rules).join("\n") : "");
    setStayEnabled(e.stayEnabled); setStayPrice(String(e.stayPrice)); setStayTotalTents(String(e.stayTotalTents));
    setSpectatorSaturdayFee(String(e.spectatorSaturdayFee));
    setSpectatorSundayFee(String(e.spectatorSundayFee));
    setSpectatorWeekendFee(String(e.spectatorWeekendFee));
    setSpectatorFullMealName(e.spectatorFullMealName);
    setSpectatorFullMealDetails(e.spectatorFullMealDetails);
    setSpectatorFullMealFee(String(e.spectatorFullMealFee));
    setSpectatorDayMealName(e.spectatorDayMealName);
    setSpectatorDayMealDetails(e.spectatorDayMealDetails);
    setSpectatorDayMealFee(String(e.spectatorDayMealFee));
    setEditing(e); setShowForm(true);
  };

  const handleSubmit = async () => {
    const body = {
      title, slug: slug || title.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      description, type, date: new Date(date).toISOString(), location,
      price: parseInt(price), totalSlots: parseInt(totalSlots), status, featured,
      prizes: prizes.trim() ? JSON.stringify(prizes.split("\n").filter(Boolean)) : null,
      rules: rules.trim() ? JSON.stringify(rules.split("\n").filter(Boolean)) : null,
      stayEnabled, stayPrice: parseInt(stayPrice, 10), stayTotalTents: parseInt(stayTotalTents, 10),
      spectatorSaturdayFee: parseInt(spectatorSaturdayFee, 10),
      spectatorSundayFee: parseInt(spectatorSundayFee, 10),
      spectatorWeekendFee: parseInt(spectatorWeekendFee, 10),
      spectatorFullMealName, spectatorFullMealDetails, spectatorFullMealFee: parseInt(spectatorFullMealFee, 10),
      spectatorDayMealName, spectatorDayMealDetails, spectatorDayMealFee: parseInt(spectatorDayMealFee, 10),
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
          {(editing?.slug === "drc-ultimate-rider" || slug === "drc-ultimate-rider") && (
            <div className="border-t border-border pt-5 space-y-4">
              <h4 className="font-heading text-sm font-bold uppercase">Spectator passes</h4>
              <p className="text-xs text-muted">Early Bird rates. These prices can be changed here at any time.</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Input label="Saturday pass (₹)" type="number" min="0" value={spectatorSaturdayFee} onChange={(e) => setSpectatorSaturdayFee(e.target.value)} />
                <Input label="Sunday pass (₹)" type="number" min="0" value={spectatorSundayFee} onChange={(e) => setSpectatorSundayFee(e.target.value)} />
                <Input label="Both days pass (₹)" type="number" min="0" value={spectatorWeekendFee} onChange={(e) => setSpectatorWeekendFee(e.target.value)} />
              </div>
              <h4 className="font-heading text-sm font-bold uppercase pt-2">Spectator food packages</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input label="Two-day package name" value={spectatorFullMealName} onChange={(e) => setSpectatorFullMealName(e.target.value)} />
                <Input label="Two-day package price (₹)" type="number" min="0" value={spectatorFullMealFee} onChange={(e) => setSpectatorFullMealFee(e.target.value)} />
                <Input label="Two-day package meals" value={spectatorFullMealDetails} onChange={(e) => setSpectatorFullMealDetails(e.target.value)} />
                <Input label="Day package name" value={spectatorDayMealName} onChange={(e) => setSpectatorDayMealName(e.target.value)} />
                <Input label="Day package price (₹)" type="number" min="0" value={spectatorDayMealFee} onChange={(e) => setSpectatorDayMealFee(e.target.value)} />
                <Input label="Day package meals" value={spectatorDayMealDetails} onChange={(e) => setSpectatorDayMealDetails(e.target.value)} />
              </div>
              <h4 className="font-heading text-sm font-bold uppercase pt-2">Tent stay booking</h4>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={stayEnabled} onChange={(e) => setStayEnabled(e.target.checked)} />
                Offer tent stays to riders and spectators
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input label="Price per tent (₹)" type="number" min="0" value={stayPrice} onChange={(e) => setStayPrice(e.target.value)} />
                <Input label="Total tents available" type="number" min="0" value={stayTotalTents} onChange={(e) => setStayTotalTents(e.target.value)} />
              </div>
              {editing && <p className="text-xs text-muted">{editing.stayBookedTents} booked · {editing.stayAvailableTents} currently available. Active checkout holds expire after 15 minutes.</p>}
            </div>
          )}
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} />
            Featured
          </label>

          {editing && (
            <div className="border-t border-border pt-5 mt-2">
              <p className="text-xs text-muted mb-1 uppercase tracking-wider font-mono">Categories &amp; entry fees</p>
              <p className="text-sm text-muted mb-3">
                Add rider categories (e.g. Amateurs, Professionals, Big Bikes) with their entry fees and slot limits.
                These show up on the public registration page.
              </p>
              <Button type="button" variant="outline" onClick={() => setCategoriesFor(editing)}>
                <Tag className="w-4 h-4" /> Manage Categories
              </Button>
            </div>
          )}

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
              <p className="text-xs text-muted">{new Date(e.date).toLocaleDateString("en-IN")} · {e.location} · ₹{e.price}{e.stayEnabled ? ` · Tents: ${e.stayAvailableTents}/${e.stayTotalTents} available at ₹${e.stayPrice}` : ""}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setCategoriesFor(e)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider border border-orange text-orange hover:bg-orange hover:text-white transition-colors"
                title="Manage categories & entry fees"
              >
                <Tag className="w-3.5 h-3.5" /> Categories
              </button>
              <button onClick={() => startEdit(e)} className="p-2 hover:text-orange" title="Edit event"><Pencil className="w-4 h-4" /></button>
              <button onClick={() => handleDelete(e.id)} className="p-2 hover:text-error" title="Delete event"><Trash2 className="w-4 h-4" /></button>
            </div>
          </div>
        ))}
        {events.length === 0 && <p className="text-muted text-sm">No events yet.</p>}
      </div>

      {categoriesFor && (
        <EventCategoriesManager
          eventId={categoriesFor.id}
          eventTitle={categoriesFor.title}
          onClose={() => setCategoriesFor(null)}
        />
      )}
    </div>
  );
}
