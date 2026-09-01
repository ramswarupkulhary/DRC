"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { Tag, X, CheckCircle2 } from "lucide-react";
import { formatINR } from "@/lib/programs";

interface ValidatedCoupon {
  code: string;
  type: string;
  value: number;
  minAmount: number;
}

export interface AppliedCoupon {
  code: string;
  discount: number;
  finalAmount: number;
}

/**
 * Reusable coupon field. Validates against /api/coupons/validate and reports the
 * discount back to the parent. Recomputes automatically when the base amount changes.
 */
export function CouponInput({
  amount,
  onChange,
}: {
  amount: number;
  onChange: (applied: AppliedCoupon | null) => void;
}) {
  const [code, setCode] = useState("");
  const [coupon, setCoupon] = useState<ValidatedCoupon | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const computed = useMemo(() => {
    if (!coupon) return null;
    if (coupon.minAmount && amount < coupon.minAmount) return { invalid: true as const };
    const discount =
      coupon.type === "percentage"
        ? Math.round((amount * coupon.value) / 100)
        : Math.min(amount, coupon.value);
    return { invalid: false as const, discount, finalAmount: Math.max(0, amount - discount) };
  }, [coupon, amount]);

  // Report result to the parent whenever it changes.
  const report = useCallback(onChange, [onChange]);
  useEffect(() => {
    if (coupon && computed && !computed.invalid) {
      report({ code: coupon.code, discount: computed.discount, finalAmount: computed.finalAmount });
    } else {
      report(null);
    }
  }, [coupon, computed, report]);

  async function apply() {
    if (!code.trim()) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: code.trim().toUpperCase() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Invalid coupon");
        setCoupon(null);
        return;
      }
      if (data.minAmount && amount < data.minAmount) {
        setError(`Minimum order of ${formatINR(data.minAmount)} required for this coupon.`);
        setCoupon(null);
        return;
      }
      setCoupon({ code: data.code, type: data.type, value: data.value, minAmount: data.minAmount });
    } catch {
      setError("Could not validate coupon.");
    } finally {
      setLoading(false);
    }
  }

  function remove() {
    setCoupon(null);
    setCode("");
    setError("");
  }

  if (coupon && computed && !computed.invalid) {
    return (
      <div className="flex items-center justify-between bg-success/10 border border-success/30 rounded-sm px-3 py-2.5">
        <div className="flex items-center gap-2 text-sm">
          <CheckCircle2 className="w-4 h-4 text-success" />
          <span className="text-success font-medium">{coupon.code}</span>
          <span className="text-muted">− {formatINR(computed.discount)}</span>
        </div>
        <button type="button" onClick={remove} className="text-muted hover:text-foreground" aria-label="Remove coupon">
          <X className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      {coupon && computed?.invalid && (
        <p className="text-xs text-warning">Coupon {coupon.code} needs a higher amount — it will apply once the total qualifies.</p>
      )}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Tag className="w-4 h-4 text-muted absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), apply())}
            placeholder="Coupon code"
            className="w-full pl-9 pr-3 py-2.5 bg-background border border-border rounded-sm text-sm text-foreground placeholder:text-muted focus:border-orange focus:outline-none uppercase"
          />
        </div>
        <button
          type="button"
          onClick={apply}
          disabled={loading || !code.trim()}
          className="px-4 py-2.5 text-sm font-semibold border border-orange text-orange rounded-sm hover:bg-orange hover:text-white transition-colors disabled:opacity-50"
        >
          {loading ? "…" : "Apply"}
        </button>
      </div>
      {error && <p className="text-xs text-error">{error}</p>}
    </div>
  );
}
