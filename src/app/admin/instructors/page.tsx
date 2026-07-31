"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Badge } from "@/components/ui/Badge";
import { Plus, Pencil, Trash2 } from "lucide-react";

interface InstructorData {
  id: string;
  name: string;
  slug: string;
  bio: string;
  certifications: string | null;
  specialties: string | null;
  experience: string | null;
  rating: number;
  active: boolean;
}

export default function AdminInstructorsPage() {
  const [instructors, setInstructors] = useState<InstructorData[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<InstructorData | null>(null);
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [bio, setBio] = useState("");
  const [certifications, setCertifications] = useState("");
  const [specialties, setSpecialties] = useState("");
  const [experience, setExperience] = useState("");

  const fetchInstructors = async () => {
    const res = await fetch("/api/admin/instructors");
    if (res.ok) setInstructors(await res.json());
    setLoading(false);
  };

  useEffect(() => { fetchInstructors(); }, []);

  const resetForm = () => {
    setName(""); setSlug(""); setBio(""); setCertifications("");
    setSpecialties(""); setExperience(""); setEditing(null); setShowForm(false);
  };

  const startEdit = (i: InstructorData) => {
    setName(i.name); setSlug(i.slug); setBio(i.bio);
    setCertifications(i.certifications ? JSON.parse(i.certifications).join("\n") : "");
    setSpecialties(i.specialties ? JSON.parse(i.specialties).join("\n") : "");
    setExperience(i.experience || "");
    setEditing(i); setShowForm(true);
  };

  const handleSubmit = async () => {
    const body = {
      name, slug: slug || name.toLowerCase().replace(/[^a-z0-9]+/g, "-"), bio,
      certifications: certifications.trim() ? JSON.stringify(certifications.split("\n").filter(Boolean)) : null,
      specialties: specialties.trim() ? JSON.stringify(specialties.split("\n").filter(Boolean)) : null,
      experience,
    };

    if (editing) {
      await fetch(`/api/admin/instructors/${editing.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    } else {
      await fetch("/api/admin/instructors", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    }
    resetForm(); fetchInstructors();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this instructor?")) return;
    await fetch(`/api/admin/instructors/${id}`, { method: "DELETE" });
    fetchInstructors();
  };

  if (loading) return <p className="text-muted">Loading...</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-bold">Instructors</h1>
        <Button onClick={() => { resetForm(); setShowForm(true); }}>
          <Plus className="w-4 h-4" /> Add Instructor
        </Button>
      </div>

      {showForm && (
        <div className="bg-surface border border-border rounded-sm p-6 space-y-4">
          <h3 className="font-heading text-lg font-bold">{editing ? "Edit Instructor" : "New Instructor"}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Name" value={name} onChange={(e) => { setName(e.target.value); if (!editing) setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-")); }} />
            <Input label="Slug" value={slug} onChange={(e) => setSlug(e.target.value)} />
            <Input label="Experience" placeholder="e.g. 10+ years" value={experience} onChange={(e) => setExperience(e.target.value)} />
          </div>
          <Textarea label="Bio" value={bio} onChange={(e) => setBio(e.target.value)} rows={3} />
          <Textarea label="Certifications (one per line)" value={certifications} onChange={(e) => setCertifications(e.target.value)} rows={3} />
          <Textarea label="Specialties (one per line)" value={specialties} onChange={(e) => setSpecialties(e.target.value)} rows={3} />
          <div className="flex gap-3">
            <Button onClick={handleSubmit}>{editing ? "Update" : "Create"}</Button>
            <Button variant="outline" onClick={resetForm}>Cancel</Button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {instructors.map((i) => (
          <div key={i.id} className="bg-surface border border-border rounded-sm p-4 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-semibold">{i.name}</h4>
                <Badge variant={i.active ? "success" : "muted"}>{i.active ? "Active" : "Inactive"}</Badge>
              </div>
              <p className="text-xs text-muted">{i.experience} · Rating: {i.rating}</p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => startEdit(i)} className="p-2 hover:text-orange"><Pencil className="w-4 h-4" /></button>
              <button onClick={() => handleDelete(i.id)} className="p-2 hover:text-error"><Trash2 className="w-4 h-4" /></button>
            </div>
          </div>
        ))}
        {instructors.length === 0 && <p className="text-muted text-sm">No instructors yet.</p>}
      </div>
    </div>
  );
}
