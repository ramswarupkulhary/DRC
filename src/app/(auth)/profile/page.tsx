"use client";

import { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Camera, Loader2, Lock } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { ImageCropper } from "@/components/ui/ImageCropper";
import { PasswordChangeModal } from "@/components/ui/PasswordChangeModal";

interface Profile {
  name: string;
  email: string;
  phone: string;
  city: string;
  address: string;
  addressState: string;
  pincode: string;
  tshirtSize: string;
  instagramHandle: string;
  bikeName: string;
  bikeCC: string;
  ridingExperience: string;
  licenseNumber: string;
  emergencyName: string;
  emergencyPhone: string;
  bloodGroup: string;
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

const tshirtOptions = [
  { value: "", label: "Select size" },
  { value: "S", label: "S" },
  { value: "M", label: "M" },
  { value: "L", label: "L" },
  { value: "XL", label: "XL" },
  { value: "XXL", label: "XXL" },
];

export default function ProfilePage() {
  const { data: session, status, update: updateSession } = useSession();
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [image, setImage] = useState<string | null>(null);
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const [savingPhoto, setSavingPhoto] = useState(false);
  const [convertingFile, setConvertingFile] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [savingPersonal, setSavingPersonal] = useState(false);
  const [savedPersonal, setSavedPersonal] = useState(false);
  const [savingBike, setSavingBike] = useState(false);
  const [savedBike, setSavedBike] = useState(false);
  const [savingEmergency, setSavingEmergency] = useState(false);
  const [savedEmergency, setSavedEmergency] = useState(false);

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
    setSavedPersonal(false);
    setSavedBike(false);
    setSavedEmergency(false);
  }

  async function handleSavePersonal() {
    if (!profile) return;
    setSavingPersonal(true);
    await fetch("/api/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        section: "personal",
        name: profile.name,
        phone: profile.phone,
        city: profile.city,
        address: profile.address,
        addressState: profile.addressState,
        pincode: profile.pincode,
        tshirtSize: profile.tshirtSize,
        instagramHandle: profile.instagramHandle,
      }),
    });
    await updateSession();
    setSavingPersonal(false);
    setSavedPersonal(true);
  }

  async function handleSaveBike() {
    if (!profile) return;
    setSavingBike(true);
    await fetch("/api/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        section: "bike",
        bikeName: profile.bikeName,
        bikeCC: profile.bikeCC,
        ridingExperience: profile.ridingExperience,
        licenseNumber: profile.licenseNumber,
      }),
    });
    setSavingBike(false);
    setSavedBike(true);
  }

  async function handleSaveEmergency() {
    if (!profile) return;
    setSavingEmergency(true);
    await fetch("/api/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        section: "emergency",
        emergencyName: profile.emergencyName,
        emergencyPhone: profile.emergencyPhone,
        bloodGroup: profile.bloodGroup,
      }),
    });
    setSavingEmergency(false);
    setSavedEmergency(true);
  }

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";

    const isHeic = file.name.toLowerCase().endsWith(".heic") ||
      file.name.toLowerCase().endsWith(".heif") ||
      file.type === "image/heic" ||
      file.type === "image/heif";

    if (isHeic) {
      setConvertingFile(true);
      try {
        const heic2any = (await import("heic2any")).default;
        const blob = await heic2any({ blob: file, toType: "image/jpeg", quality: 0.9 });
        const convertedBlob = Array.isArray(blob) ? blob[0] : blob;
        const url = URL.createObjectURL(convertedBlob);
        setCropSrc(url);
      } catch {
        alert("Could not read this image. Please try a JPG or PNG file.");
      } finally {
        setConvertingFile(false);
      }
    } else {
      const reader = new FileReader();
      reader.onload = () => setCropSrc(reader.result as string);
      reader.readAsDataURL(file);
    }
  }

  async function handleCropComplete(blob: Blob) {
    setSavingPhoto(true);
    try {
      const formData = new FormData();
      formData.append("file", blob, "profile.webp");
      const uploadRes = await fetch("/api/upload", { method: "POST", body: formData });
      if (!uploadRes.ok) throw new Error("Upload failed");
      const { url } = await uploadRes.json();

      await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...profile, image: url }),
      });

      setImage(url);
      setProfile((prev) => prev && { ...prev, image: url });
      await updateSession();
    } catch {
      alert("Failed to save photo. Please try again.");
    } finally {
      setSavingPhoto(false);
      setCropSrc(null);
    }
  }

  const userInitials = profile.name
    ? profile.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "?";

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <SectionHeader accent="Your account" title="Rider Profile" align="left" />

      {/* Profile Photo Section */}
      <div className="mt-8 flex flex-col items-center gap-4 pb-8 border-b border-border">
        <div className="w-28 h-28 rounded-full overflow-hidden border-2 border-border">
          {image ? (
            <img
              src={image}
              alt="Profile"
              className="w-full h-full object-cover"
              onError={() => setImage(null)}
            />
          ) : (
            <div className="w-full h-full bg-orange flex items-center justify-center">
              <span className="text-3xl font-bold text-white">{userInitials}</span>
            </div>
          )}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={convertingFile}
        >
          {convertingFile ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Converting...
            </>
          ) : (
            <>
              <Camera className="w-4 h-4 mr-2" />
              Change Photo
            </>
          )}
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileSelect}
        />
      </div>

      {/* Crop Modal */}
      {cropSrc && (
        <ImageCropper
          imageSrc={cropSrc}
          onCropComplete={handleCropComplete}
          onCancel={() => setCropSrc(null)}
          saving={savingPhoto}
        />
      )}

      {/* Personal Info Section */}
      <div className="mt-8 space-y-8">
        <div className="bg-surface border border-border rounded-sm p-6 space-y-5">
          <h3 className="font-heading text-lg font-semibold text-tan">Personal Info</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Input id="name" label="Full Name" value={profile.name} onChange={(e) => update("name", e.target.value)} required />
            <Input id="email" label="Email" type="email" value={profile.email} disabled />
            <Input id="phone" label="Phone" type="tel" value={profile.phone} onChange={(e) => update("phone", e.target.value)} />
            <Input id="city" label="City" value={profile.city} onChange={(e) => update("city", e.target.value)} />
            <Input id="instagramHandle" label="Instagram Handle" placeholder="@yourusername" value={profile.instagramHandle} onChange={(e) => update("instagramHandle", e.target.value)} />
            <Select id="tshirtSize" label="T-Shirt Size" options={tshirtOptions} value={profile.tshirtSize} onChange={(e) => update("tshirtSize", e.target.value)} />
            <Input id="address" label="Address" value={profile.address} onChange={(e) => update("address", e.target.value)} className="sm:col-span-2" />
            <Input id="addressState" label="State" value={profile.addressState} onChange={(e) => update("addressState", e.target.value)} />
            <Input id="pincode" label="Pincode" value={profile.pincode} onChange={(e) => update("pincode", e.target.value)} />
          </div>
          <div className="flex items-center gap-4">
            <Button onClick={handleSavePersonal} loading={savingPersonal}>
              Save Personal Info
            </Button>
            {savedPersonal && <span className="text-success text-sm">Saved!</span>}
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
          <div className="flex items-center gap-4">
            <Button onClick={handleSaveBike} loading={savingBike}>
              Save Bike Info
            </Button>
            {savedBike && <span className="text-success text-sm">Saved!</span>}
          </div>
        </div>

        <div className="bg-surface border border-border rounded-sm p-6 space-y-5">
          <h3 className="font-heading text-lg font-semibold text-tan">Emergency Contact</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Input id="emergencyName" label="Contact Name" value={profile.emergencyName} onChange={(e) => update("emergencyName", e.target.value)} />
            <Input id="emergencyPhone" label="Contact Phone" type="tel" value={profile.emergencyPhone} onChange={(e) => update("emergencyPhone", e.target.value)} />
            <Select id="bloodGroup" label="Blood Group" options={bloodGroupOptions} value={profile.bloodGroup} onChange={(e) => update("bloodGroup", e.target.value)} />
          </div>
          <div className="flex items-center gap-4">
            <Button onClick={handleSaveEmergency} loading={savingEmergency}>
              Save Emergency Contact
            </Button>
            {savedEmergency && <span className="text-success text-sm">Saved!</span>}
          </div>
        </div>

        {/* Password Section */}
        <div className="bg-surface border border-border rounded-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-heading text-lg font-semibold text-tan">Password</h3>
              <p className="text-sm text-muted mt-1">Change your account password via OTP verification</p>
            </div>
            <Button variant="secondary" onClick={() => setShowPasswordModal(true)}>
              <Lock className="w-4 h-4 mr-2" />
              Update Password
            </Button>
          </div>
        </div>
      </div>

      {showPasswordModal && (
        <PasswordChangeModal onClose={() => setShowPasswordModal(false)} />
      )}
    </div>
  );
}
