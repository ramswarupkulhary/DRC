"use client";

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Mail, MailOpen, Trash2 } from "lucide-react";

interface Message {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export default function AdminMessagesPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/messages")
      .then((r) => r.json())
      .then((data) => { setMessages(data); setLoading(false); });
  }, []);

  async function markRead(id: string, read: boolean) {
    await fetch(`/api/admin/messages/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ read }),
    });
    setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, read } : m)));
  }

  async function deleteMessage(id: string) {
    await fetch(`/api/admin/messages/${id}`, { method: "DELETE" });
    setMessages((prev) => prev.filter((m) => m.id !== id));
  }

  if (loading) return <div className="text-muted py-12 text-center">Loading...</div>;

  const unread = messages.filter((m) => !m.read).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-bold">Messages</h1>
        <p className="text-muted mt-1">{messages.length} messages &middot; {unread} unread</p>
      </div>

      <div className="space-y-3">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`bg-surface border rounded-sm overflow-hidden ${msg.read ? "border-border" : "border-orange/30"}`}
          >
            <button
              onClick={() => {
                setExpanded(expanded === msg.id ? null : msg.id);
                if (!msg.read) markRead(msg.id, true);
              }}
              className="w-full px-5 py-4 flex items-center gap-4 text-left cursor-pointer"
            >
              {msg.read ? (
                <MailOpen className="w-4 h-4 text-muted shrink-0" />
              ) : (
                <Mail className="w-4 h-4 text-orange shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium truncate">{msg.name}</span>
                  {!msg.read && <Badge variant="orange">New</Badge>}
                </div>
                <p className="text-sm text-muted truncate">{msg.subject}</p>
              </div>
              <span className="text-xs text-muted shrink-0">
                {new Date(msg.createdAt).toLocaleDateString()}
              </span>
            </button>
            {expanded === msg.id && (
              <div className="px-5 pb-4 border-t border-border pt-4 space-y-3">
                <div className="flex gap-6 text-sm text-muted">
                  <span>{msg.email}</span>
                  {msg.phone && <span>{msg.phone}</span>}
                </div>
                <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                <div className="flex gap-3">
                  <Button size="sm" variant="outline" onClick={() => markRead(msg.id, !msg.read)}>
                    {msg.read ? "Mark Unread" : "Mark Read"}
                  </Button>
                  <Button size="sm" variant="danger" onClick={() => deleteMessage(msg.id)}>
                    <Trash2 className="w-3.5 h-3.5" /> Delete
                  </Button>
                </div>
              </div>
            )}
          </div>
        ))}
        {messages.length === 0 && (
          <div className="text-center text-muted py-12 bg-surface border border-border rounded-sm">
            No messages yet.
          </div>
        )}
      </div>
    </div>
  );
}
