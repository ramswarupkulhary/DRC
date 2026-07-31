"use client";

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/Badge";

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
  createdAt: string;
}

export default function AdminCorporatePage() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

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

  if (loading) return <p className="text-muted">Loading...</p>;

  return (
    <div className="space-y-6">
      <h1 className="font-heading text-2xl font-bold">Corporate Inquiries</h1>
      <div className="space-y-3">
        {inquiries.map((inq) => (
          <div key={inq.id} className="bg-surface border border-border rounded-sm p-4">
            <div className="flex items-center justify-between cursor-pointer" onClick={() => setExpanded(expanded === inq.id ? null : inq.id)}>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-semibold">{inq.companyName}</h4>
                  <Badge variant={inq.status === "new" ? "warning" : inq.status === "contacted" ? "orange" : "success"}>{inq.status}</Badge>
                </div>
                <p className="text-xs text-muted">{inq.contactName} · {inq.email} · Group: {inq.groupSize} · {inq.eventType}</p>
              </div>
              <p className="text-xs text-muted">{new Date(inq.createdAt).toLocaleDateString("en-IN")}</p>
            </div>
            {expanded === inq.id && (
              <div className="mt-4 pt-4 border-t border-border space-y-2">
                {inq.phone && <p className="text-sm"><span className="text-muted">Phone:</span> {inq.phone}</p>}
                {inq.preferredDate && <p className="text-sm"><span className="text-muted">Preferred Date:</span> {inq.preferredDate}</p>}
                {inq.budget && <p className="text-sm"><span className="text-muted">Budget:</span> {inq.budget}</p>}
                {inq.requirements && <p className="text-sm"><span className="text-muted">Requirements:</span> {inq.requirements}</p>}
                <div className="flex gap-2 pt-2">
                  {["new", "contacted", "quoted", "confirmed", "completed"].map((s) => (
                    <button
                      key={s}
                      onClick={() => updateStatus(inq.id, s)}
                      className={`text-xs px-2 py-1 rounded-sm border ${inq.status === s ? "bg-orange text-white border-orange" : "border-border hover:border-orange"}`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
        {inquiries.length === 0 && <p className="text-muted text-sm">No inquiries yet.</p>}
      </div>
    </div>
  );
}
