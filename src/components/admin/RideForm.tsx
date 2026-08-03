"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import ImageUpload from "@/components/admin/ImageUpload";

const difficultyOptions = [
  { value: "easy", label: "Easy" },
  { value: "moderate", label: "Moderate" },
  { value: "hard", label: "Hard" },
  { value: "extreme", label: "Extreme" },
];

const typeOptions = [
  { value: "ride", label: "Day Ride" },
  { value: "overnighter", label: "Overnighter" },
  { value: "multi-day", label: "Multi-day" },
  { value: "expedition", label: "Expedition" },
];

const statusOptions = [
  { value: "draft", label: "Draft" },
  { value: "published", label: "Published" },
  { value: "cancelled", label: "Cancelled" },
  { value: "completed", label: "Completed" },
];

interface RideFormProps {
  ride?: {
    id: string;
    title: string;
    description: string;
    shortDesc: string | null;
    location: string;
    state: string | null;
    startDate: string;
    endDate: string;
    startPoint: string | null;
    startTime: string | null;
    price: number;
    totalSlots: number;
    difficulty: string;
    type: string;
    status: string;
    featured: boolean;
    inclusions: string | null;
    coverImage: string | null;
    whatsappGroupLink: string | null;
    photosLink: string | null;
    photosPublished: boolean;
    memberDiscount?: number;
  };
}

export default function RideForm({ ride }: RideFormProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState("");
  const [publishSuccess, setPublishSuccess] = useState("");
  const [coverImage, setCoverImage] = useState<string | null>(ride?.coverImage || null);
  const [rideType, setRideType] = useState(ride?.type || "ride");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError("");

    const form = new FormData(e.currentTarget);
    const data = {
      title: form.get("title"),
      description: form.get("description") || "",
      shortDesc: form.get("shortDesc") || null,
      location: form.get("location"),
      state: form.get("state") || null,
      startDate: form.get("startDate"),
      endDate: rideType === "ride" ? form.get("startDate") : form.get("endDate"),
      startPoint: form.get("startPoint") || null,
      startTime: form.get("startTime") || null,
      price: parseInt(form.get("price") as string),
      totalSlots: parseInt(form.get("totalSlots") as string),
      difficulty: form.get("difficulty"),
      type: rideType,
      status: form.get("status"),
      featured: form.get("featured") === "on",
      inclusions: form.get("inclusions") || null,
      coverImage,
      memberDiscount: parseInt(form.get("memberDiscount") as string) || 0,
      whatsappGroupLink: form.get("whatsappGroupLink") || null,
      photosLink: form.get("photosLink") || null,
    };

    const url = ride ? `/api/admin/rides/${ride.id}` : "/api/admin/rides";
    const method = ride ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const err = await res.json();
      setError(err.error || "Failed to save");
      setSaving(false);
      return;
    }

    router.push("/admin/rides");
    router.refresh();
  }

  const formatDateForInput = (d: string) => d ? new Date(d).toISOString().split("T")[0] : "";

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
      {error && (
        <div className="bg-error/10 border border-error/30 text-error text-sm p-3 rounded-sm">{error}</div>
      )}

      <div className="bg-surface border border-border rounded-sm p-6 space-y-5">
        <h3 className="font-heading text-lg font-semibold text-tan">Basic Info</h3>
        <Input name="title" id="title" label="Title" defaultValue={ride?.title} required />
        <Input name="shortDesc" id="shortDesc" label="Short Description" defaultValue={ride?.shortDesc || ""} />
        <Textarea name="description" id="description" label="Full Description (optional)" defaultValue={ride?.description} />
      </div>

      <div className="bg-surface border border-border rounded-sm p-6 space-y-5">
        <h3 className="font-heading text-lg font-semibold text-tan">Cover Image</h3>
        <ImageUpload value={coverImage} onChange={setCoverImage} />
      </div>

      <div className="bg-surface border border-border rounded-sm p-6 space-y-5">
        <h3 className="font-heading text-lg font-semibold text-tan">Location & Dates</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Input name="location" id="location" label="Location" defaultValue={ride?.location} required />
          <Input name="state" id="state" label="State" defaultValue={ride?.state || ""} />
          <Input name="startDate" id="startDate" label={rideType === "ride" ? "Date" : "Start Date"} type="date" defaultValue={ride ? formatDateForInput(ride.startDate) : ""} required />
          {rideType !== "ride" && (
            <Input name="endDate" id="endDate" label="End Date" type="date" defaultValue={ride ? formatDateForInput(ride.endDate) : ""} required />
          )}
          <Input name="startPoint" id="startPoint" label="Meeting Point" defaultValue={ride?.startPoint || ""} />
          <Input name="startTime" id="startTime" label="Start Time" placeholder="e.g. 3:00 PM" defaultValue={ride?.startTime || ""} />
        </div>
      </div>

      <div className="bg-surface border border-border rounded-sm p-6 space-y-5">
        <h3 className="font-heading text-lg font-semibold text-tan">Pricing & Config</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Input name="price" id="price" label="Price (INR)" type="number" defaultValue={ride?.price} required />
          <Input name="totalSlots" id="totalSlots" label="Total Slots" type="number" defaultValue={ride?.totalSlots} required />
          <Input name="memberDiscount" id="memberDiscount" label="Member Discount (%)" type="number" defaultValue={ride?.memberDiscount || 0} />
          <Select name="difficulty" id="difficulty" label="Difficulty" options={difficultyOptions} defaultValue={ride?.difficulty || "moderate"} />
          <Select name="type" id="type" label="Type" options={typeOptions} value={rideType} onChange={(e) => setRideType(e.target.value)} />
          <Select name="status" id="status" label="Status" options={statusOptions} defaultValue={ride?.status || "draft"} />
          <div className="flex items-center gap-3 pt-6">
            <input type="checkbox" name="featured" id="featured" defaultChecked={ride?.featured} className="w-4 h-4 accent-orange" />
            <label htmlFor="featured" className="text-sm text-foreground">Featured ride</label>
          </div>
        </div>
      </div>

      <div className="bg-surface border border-border rounded-sm p-6 space-y-5">
        <h3 className="font-heading text-lg font-semibold text-tan">Inclusions</h3>
        <Textarea
          name="inclusions"
          id="inclusions"
          label="Inclusions (one per line)"
          placeholder="Camping & Tent&#10;Dinner&#10;Campfire"
          defaultValue={ride?.inclusions ? JSON.parse(ride.inclusions).join("\n") : ""}
        />
      </div>

      <div className="bg-surface border border-border rounded-sm p-6 space-y-5">
        <h3 className="font-heading text-lg font-semibold text-tan">Links & Media</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Input name="whatsappGroupLink" id="whatsappGroupLink" label="WhatsApp Group Link" placeholder="https://chat.whatsapp.com/..." defaultValue={ride?.whatsappGroupLink || ""} />
          <Input name="photosLink" id="photosLink" label="Photos/Videos Link" placeholder="https://drive.google.com/..." defaultValue={ride?.photosLink || ""} />
        </div>
        {ride && ride.photosLink && !ride.photosPublished && (
          <div className="pt-2">
            <Button
              type="button"
              variant="secondary"
              loading={publishing}
              onClick={async () => {
                setPublishing(true);
                setPublishSuccess("");
                try {
                  const res = await fetch(`/api/admin/rides/${ride.id}/publish-photos`, { method: "POST" });
                  const data = await res.json();
                  if (res.ok) {
                    setPublishSuccess(`Photos published! ${data.emailsSent} riders notified. Share in WhatsApp group:`);
                    if (data.whatsappShareUrl) {
                      window.open(data.whatsappShareUrl, "_blank");
                    }
                  } else {
                    setError(data.error || "Failed to publish");
                  }
                } catch {
                  setError("Failed to publish photos");
                } finally {
                  setPublishing(false);
                }
              }}
            >
              Publish Photos & Videos
            </Button>
            <p className="text-xs text-muted mt-1">Emails all confirmed riders with the photos link</p>
          </div>
        )}
        {ride?.photosPublished && (
          <p className="text-sm text-success">Photos already published to riders</p>
        )}
        {publishSuccess && <p className="text-sm text-success">{publishSuccess}</p>}
      </div>

      <div className="flex gap-4">
        <Button type="submit" loading={saving}>
          {ride ? "Update Ride" : "Create Ride"}
        </Button>
        <Button type="button" variant="ghost" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
