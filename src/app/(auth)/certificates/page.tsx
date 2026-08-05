"use client";

import { useState, useEffect } from "react";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Badge } from "@/components/ui/Badge";
import { Award, Download } from "lucide-react";

interface Cert {
  id: string;
  title: string;
  type: string;
  certNumber: string;
  issuedAt: string;
  training: { title: string; level: string } | null;
  ride: { title: string; difficulty: string } | null;
}

export default function CertificatesPage() {
  const [certs, setCerts] = useState<Cert[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/certificates")
      .then((r) => r.json())
      .then((data) => { setCerts(data); setLoading(false); });
  }, []);

  const downloadCertificate = async (certId: string, certTitle: string) => {
    setDownloading(certId);
    try {
      const res = await fetch(`/api/certificates/${certId}/image`);
      const svgText = await res.text();
      const canvas = document.createElement("canvas");
      canvas.width = 1200;
      canvas.height = 800;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const img = new Image();
      const blob = new Blob([svgText], { type: "image/svg+xml;charset=utf-8" });
      const url = URL.createObjectURL(blob);

      img.onload = () => {
        ctx.drawImage(img, 0, 0, 1200, 800);
        URL.revokeObjectURL(url);
        const pngUrl = canvas.toDataURL("image/png");
        const a = document.createElement("a");
        a.href = pngUrl;
        a.download = `DRC-Certificate-${certTitle.replace(/[^a-zA-Z0-9]/g, "-")}.png`;
        a.click();
        setDownloading(null);
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        setDownloading(null);
      };
      img.src = url;
    } catch {
      setDownloading(null);
    }
  };

  if (loading) return <div className="min-h-[60vh] flex items-center justify-center text-muted">Loading...</div>;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <SectionHeader accent="Your achievements" title="Certificates" align="left" />

      {certs.length === 0 ? (
        <div className="mt-12 text-center py-16 bg-surface border border-border rounded-sm">
          <Award className="w-16 h-16 text-muted/20 mx-auto mb-4" />
          <p className="text-muted text-lg">No certificates yet</p>
          <p className="text-muted text-sm mt-2">Complete a training program to earn your first DRC certificate!</p>
        </div>
      ) : (
        <div className="mt-8 space-y-4">
          {certs.map((cert) => (
            <div key={cert.id} className="bg-surface border border-border rounded-sm p-6 flex items-center gap-6">
              <div className="w-16 h-16 bg-orange/10 rounded-sm flex items-center justify-center shrink-0">
                <Award className="w-8 h-8 text-orange" />
              </div>
              <div className="flex-1">
                <h3 className="font-heading text-lg font-semibold">{cert.title}</h3>
                {(cert.training || cert.ride) && (
                  <p className="text-sm text-muted">{cert.training?.title || cert.ride?.title}</p>
                )}
                <div className="flex items-center gap-3 mt-2">
                  <Badge variant="orange">{cert.type}</Badge>
                  <span className="text-xs text-muted">#{cert.certNumber}</span>
                  <span className="text-xs text-muted">{new Date(cert.issuedAt).toLocaleDateString()}</span>
                </div>
              </div>
              <button
                onClick={() => downloadCertificate(cert.id, cert.title)}
                disabled={downloading === cert.id}
                className="shrink-0 w-10 h-10 flex items-center justify-center rounded-sm border border-border hover:border-orange hover:bg-orange/10 transition-colors disabled:opacity-50"
                title="Download Certificate"
              >
                <Download className={`w-5 h-5 text-orange ${downloading === cert.id ? "animate-pulse" : ""}`} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
