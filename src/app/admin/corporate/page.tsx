"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Bike, Mail, ChevronDown, ChevronUp } from "lucide-react";

interface Inquiry {
  id: string;
  companyName: string;
  contactName: string;
  email: string;
  phone: string | null;
  groupSize: number;
  eventType: string;
  preferredDate: string | null;
  budget: string | null;
  requirements: string | null;
  status: string;
  notes: string | null;
  createdAt: string;
}

const statusColors: Record<string, "warning" | "orange" | "success" | "muted"> = {
  new: "warning",
  contacted: "orange",
  quoted: "orange",
  confirmed: "success",
  completed: "success",
};

export default function AdminCorporatePage() {
  const router = useRouter();
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [replyForm, setReplyForm] = useState<Record<string, { subject: string; body: string }>>({});
  const [sending, setSending] = useState<string | null>(null);
  const [converting, setConverting] = useState<string | null>(null);
  const [notesEdit, setNotesEdit] = useState<Record<string, string>>({});

  useEffect(() => {
    fetch("/api/admin/corporate").then(r => r.json()).then(d => { setInquiries(d); setLoading(false); });
  }, []);

  const updateStatus = async (id: string, status: string) => {
    await fetch(`/api/admin/corporate/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setInquiries(prev => prev.map(i => i.id === id ? { ...i, status } : i));
  };

  const saveNotes = async (id: string) => {
    await fetch(`/api/admin/corporate/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notes: notesEdit[id] }),
    });
    setInquiries(prev => prev.map(i => i.id === id ? { ...i, notes: notesEdit[id] } : i));
  };

  const sendEmail = async (id: string) => {
    const form = replyForm[id];
    if (!form?.body?.trim()) return;
    setSending(id);
    await fetch(`/api/admin/corporate/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status: "contacted",
        sendEmail: true,
        emailSubject: form.subject,
        emailBody: form.body,
      }),
    });
    setInquiries(prev => prev.map(i => i.id === id ? { ...i, status: "contacted" } : i));
    setReplyForm(prev => ({ ...prev, [id]: { subject: "", body: "" } }));
    setSending(null);
  };

  const convertToRide = async (id: string) => {
    setConverting(id);
    const res = await fetch(`/api/admin/corporate/${id}`, { method: "POST" });
    const data = await res.json();
    if (res.ok) {
      router.push(`/admin/rides/${data.ride.id}/edit`);
    }
    setConverting(null);
  };

  if (loading) return <p className="text-muted">Loading...</p>;

  return (
    <div className="space-y-6">
      <h1 className="font-heading text-2xl font-bold">Corporate Inquiries</h1>
      <div className="space-y-3">
        {inquiries.map((inq) => (
          <div key={inq.id} className="bg-surface border border-border rounded-sm">
            <button
              className="w-full px-5 py-4 flex items-center justify-between text-left"
              onClick={() => setExpanded(expanded === inq.id ? null : inq.id)}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-semibold">{inq.companyName}</h4>
                  <Badge variant={statusColors[inq.status] || "muted"}>{inq.status}</Badge>
                </div>
                <p className="text-xs text-muted">{inq.contactName} · {inq.email} · Group: {inq.groupSize} · {inq.eventType}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs text-muted">{new Date(inq.createdAt).toLocaleDateString("en-IN")}</span>
                {expanded === inq.id ? <ChevronUp className="w-4 h-4 text-muted" /> : <ChevronDown className="w-4 h-4 text-muted" />}
              </div>
            </button>

            {expanded === inq.id && (
              <div className="px-5 pb-5 border-t border-border pt-4 space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                  {inq.phone && <div><span className="text-muted text-xs">Phone</span><p>{inq.phone}</p></div>}
                  {inq.preferredDate && <div><span className="text-muted text-xs">Preferred Date</span><p>{inq.preferredDate}</p></div>}
                  {inq.budget && <div><span className="text-muted text-xs">Budget</span><p>{inq.budget}</p></div>}
                  <div><span className="text-muted text-xs">Group Size</span><p>{inq.groupSize} people</p></div>
                </div>
                {inq.requirements && (
                  <div className="text-sm">
                    <span className="text-muted text-xs">Requirements</span>
                    <p className="mt-1 whitespace-pre-wrap">{inq.requirements}</p>
                  </div>
                )}

                {/* Status Pipeline */}
                <div className="flex flex-wrap gap-2">
                  {["new", "contacted", "quoted", "confirmed", "completed"].map((s) => (
                    <button
                      key={s}
                      onClick={() => updateStatus(inq.id, s)}
                      className={`text-xs px-3 py-1.5 rounded-sm border transition-colors ${inq.status === s ? "bg-orange text-white border-orange" : "border-border hover:border-orange"}`}
                    >
                      {s}
                    </button>
                  ))}
                </div>

                {/* Notes */}
                <div>
                  <label className="text-xs text-muted uppercase tracking-wider font-semibold">Internal Notes</label>
                  <textarea
                    value={notesEdit[inq.id] ?? inq.notes ?? ""}
                    onChange={(e) => setNotesEdit(prev => ({ ...prev, [inq.id]: e.target.value }))}
                    placeholder="Add internal notes..."
                    className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-sm text-sm text-foreground focus:border-orange focus:outline-none min-h-[60px] resize-y"
                  />
                  {notesEdit[inq.id] !== undefined && notesEdit[inq.id] !== (inq.notes ?? "") && (
                    <Button size="sm" className="mt-1" onClick={() => saveNotes(inq.id)}>Save Notes</Button>
                  )}
                </div>

                {/* Email Reply */}
                <div className="border-t border-border pt-3">
                  <label className="text-xs text-muted uppercase tracking-wider font-semibold flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5" /> Send Email
                  </label>
                  <input
                    type="text"
                    value={replyForm[inq.id]?.subject ?? ""}
                    onChange={(e) => setReplyForm(prev => ({ ...prev, [inq.id]: { ...prev[inq.id], subject: e.target.value, body: prev[inq.id]?.body ?? "" } }))}
                    placeholder="Subject..."
                    className="w-full mt-2 px-3 py-2 bg-background border border-border rounded-sm text-sm text-foreground focus:border-orange focus:outline-none"
                  />
                  <textarea
                    value={replyForm[inq.id]?.body ?? ""}
                    onChange={(e) => setReplyForm(prev => ({ ...prev, [inq.id]: { ...prev[inq.id], subject: prev[inq.id]?.subject ?? "", body: e.target.value } }))}
                    placeholder="Type your message..."
                    className="w-full mt-2 px-3 py-2 bg-background border border-border rounded-sm text-sm text-foreground focus:border-orange focus:outline-none min-h-[80px] resize-y"
                  />
                  <Button size="sm" className="mt-2" onClick={() => sendEmail(inq.id)} loading={sending === inq.id} disabled={!replyForm[inq.id]?.body?.trim()}>
                    Send Email
                  </Button>
                </div>

                {/* Convert to Ride */}
                {inq.status !== "completed" && (
                  <div className="border-t border-border pt-3">
                    <Button size="sm" variant="secondary" onClick={() => convertToRide(inq.id)} loading={converting === inq.id}>
                      <Bike className="w-4 h-4 mr-1" /> Convert to Ride
                    </Button>
                    <p className="text-xs text-muted mt-1">Creates a draft ride from this inquiry with pre-filled details</p>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
        {inquiries.length === 0 && <p className="text-muted text-sm">No inquiries yet.</p>}
      </div>
    </div>
  );
}
