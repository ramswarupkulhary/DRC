"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Plus, Pencil, Trash2 } from "lucide-react";
import ImageUpload from "@/components/admin/ImageUpload";
import MediaGalleryUpload, { MediaItem } from "@/components/admin/MediaGalleryUpload";

interface PastRide {
  id: string;
  title: string;
  shortDesc: string | null;
  description: string;
  coverImage: string | null;
  images: string | null;
  startDate: string | null;
  location: string;
  state: string | null;
  createdAt: string;
}

export default function AdminPastRidesPage() {
  const router = useRouter();
  const [rides, setRides] = useState<PastRide[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<PastRide | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  // Form state
  const [title, setTitle] = useState("");
  const [shortDesc, setShortDesc] = useState("");
  const [description, setDescription] = useState("");
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [galleryMedia, setGalleryMedia] = useState<MediaItem[]>([]);
  const [date, setDate] = useState("");
  const [location, setLocation] = useState("");
  const [state, setState] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchRides();
  }, []);

  const fetchRides = async () => {
    const res = await fetch("/api/admin/past-rides");
    const data = await res.json();
    setRides(data);
    setLoading(false);
  };

  const resetForm = () => {
    setTitle("");
    setShortDesc("");
    setDescription("");
    setCoverImage(null);
    setGalleryMedia([]);
    setDate("");
    setLocation("");
    setState("");
    setEditing(null);
    setShowForm(false);
  };

  const openEdit = (ride: PastRide) => {
    setEditing(ride);
    setTitle(ride.title);
    setShortDesc(ride.shortDesc || "");
    setDescription(ride.description);
    setCoverImage(ride.coverImage);
    setGalleryMedia(ride.images ? JSON.parse(ride.images) : []);
    setDate(ride.startDate ? ride.startDate.split("T")[0] : "");
    setLocation(ride.location);
    setState(ride.state || "");
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !location.trim()) return;
    setSaving(true);

    const body = {
      title,
      shortDesc: shortDesc || null,
      description,
      coverImage,
      images: galleryMedia.length > 0 ? JSON.stringify(galleryMedia) : null,
      date: date || null,
      location,
      state: state || null,
    };

    const url = editing ? `/api/admin/past-rides/${editing.id}` : "/api/admin/past-rides";
    const method = editing ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      resetForm();
      fetchRides();
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this past ride?")) return;
    setDeleting(id);
    await fetch(`/api/admin/past-rides/${id}`, { method: "DELETE" });
    setRides((prev) => prev.filter((r) => r.id !== id));
    setDeleting(null);
  };

  if (loading) return <p className="text-muted">Loading...</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-bold">Past Rides</h1>
        {!showForm && (
          <Button onClick={() => setShowForm(true)}>
            <Plus className="w-4 h-4 mr-1" /> Add Past Ride
          </Button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-surface border border-border rounded-sm p-6 space-y-5">
          <h2 className="font-heading text-lg font-semibold">{editing ? "Edit Past Ride" : "Add Past Ride"}</h2>

          <div>
            <label className="block text-sm font-medium mb-1">Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full px-3 py-2 bg-background border border-border rounded-sm text-sm focus:border-orange focus:outline-none"
              placeholder="e.g. Sakleshpur Monsoon Trail"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Short Description</label>
            <input
              type="text"
              value={shortDesc}
              onChange={(e) => setShortDesc(e.target.value)}
              className="w-full px-3 py-2 bg-background border border-border rounded-sm text-sm focus:border-orange focus:outline-none"
              placeholder="One-liner about the ride"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Full Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 bg-background border border-border rounded-sm text-sm focus:border-orange focus:outline-none min-h-[120px] resize-y"
              placeholder="Detailed ride story, highlights, terrain..."
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Date (optional)</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 bg-background border border-border rounded-sm text-sm focus:border-orange focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Location *</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                required
                className="w-full px-3 py-2 bg-background border border-border rounded-sm text-sm focus:border-orange focus:outline-none"
                placeholder="e.g. Sakleshpur"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">State</label>
              <input
                type="text"
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="w-full px-3 py-2 bg-background border border-border rounded-sm text-sm focus:border-orange focus:outline-none"
                placeholder="e.g. Karnataka"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Cover Image</label>
            <ImageUpload value={coverImage} onChange={setCoverImage} />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Gallery Images</label>
            <MediaGalleryUpload value={galleryMedia} onChange={setGalleryMedia} />
          </div>

          <div className="flex gap-3">
            <Button type="submit" loading={saving}>{editing ? "Update" : "Create"} Past Ride</Button>
            <Button type="button" variant="secondary" onClick={resetForm}>Cancel</Button>
          </div>
        </form>
      )}

      {/* Rides list */}
      <div className="space-y-3">
        {rides.map((ride) => (
          <div key={ride.id} className="bg-surface border border-border rounded-sm p-4 flex items-center gap-4">
            {ride.coverImage && (
              <img src={ride.coverImage} alt={ride.title} className="w-20 h-14 object-cover rounded-sm shrink-0" />
            )}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold truncate">{ride.title}</h3>
              <p className="text-xs text-muted mt-0.5">
                {ride.location}{ride.state ? `, ${ride.state}` : ""}
                {ride.startDate && ` · ${new Date(ride.startDate).toLocaleDateString("en-IN")}`}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => openEdit(ride)}
                className="p-2 rounded-sm hover:bg-surface-light transition-colors"
                title="Edit"
              >
                <Pencil className="w-4 h-4 text-muted hover:text-orange" />
              </button>
              <button
                onClick={() => handleDelete(ride.id)}
                disabled={deleting === ride.id}
                className="p-2 rounded-sm hover:bg-surface-light transition-colors"
                title="Delete"
              >
                <Trash2 className="w-4 h-4 text-muted hover:text-red-500" />
              </button>
            </div>
          </div>
        ))}
        {rides.length === 0 && !showForm && (
          <p className="text-muted text-sm text-center py-8">No past rides yet. Click "Add Past Ride" to create one.</p>
        )}
      </div>
    </div>
  );
}
