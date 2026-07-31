"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import { Input } from "@/components/ui/Input";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Badge } from "@/components/ui/Badge";
import { PenTool, Heart } from "lucide-react";

interface Journal {
  id: string;
  title: string;
  content: string;
  terrain: string | null;
  likes: number;
  published: boolean;
  createdAt: string;
  user: { name: string | null };
  ride: { title: string } | null;
}

export default function RideJournalPage() {
  const [journals, setJournals] = useState<Journal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/journals")
      .then((r) => r.json())
      .then((data) => { setJournals(data); setLoading(false); });
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);

    const form = new FormData(e.currentTarget);
    const res = await fetch("/api/journals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: form.get("title"),
        content: form.get("content"),
        terrain: form.get("terrain") || null,
      }),
    });

    if (res.ok) {
      const journal = await res.json();
      setJournals([journal, ...journals]);
      setShowForm(false);
    }
    setSaving(false);
  }

  if (loading) return <div className="min-h-[60vh] flex items-center justify-center text-muted">Loading...</div>;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <div className="flex items-center justify-between">
        <SectionHeader accent="Stories from the trail" title="Ride Journals" align="left" />
        <Button size="sm" onClick={() => setShowForm(!showForm)}>
          <PenTool className="w-4 h-4" /> Write
        </Button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mt-6 bg-surface border border-border rounded-sm p-6 space-y-5">
          <Input name="title" id="title" label="Title" required placeholder="My first mud trail experience" />
          <Input name="terrain" id="terrain" label="Terrain Type" placeholder="e.g. Mud, Rocky, Forest" />
          <Textarea name="content" id="content" label="Your Story" required placeholder="Share your ride experience, what you learned, memorable moments..." />
          <div className="flex gap-3">
            <Button type="submit" loading={saving}>Publish</Button>
            <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button>
          </div>
        </form>
      )}

      <div className="mt-8 space-y-6">
        {journals.map((j) => (
          <article key={j.id} className="bg-surface border border-border rounded-sm p-6 space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-heading text-xl font-semibold">{j.title}</h3>
                <p className="text-xs text-muted mt-1">
                  by {j.user.name || "Anonymous"} · {new Date(j.createdAt).toLocaleDateString()}
                  {j.ride && <span> · {j.ride.title}</span>}
                </p>
              </div>
              {j.terrain && <Badge variant="muted">{j.terrain}</Badge>}
            </div>
            <p className="text-sm text-muted whitespace-pre-wrap">{j.content}</p>
            <div className="flex items-center gap-2 text-muted text-sm">
              <Heart className="w-4 h-4" />
              <span>{j.likes}</span>
            </div>
          </article>
        ))}
        {journals.length === 0 && (
          <div className="text-center py-12 text-muted">
            <PenTool className="w-12 h-12 mx-auto mb-3 text-border" />
            <p>No journals yet. Be the first to share your story!</p>
          </div>
        )}
      </div>
    </div>
  );
}
