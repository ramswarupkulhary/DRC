"use client";

import { useState, useEffect } from "react";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Badge } from "@/components/ui/Badge";
import { Award } from "lucide-react";

interface Cert {
  id: string;
  title: string;
  type: string;
  certNumber: string;
  issuedAt: string;
  training: { title: string; level: string } | null;
}

export default function CertificatesPage() {
  const [certs, setCerts] = useState<Cert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/certificates")
      .then((r) => r.json())
      .then((data) => { setCerts(data); setLoading(false); });
  }, []);

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
                {cert.training && (
                  <p className="text-sm text-muted">{cert.training.title}</p>
                )}
                <div className="flex items-center gap-3 mt-2">
                  <Badge variant="orange">{cert.type}</Badge>
                  <span className="text-xs text-muted">#{cert.certNumber}</span>
                  <span className="text-xs text-muted">{new Date(cert.issuedAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
