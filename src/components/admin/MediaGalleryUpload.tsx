"use client";

import { useState, useCallback } from "react";
import { Upload, X, Play, Plus } from "lucide-react";

export interface MediaItem {
  url: string;
  type: "image" | "video";
}

interface MediaGalleryUploadProps {
  value: MediaItem[];
  onChange: (items: MediaItem[]) => void;
}

export default function MediaGalleryUpload({ value, onChange }: MediaGalleryUploadProps) {
  const [uploading, setUploading] = useState(false);

  const uploadFile = useCallback(async (file: File) => {
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      if (!res.ok) throw new Error("Upload failed");
      const { url } = await res.json();
      const type = file.type.startsWith("video/") ? "video" as const : "image" as const;
      onChange([...value, { url, type }]);
    } catch {
      alert("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  }, [value, onChange]);

  const handleFiles = useCallback((files: FileList) => {
    Array.from(files).forEach((file) => {
      if (file.type.startsWith("image/") || file.type.startsWith("video/")) {
        uploadFile(file);
      }
    });
  }, [uploadFile]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    handleFiles(e.dataTransfer.files);
  }, [handleFiles]);

  const removeItem = useCallback((index: number) => {
    onChange(value.filter((_, i) => i !== index));
  }, [value, onChange]);

  return (
    <div className="space-y-3">
      <label className="text-sm font-medium text-foreground">Gallery (Photos & Videos)</label>
      <p className="text-xs text-muted -mt-1">Recommended image size: <strong>1200×800px</strong> (3:2 ratio). Videos: MP4, max 100MB.</p>

      {value.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
          {value.map((item, i) => (
            <div key={i} className="relative group aspect-square rounded-sm overflow-hidden border border-border">
              {item.type === "video" ? (
                <div className="w-full h-full bg-black flex items-center justify-center">
                  <video src={item.url} className="w-full h-full object-cover" />
                  <Play className="absolute w-8 h-8 text-white/80" fill="currentColor" />
                </div>
              ) : (
                <img src={item.url} alt="" className="w-full h-full object-cover" />
              )}
              <button
                type="button"
                onClick={() => removeItem(i)}
                className="absolute top-1 right-1 p-1 bg-black/70 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}

          <label
            className="aspect-square rounded-sm border-2 border-dashed border-border hover:border-orange/50 flex flex-col items-center justify-center cursor-pointer transition-colors"
          >
            <input
              type="file"
              accept="image/*,video/*"
              multiple
              onChange={(e) => e.target.files && handleFiles(e.target.files)}
              className="hidden"
            />
            <Plus className="w-6 h-6 text-muted" />
            <span className="text-xs text-muted mt-1">Add more</span>
          </label>
        </div>
      )}

      {value.length === 0 && (
        <label
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-border hover:border-orange/50 rounded-sm cursor-pointer transition-colors"
        >
          <input
            type="file"
            accept="image/*,video/*"
            multiple
            onChange={(e) => e.target.files && handleFiles(e.target.files)}
            className="hidden"
          />
          {uploading ? (
            <div className="flex flex-col items-center gap-2">
              <div className="w-8 h-8 border-2 border-orange border-t-transparent rounded-full animate-spin" />
              <span className="text-sm text-muted">Uploading...</span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 text-muted">
              <Upload className="w-10 h-10" />
              <span className="text-sm">Drag & drop or click to upload photos & videos</span>
              <span className="text-xs">JPG, PNG, WebP, MP4</span>
            </div>
          )}
        </label>
      )}
    </div>
  );
}
