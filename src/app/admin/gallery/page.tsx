"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Trash2, Plus, Image as ImageIcon } from "lucide-react";

interface GalleryImage {
  id: string;
  url: string;
  caption: string | null;
  featured: boolean;
  createdAt: string;
}

export default function AdminGalleryPage() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [url, setUrl] = useState("");
  const [caption, setCaption] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/admin/gallery")
      .then((r) => r.json())
      .then((data) => { setImages(data); setLoading(false); });
  }, []);

  async function addImage(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const res = await fetch("/api/admin/gallery", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url, caption: caption || null }),
    });
    const img = await res.json();
    setImages((prev) => [img, ...prev]);
    setUrl("");
    setCaption("");
    setShowForm(false);
    setSaving(false);
  }

  async function deleteImage(id: string) {
    await fetch(`/api/admin/gallery/${id}`, { method: "DELETE" });
    setImages((prev) => prev.filter((img) => img.id !== id));
  }

  if (loading) return <div className="text-muted py-12 text-center">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-3xl font-bold">Gallery</h1>
          <p className="text-muted mt-1">{images.length} images</p>
        </div>
        <Button size="sm" onClick={() => setShowForm(!showForm)}>
          <Plus className="w-4 h-4" /> Add Image
        </Button>
      </div>

      {showForm && (
        <form onSubmit={addImage} className="bg-surface border border-border rounded-sm p-5 space-y-4 max-w-xl">
          <Input id="url" label="Image URL" value={url} onChange={(e) => setUrl(e.target.value)} required placeholder="https://..." />
          <Input id="caption" label="Caption (optional)" value={caption} onChange={(e) => setCaption(e.target.value)} />
          <div className="flex gap-3">
            <Button type="submit" size="sm" loading={saving}>Save</Button>
            <Button type="button" size="sm" variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {images.map((img) => (
          <div key={img.id} className="relative group bg-surface border border-border rounded-sm overflow-hidden">
            <div className="aspect-square bg-surface-light flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img.url} alt={img.caption || "Gallery"} className="w-full h-full object-cover" />
            </div>
            {img.caption && <p className="px-3 py-2 text-xs text-muted truncate">{img.caption}</p>}
            <button
              onClick={() => deleteImage(img.id)}
              className="absolute top-2 right-2 bg-error/90 text-white p-1.5 rounded-sm opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
        {images.length === 0 && (
          <div className="col-span-full text-center text-muted py-12 bg-surface border border-border rounded-sm">
            <ImageIcon className="w-12 h-12 mx-auto mb-3 text-border" />
            <p>No gallery images yet. Add some!</p>
          </div>
        )}
      </div>
    </div>
  );
}
