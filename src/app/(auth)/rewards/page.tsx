"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Button } from "@/components/ui/Button";
import { Gift, Star, Ticket, Copy, CheckCircle2 } from "lucide-react";

interface Reward {
    id: string;
    label: string;
    description: string;
    points: number;
    value: number;
    minAmount: number;
}
interface Coupon {
    code: string;
    value: number;
    minAmount: number;
    validUntil: string;
    usedCount: number;
    maxUses: number | null;
}

export default function RewardsPage() {
    const { status } = useSession();
    const router = useRouter();
    const [points, setPoints] = useState(0);
    const [rewards, setRewards] = useState<Reward[]>([]);
    const [coupons, setCoupons] = useState<Coupon[]>([]);
    const [loading, setLoading] = useState(true);
    const [redeeming, setRedeeming] = useState<string | null>(null);
    const [error, setError] = useState("");
    const [copied, setCopied] = useState("");

    const load = useCallback(() => {
        fetch("/api/rewards")
            .then((r) => r.json())
            .then((d) => {
                setPoints(d.points || 0);
                setRewards(d.rewards || []);
                setCoupons(d.coupons || []);
            })
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        if (status === "unauthenticated") router.push("/login?redirect=/rewards");
        if (status === "authenticated") load();
    }, [status, router, load]);

    async function redeem(id: string) {
        setRedeeming(id);
        setError("");
        try {
            const res = await fetch("/api/rewards/redeem", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ rewardId: id }),
            });
            const data = await res.json();
            if (!res.ok) {
                setError(data.error || "Could not redeem.");
                return;
            }
            load();
        } finally {
            setRedeeming(null);
        }
    }

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
            <SectionHeader accent="Loyalty rewards" title="DRC Rewards" align="center" />

            <div className="mt-8 bg-surface border border-orange/30 rounded-sm p-6 text-center">
                <p className="text-sm text-muted uppercase tracking-wider">Your Points</p>
                <div className="flex items-center justify-center gap-2 mt-1">
                    <Star className="w-7 h-7 fill-orange text-orange" />
                    <span className="font-heading text-5xl font-bold text-orange">{loading ? "…" : points}</span>
                </div>
                <p className="text-xs text-muted mt-2">Earn 1 point for every ₹100 spent on rides, training & programs.</p>
            </div>

            {error && <div className="mt-6 bg-error/10 border border-error/30 text-error text-sm p-3 rounded-sm">{error}</div>}

            <h2 className="font-heading text-xl font-bold mt-10 mb-4 flex items-center gap-2">
                <Gift className="w-5 h-5 text-orange" /> Redeem Rewards
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {rewards.map((r) => {
                    const affordable = points >= r.points;
                    return (
                        <div key={r.id} className="bg-surface border border-border rounded-sm p-5 flex flex-col">
                            <div className="font-heading text-2xl font-bold text-orange">{r.label}</div>
                            <p className="text-sm text-foreground/70 mt-1 flex-1">{r.description}</p>
                            <p className="text-xs text-muted mt-3">{r.points} points</p>
                            <Button
                                size="sm"
                                className="w-full mt-3"
                                disabled={!affordable || redeeming === r.id}
                                loading={redeeming === r.id}
                                onClick={() => redeem(r.id)}
                            >
                                {affordable ? "Redeem" : `Need ${r.points - points} more`}
                            </Button>
                        </div>
                    );
                })}
            </div>

            <h2 className="font-heading text-xl font-bold mt-12 mb-4 flex items-center gap-2">
                <Ticket className="w-5 h-5 text-orange" /> Your Coupons
            </h2>
            {coupons.length === 0 ? (
                <p className="text-muted text-sm">No coupons yet. Redeem your points above to get one.</p>
            ) : (
                <div className="space-y-3">
                    {coupons.map((c) => {
                        const used = c.maxUses !== null && c.usedCount >= c.maxUses;
                        const expired = new Date(c.validUntil) < new Date();
                        return (
                            <div key={c.code} className="bg-surface border border-border rounded-sm p-4 flex items-center justify-between gap-4">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <code className="font-mono font-bold text-orange">{c.code}</code>
                                        <button
                                            onClick={() => {
                                                navigator.clipboard.writeText(c.code);
                                                setCopied(c.code);
                                                setTimeout(() => setCopied(""), 1500);
                                            }}
                                            className="text-muted hover:text-orange"
                                        >
                                            {copied === c.code ? <CheckCircle2 className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4" />}
                                        </button>
                                    </div>
                                    <p className="text-xs text-muted mt-1">
                                        ₹{c.value} off · min ₹{c.minAmount} · valid till {new Date(c.validUntil).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                                    </p>
                                </div>
                                {(used || expired) && <span className="text-xs text-muted">{used ? "Used" : "Expired"}</span>}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
