"use client";

import { useState, useEffect } from "react";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Copy, Share2, Gift, Users, Check } from "lucide-react";

interface ReferralData {
  referralCode: string;
  referralCredits: number;
  referrals: {
    id: string;
    status: string;
    reward: number;
    createdAt: string;
    referred: { name: string | null };
  }[];
}

export default function ReferralsPage() {
  const [data, setData] = useState<ReferralData | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch("/api/referrals")
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false); });
  }, []);

  function copyCode() {
    if (!data) return;
    navigator.clipboard.writeText(`https://www.dirtridecamp.com/signup?ref=${data.referralCode}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function shareWhatsApp() {
    if (!data) return;
    const text = `Hey! Join Dirt Ride Camp for amazing off-road adventures! Use my referral link and we both earn ₹200 credit: https://www.dirtridecamp.com/signup?ref=${data.referralCode}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  }

  if (loading) return <div className="text-muted py-12 text-center">Loading...</div>;
  if (!data) return null;

  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      <SectionHeader accent="Earn rewards" title="Refer & Earn" subtitle="Share your referral link. When a friend signs up, you both earn ₹200 credit." align="left" />

      <div className="bg-surface border border-border rounded-sm p-6 space-y-4">
        <div className="flex items-center gap-3">
          <Gift className="w-6 h-6 text-orange" />
          <div>
            <p className="text-sm text-muted">Your Credits</p>
            <p className="font-heading text-2xl font-bold text-orange">₹{data.referralCredits}</p>
          </div>
        </div>
      </div>

      <div className="bg-surface border border-border rounded-sm p-6 space-y-4">
        <h3 className="font-heading text-lg font-semibold">Your Referral Link</h3>
        <div className="flex gap-2">
          <div className="flex-1 bg-background border border-border rounded-sm px-4 py-3 text-sm font-mono truncate">
            dirtridecamp.com/signup?ref={data.referralCode}
          </div>
          <Button variant="outline" onClick={copyCode} className="shrink-0">
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          </Button>
        </div>
        <div className="flex gap-3">
          <Button onClick={shareWhatsApp} className="bg-[#25D366] hover:bg-[#22c55e] text-white">
            <Share2 className="w-4 h-4 mr-2" /> Share on WhatsApp
          </Button>
          <Button variant="outline" onClick={copyCode}>
            {copied ? "Copied!" : "Copy Link"}
          </Button>
        </div>
      </div>

      <div className="bg-surface border border-border rounded-sm p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-orange" />
          <h3 className="font-heading text-lg font-semibold">Your Referrals ({data.referrals.length})</h3>
        </div>
        {data.referrals.length === 0 ? (
          <p className="text-sm text-muted py-4 text-center">No referrals yet. Share your link to start earning!</p>
        ) : (
          <div className="space-y-2">
            {data.referrals.map((ref) => (
              <div key={ref.id} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                <div>
                  <p className="font-medium text-sm">{ref.referred.name || "Rider"}</p>
                  <p className="text-xs text-muted">{new Date(ref.createdAt).toLocaleDateString("en-IN")}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={ref.status === "completed" ? "success" : "warning"}>{ref.status}</Badge>
                  <span className="text-sm font-semibold text-success">+₹{ref.reward}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-surface border border-orange/20 rounded-sm p-6">
        <h3 className="font-heading text-lg font-semibold mb-3">How it works</h3>
        <div className="space-y-3 text-sm text-muted">
          <div className="flex gap-3"><span className="text-orange font-bold">1.</span> Share your unique referral link with friends</div>
          <div className="flex gap-3"><span className="text-orange font-bold">2.</span> They sign up using your link</div>
          <div className="flex gap-3"><span className="text-orange font-bold">3.</span> You earn ₹200 credit for each signup</div>
          <div className="flex gap-3"><span className="text-orange font-bold">4.</span> Use credits towards rides & training bookings</div>
        </div>
      </div>
    </div>
  );
}
