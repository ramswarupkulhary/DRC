"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import ImageUpload from "@/components/admin/ImageUpload";
import MediaGalleryUpload, { MediaItem } from "@/components/admin/MediaGalleryUpload";

const levelOptions = [
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
  { value: "all", label: "All Levels" },
];

const statusOptions = [
  { value: "draft", label: "Draft" },
  { value: "published", label: "Published" },
  { value: "cancelled", label: "Cancelled" },
];

export default function NewTrainingPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [galleryMedia, setGalleryMedia] = useState<MediaItem[]>([]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError("");

    const form = new FormData(e.currentTarget);
    const data = {
      title: form.get("title"),
      description: form.get("description"),
      shortDesc: form.get("shortDesc") || null,
      level: form.get("level"),
      duration: form.get("duration") || null,
      price: parseInt(form.get("price") as string),
      totalSlots: parseInt(form.get("totalSlots") as string),
      location: form.get("location") || null,
      status: form.get("status"),
      featured: form.get("featured") === "on",
      curriculum: form.get("curriculum") || null,
      coverImage,
      images: galleryMedia.length > 0 ? JSON.stringify(galleryMedia) : null,
    };

    const res = await fetch("/api/admin/trainings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const err = await res.json();
      setError(err.error || "Failed to save");
      setSaving(false);
      return;
    }

    router.push("/admin/trainings");
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-bold">New Training</h1>
        <p className="text-muted mt-1">Create a new training program</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
        {error && <div className="bg-error/10 border border-error/30 text-error text-sm p-3 rounded-sm">{error}</div>}
        <div className="bg-surface border border-border rounded-sm p-6 space-y-5">
          <Input name="title" id="title" label="Title" required />
          <Input name="shortDesc" id="shortDesc" label="Short Description" />
          <Textarea name="description" id="description" label="Full Description" required />
        </div>
        <div className="bg-surface border border-border rounded-sm p-6 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Select name="level" id="level" label="Level" options={levelOptions} />
            <Input name="duration" id="duration" label="Duration" placeholder="e.g. 1 Day (8 hours)" />
            <Input name="price" id="price" label="Price (INR)" type="number" required />
            <Input name="totalSlots" id="totalSlots" label="Slots per Batch" type="number" required />
            <Input name="location" id="location" label="Location" />
            <Select name="status" id="status" label="Status" options={statusOptions} />
          </div>
          <div className="flex items-center gap-3">
            <input type="checkbox" name="featured" id="featured" className="w-4 h-4 accent-orange" />
            <label htmlFor="featured" className="text-sm text-foreground">Featured program</label>
          </div>
        </div>
        <div className="bg-surface border border-border rounded-sm p-6">
          <Textarea name="curriculum" id="curriculum" label="Curriculum (one topic per line)" placeholder="Standing position&#10;Throttle control&#10;Braking techniques" />
        </div>
        <div className="bg-surface border border-border rounded-sm p-6 space-y-5">
          <h3 className="font-heading text-lg font-semibold text-tan">Cover Image</h3>
          <ImageUpload value={coverImage} onChange={setCoverImage} />
        </div>
        <div className="bg-surface border border-border rounded-sm p-6 space-y-5">
          <MediaGalleryUpload value={galleryMedia} onChange={setGalleryMedia} />
        </div>
        <div className="flex gap-4">
          <Button type="submit" loading={saving}>Create Training</Button>
          <Button type="button" variant="ghost" onClick={() => router.back()}>Cancel</Button>
        </div>
      </form>
    </div>
  );
}
