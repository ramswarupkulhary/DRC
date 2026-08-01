"use client";

import { useState, useCallback } from "react";
import { Upload, X, Image as ImageIcon } from "lucide-react";

interface ImageUploadProps {
  value?: string | null;
  onChange: (url: string | null) => void;
  label?: string;
}

export default function ImageUpload({ value, onChange, label = "Cover Image" }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const uploadFile = useCallback(async (file: File) => {
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      if (!res.ok) throw new Error("Upload failed");
      const { url } = await res.json();
      onChange(url);
    } catch {
      alert("Image upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  }, [onChange]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) uploadFile(file);
  }, [uploadFile]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadFile(file);
  }, [uploadFile]);

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-foreground">{label}</label>

      {value ? (
        <div className="relative rounded-sm overflow-hidden border border-border">
          <img src={value} alt="Cover" className="w-full h-48 object-cover" />
          <button
            type="button"
            onClick={() => onChange(null)}
            className="absolute top-2 right-2 p-1.5 bg-black/70 rounded-full text-white hover:bg-black/90 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <label
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          className={`flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-sm cursor-pointer transition-colors ${
            dragOver ? "border-orange bg-orange/5" : "border-border hover:border-orange/50"
          }`}
        >
          <input type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
          {uploading ? (
            <div className="flex flex-col items-center gap-2">
              <div className="w-8 h-8 border-2 border-orange border-t-transparent rounded-full animate-spin" />
              <span className="text-sm text-muted">Uploading...</span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 text-muted">
              {dragOver ? <ImageIcon className="w-10 h-10 text-orange" /> : <Upload className="w-10 h-10" />}
              <span className="text-sm">Drag & drop or click to upload</span>
              <span className="text-xs">JPG, PNG, WebP up to 10MB</span>
            </div>
          )}
        </label>
      )}
    </div>
  );
}
