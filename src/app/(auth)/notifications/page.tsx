"use client";

import { useState, useEffect } from "react";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Badge } from "@/components/ui/Badge";

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  link?: string;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/notifications")
      .then((r) => r.json())
      .then((data) => {
        setNotifications(data);
        setLoading(false);
      });
  }, []);

  async function markAllRead() {
    await fetch("/api/notifications", { method: "PATCH" });
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }

  const unreadCount = notifications.filter((n) => !n.read).length;

  if (loading) return <div className="text-muted py-12 text-center">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <SectionHeader title="Notifications" align="left" />
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            className="text-sm text-orange hover:underline font-medium"
          >
            Mark all as read
          </button>
        )}
      </div>

      <div className="space-y-2">
        {notifications.length === 0 ? (
          <div className="bg-surface border border-border rounded-sm p-8 text-center text-muted">
            No notifications yet
          </div>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification.id}
              className={`bg-surface border border-border rounded-sm p-4 transition-colors ${
                !notification.read ? "border-orange/50 bg-orange/5" : ""
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-heading font-semibold text-foreground">
                      {notification.title}
                    </h3>
                    {!notification.read && (
                      <Badge variant="orange" className="text-xs">
                        New
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted mt-1">{notification.message}</p>
                  <p className="text-xs text-muted mt-2">
                    {new Date(notification.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                {notification.link && (
                  <a href={notification.link} className="text-orange hover:underline text-sm font-medium whitespace-nowrap">
                    View
                  </a>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
