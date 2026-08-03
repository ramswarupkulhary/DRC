"use client";

import { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Camera } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { SectionHeader } from "@/components/ui/SectionHeader";

interface Profile {
  name: string;
  email: string;
  phone: string;
  bikeName: string;
  bikeCC: string;
  ridingExperience: string;
  emergencyName: string;
  emergencyPhone: string;
  bloodGroup: string;
  licenseNumber: string;
  city: string;
  image: string | null;
}

const experienceOptions = [
  { value: "", label: "Select experience" },
  { value: "beginner", label: "Beginner (< 1 year)" },
  { value: "intermediate", label: "Intermediate (1-3 years)" },
  { value: "advanced", label: "Advanced (3+ years)" },
];

const bloodGroupOptions = [
  { value: "", label: "Select blood group" },
  { value: "A+", label: "A+" },
  { value: "A-", label: "A-" },
  { value: "B+", label: "B+" },
  { value: "B-", label: "B-" },
  { value: "AB+", label: "AB+" },
  { value: "AB-", label: "AB-" },
  { value: "O+", label: "O+" },
  { value: "O-", label: "O-" },
];

export default function ProfilePage() {
  const { data: session, status, update: updateSession } = useSession();
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [image, setImage] = useState<string | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login?redirect=/profile");
    }
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/profile")
        .then((r) => r.json())
        .then((data) => {
          setProfile(data);
          setImage(data.image || null);
        });
    }
  }, [status]);

  if (status === "loading" || !profile) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-pulse text-muted">Loading profile...</div>
      </div>
    );
  }

  function update(field: keyof Profile, value: string) {
    setProfile((prev) => prev && { ...prev, [field]: value });
    setSaved(false);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await fetch("/api/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...profile, image }),
    });
    await updateSession();
    setSaving(false);
    setSaved(true);
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <SectionHeader accent="Your account" title="Rider Profile" align="left" />

      <form onSubmit={handleSave} className="mt-8 space-y-8">
        {/* Avatar Section */}
        <div className="flex flex-col items-center gap-3">
          <div className="relative">
            <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-border">
              {image ? (
                <img src={image} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-orange flex items-center justify-center">
                  <span className="text-2xl font-bold text-white">
                    {profile.name
                      ? profile.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()
                          .slice(0, 2)
                      : "?"}
                  </span>
                </div>
              )}
            </div>
            <button
              type="button"
              disabled={uploadingPhoto}
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-0 right-0 p-1.5 bg-orange rounded-full text-white hover:bg-orange/80 transition-colors disabled:opacity-50"
            >
              <Camera className="w-4 h-4" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                setUploadingPhoto(true);
                try {
                  const formData = new FormData();
                  formData.append("file", file);
                  const res = await fetch("/api/upload", { method: "POST", body: formData });
                  if (!res.ok) throw new Error("Upload failed");
                  const { url } = await res.json();
                  setImage(url);
                  setSaved(false);
                } catch {
                  alert("Image upload failed. Please try again.");
                } finally {
                  setUploadingPhoto(false);
                  e.target.value = "";
                }
              }}
            />
          </div>
          {uploadingPhoto && <span className="text-sm text-muted">Uploading...</span>}
        </div>

        <div className="bg-surface border border-border rounded-sm p-6 space-y-5">
          <h3 className="font-heading text-lg font-semibold text-tan">Personal Info</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Input id="name" label="Full Name" value={profile.name} onChange={(e) => update("name", e.target.value)} required />
            <Input id="email" label="Email" type="email" value={profile.email} disabled />
            <Input id="phone" label="Phone" type="tel" value={profile.phone} onChange={(e) => update("phone", e.target.value)} />
            <Input id="city" label="City" value={profile.city} onChange={(e) => update("city", e.target.value)} />
          </div>
        </div>

        <div className="bg-surface border border-border rounded-sm p-6 space-y-5">
          <h3 className="font-heading text-lg font-semibold text-tan">Bike & Riding</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Input id="bikeName" label="Bike Name/Model" placeholder="e.g. KTM 390 Adventure" value={profile.bikeName} onChange={(e) => update("bikeName", e.target.value)} />
            <Input id="bikeCC" label="Engine CC" placeholder="e.g. 390" value={profile.bikeCC} onChange={(e) => update("bikeCC", e.target.value)} />
            <Select id="ridingExperience" label="Riding Experience" options={experienceOptions} value={profile.ridingExperience} onChange={(e) => update("ridingExperience", e.target.value)} />
            <Input id="licenseNumber" label="License Number" value={profile.licenseNumber} onChange={(e) => update("licenseNumber", e.target.value)} />
          </div>
        </div>

        <div className="bg-surface border border-border rounded-sm p-6 space-y-5">
          <h3 className="font-heading text-lg font-semibold text-tan">Emergency Contact</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Input id="emergencyName" label="Contact Name" value={profile.emergencyName} onChange={(e) => update("emergencyName", e.target.value)} />
            <Input id="emergencyPhone" label="Contact Phone" type="tel" value={profile.emergencyPhone} onChange={(e) => update("emergencyPhone", e.target.value)} />
            <Select id="bloodGroup" label="Blood Group" options={bloodGroupOptions} value={profile.bloodGroup} onChange={(e) => update("bloodGroup", e.target.value)} />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Button type="submit" loading={saving}>
            Save Profile
          </Button>
          {saved && <span className="text-success text-sm">Profile saved successfully!</span>}
        </div>
      </form>

      <ChangePasswordSection />
    </div>
  );
}

function ChangePasswordSection() {
  const [current, setCurrent] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (newPw !== confirm) { setError("Passwords do not match"); return; }
    if (newPw.length < 6) { setError("Password must be at least 6 characters"); return; }

    setLoading(true);
    const res = await fetch("/api/auth/change-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword: current, newPassword: newPw }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || "Failed to change password");
    } else {
      setSuccess(true);
      setCurrent("");
      setNewPw("");
      setConfirm("");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 bg-surface border border-border rounded-sm p-6 space-y-5">
      <h3 className="font-heading text-lg font-semibold text-tan">Change Password</h3>
      {error && <div className="bg-error/10 border border-error/30 text-error text-sm p-3 rounded-sm">{error}</div>}
      {success && <div className="bg-success/10 border border-success/30 text-success text-sm p-3 rounded-sm">Password changed successfully!</div>}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <Input id="currentPassword" label="Current Password" type="password" value={current} onChange={(e) => setCurrent(e.target.value)} required />
        <Input id="newPassword" label="New Password" type="password" value={newPw} onChange={(e) => setNewPw(e.target.value)} required />
        <Input id="confirmPassword" label="Confirm New Password" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required />
      </div>
      <Button type="submit" variant="secondary" loading={loading}>Update Password</Button>
    </form>
  );
}
