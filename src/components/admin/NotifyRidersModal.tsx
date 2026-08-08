"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { X, Send, Users, CheckSquare, Square } from "lucide-react";

interface Rider {
  id: string;
  name: string | null;
  email: string;
  phone: string | null;
}

interface Props {
  rideId: string;
  rideTitle: string;
  onClose: () => void;
}

export function NotifyRidersModal({ rideId, rideTitle, onClose }: Props) {
  const [riders, setRiders] = useState<Rider[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState("");
  const [result, setResult] = useState<{ sent: number; total: number } | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/admin/all-riders")
      .then((r) => r.json())
      .then((data) => {
        setRiders(data);
        setLoading(false);
      });
  }, []);

  const filteredRiders = riders.filter(
    (r) =>
      (r.name || "").toLowerCase().includes(search.toLowerCase()) ||
      r.email.toLowerCase().includes(search.toLowerCase())
  );

  const allSelected = filteredRiders.length > 0 && filteredRiders.every((r) => selected.has(r.id));

  function toggleAll() {
    if (allSelected) {
      const newSet = new Set(selected);
      filteredRiders.forEach((r) => newSet.delete(r.id));
      setSelected(newSet);
    } else {
      const newSet = new Set(selected);
      filteredRiders.forEach((r) => newSet.add(r.id));
      setSelected(newSet);
    }
  }

  function toggleRider(id: string) {
    const newSet = new Set(selected);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelected(newSet);
  }

  async function sendNotifications() {
    if (selected.size === 0) return;
    setSending(true);
    const res = await fetch("/api/admin/notify-riders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        rideId,
        riderIds: Array.from(selected),
        message: message || undefined,
      }),
    });
    const data = await res.json();
    setSending(false);
    if (res.ok) {
      setResult(data);
    } else {
      alert(data.error || "Failed to send notifications");
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-surface border border-border rounded-sm w-full max-w-lg max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-border flex items-center justify-between shrink-0">
          <div>
            <h2 className="font-heading text-lg font-bold flex items-center gap-2">
              <Send className="w-5 h-5 text-orange" /> Notify Riders
            </h2>
            <p className="text-xs text-muted mt-0.5">About: {rideTitle}</p>
          </div>
          <button onClick={onClose} className="p-1 text-muted hover:text-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>

        {result ? (
          <div className="p-6 text-center space-y-4">
            <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto">
              <Send className="w-8 h-8 text-success" />
            </div>
            <h3 className="font-heading text-xl font-bold">Notifications Sent!</h3>
            <p className="text-sm text-muted">
              Successfully notified <strong className="text-orange">{result.sent}</strong> of {result.total} riders.
            </p>
            <Button onClick={onClose} size="sm">Close</Button>
          </div>
        ) : (
          <>
            {/* Custom message */}
            <div className="px-6 pt-4 shrink-0">
              <label className="text-xs font-medium text-muted uppercase tracking-wider block mb-1.5">
                Custom Message (optional)
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Leave empty for default notification about this ride..."
                className="w-full px-3 py-2 bg-background border border-border rounded-sm text-sm text-foreground focus:border-orange focus:outline-none resize-none h-16"
              />
            </div>

            {/* Search + Select All */}
            <div className="px-6 pt-3 pb-2 space-y-2 shrink-0">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search riders..."
                className="w-full px-3 py-2 bg-background border border-border rounded-sm text-sm text-foreground focus:border-orange focus:outline-none"
              />
              <div className="flex items-center justify-between">
                <button
                  onClick={toggleAll}
                  className="flex items-center gap-2 text-sm text-foreground/80 hover:text-orange transition-colors"
                >
                  {allSelected ? (
                    <CheckSquare className="w-4 h-4 text-orange" />
                  ) : (
                    <Square className="w-4 h-4" />
                  )}
                  Select All ({filteredRiders.length})
                </button>
                <span className="text-xs text-muted">{selected.size} selected</span>
              </div>
            </div>

            {/* Rider list */}
            <div className="flex-1 overflow-y-auto px-6 pb-2 min-h-0">
              {loading ? (
                <div className="text-center text-muted py-8">Loading riders...</div>
              ) : filteredRiders.length === 0 ? (
                <div className="text-center text-muted py-8">No riders found</div>
              ) : (
                <div className="space-y-1">
                  {filteredRiders.map((rider) => (
                    <button
                      key={rider.id}
                      onClick={() => toggleRider(rider.id)}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-sm hover:bg-surface-light transition-colors text-left"
                    >
                      {selected.has(rider.id) ? (
                        <CheckSquare className="w-4 h-4 text-orange shrink-0" />
                      ) : (
                        <Square className="w-4 h-4 text-muted shrink-0" />
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-foreground truncate">
                          {rider.name || "Unnamed Rider"}
                        </p>
                        <p className="text-xs text-muted truncate">{rider.email}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-border flex items-center justify-between shrink-0">
              <span className="text-sm text-muted">
                <Users className="w-4 h-4 inline mr-1" />
                {selected.size} rider{selected.size !== 1 ? "s" : ""} selected
              </span>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={onClose}>Cancel</Button>
                <Button
                  size="sm"
                  onClick={sendNotifications}
                  disabled={selected.size === 0}
                  loading={sending}
                >
                  <Send className="w-4 h-4 mr-1" /> Send
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
