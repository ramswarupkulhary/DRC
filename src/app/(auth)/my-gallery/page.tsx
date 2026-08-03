"use client";

import { useState, useEffect } from "react";
import { Images, ExternalLink, Calendar, MessageCircle } from "lucide-react";

interface RideGallery {
  id: string;
  title: string;
  startDate: string;
  coverImage: string | null;
  photosLink: string | null;
  whatsappGroupLink: string | null;
}

export default function MyGalleryPage() {
  const [rides, setRides] = useState<RideGallery[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/gallery/mine")
      .then((r) => r.json())
      .then((data) => setRides(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl sm:text-3xl font-bold text-foreground">My Gallery</h1>
        <p className="text-sm text-muted mt-1">Photos & videos from rides you&apos;ve attended</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-surface border border-border rounded-sm h-56 animate-pulse" />
          ))}
        </div>
      ) : rides.length === 0 ? (
        <div className="bg-surface border border-border rounded-sm p-12 text-center">
          <Images className="w-12 h-12 text-muted mx-auto mb-3" />
          <p className="text-muted">No ride photos available yet</p>
          <p className="text-xs text-muted mt-1">Photos will appear here once published by the admin after your rides</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {rides.map((ride) => (
            <div key={ride.id} className="bg-surface border border-border rounded-sm overflow-hidden group hover:border-orange/40 transition-colors">
              {ride.coverImage ? (
                <div className="h-40 bg-surface-lighter overflow-hidden">
                  <img
                    src={ride.coverImage}
                    alt={ride.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              ) : (
                <div className="h-40 bg-surface-lighter flex items-center justify-center">
                  <Images className="w-10 h-10 text-muted" />
                </div>
              )}
              <div className="p-4 space-y-3">
                <h3 className="font-heading font-semibold text-foreground truncate">{ride.title}</h3>
                <div className="flex items-center gap-1.5 text-xs text-muted">
                  <Calendar className="w-3.5 h-3.5" />
                  {new Date(ride.startDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                </div>
                <div className="flex flex-col gap-2">
                  {ride.whatsappGroupLink && (
                    <a
                      href={ride.whatsappGroupLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-sm text-success hover:underline font-medium"
                    >
                      <MessageCircle className="w-4 h-4" />
                      WhatsApp Group
                    </a>
                  )}
                  {ride.photosLink && (
                    <a
                      href={ride.photosLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-sm text-orange hover:underline font-medium"
                    >
                      <ExternalLink className="w-4 h-4" />
                      View Photos & Videos
                    </a>
                  )}
                  {!ride.whatsappGroupLink && !ride.photosLink && (
                    <p className="text-xs text-muted">Links will appear once added by admin</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
