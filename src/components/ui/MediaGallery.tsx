"use client";

import { useState } from "react";
import { X, ChevronLeft, ChevronRight, Play } from "lucide-react";

interface MediaItem {
  url: string;
  type: "image" | "video";
}

interface MediaGalleryProps {
  items: MediaItem[];
}

export function MediaGallery({ items }: MediaGalleryProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  if (items.length === 0) return null;

  function openLightbox(i: number) {
    setLightboxIndex(i);
  }

  function closeLightbox() {
    setLightboxIndex(null);
  }

  function prev() {
    if (lightboxIndex === null) return;
    setLightboxIndex(lightboxIndex === 0 ? items.length - 1 : lightboxIndex - 1);
  }

  function next() {
    if (lightboxIndex === null) return;
    setLightboxIndex(lightboxIndex === items.length - 1 ? 0 : lightboxIndex + 1);
  }

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {items.map((item, i) => (
          <button
            key={i}
            onClick={() => openLightbox(i)}
            className="relative aspect-[3/2] rounded-sm overflow-hidden border border-border hover:border-orange/50 transition-colors group"
          >
            {item.type === "video" ? (
              <div className="w-full h-full bg-black relative">
                <video src={item.url} className="w-full h-full object-cover" preload="metadata" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-black/60 flex items-center justify-center group-hover:bg-orange/80 transition-colors">
                    <Play className="w-5 h-5 text-white ml-0.5" fill="currentColor" />
                  </div>
                </div>
              </div>
            ) : (
              <img src={item.url} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
            )}
          </button>
        ))}
      </div>

      {lightboxIndex !== null && (
        <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center" onClick={closeLightbox}>
          <button
            onClick={(e) => { e.stopPropagation(); closeLightbox(); }}
            className="absolute top-4 right-4 p-2 text-white/70 hover:text-white transition-colors z-10"
          >
            <X className="w-7 h-7" />
          </button>

          {items.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); prev(); }}
                className="absolute left-4 p-2 text-white/70 hover:text-white transition-colors z-10"
              >
                <ChevronLeft className="w-8 h-8" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); next(); }}
                className="absolute right-4 p-2 text-white/70 hover:text-white transition-colors z-10"
              >
                <ChevronRight className="w-8 h-8" />
              </button>
            </>
          )}

          <div className="max-w-5xl max-h-[85vh] w-full mx-4" onClick={(e) => e.stopPropagation()}>
            {items[lightboxIndex].type === "video" ? (
              <video
                src={items[lightboxIndex].url}
                controls
                autoPlay
                className="w-full max-h-[85vh] object-contain rounded-sm"
              />
            ) : (
              <img
                src={items[lightboxIndex].url}
                alt=""
                className="w-full max-h-[85vh] object-contain rounded-sm"
              />
            )}
          </div>

          <div className="absolute bottom-4 text-white/60 text-sm">
            {lightboxIndex + 1} / {items.length}
          </div>
        </div>
      )}
    </>
  );
}
