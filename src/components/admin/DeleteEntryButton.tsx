"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";

export function DeleteEntryButton({ endpoint, label, eventSlug, onDeleted, disabled = false }: { endpoint: string; label: string; eventSlug?: string; onDeleted: () => void; disabled?: boolean }) {
    const [deleting, setDeleting] = useState(false);
    const [error, setError] = useState("");

    async function remove() {
        if (deleting || disabled) return;
        if (!window.confirm(`Delete ${label}? This removes the entry from admin and rider lists. It does not issue a refund or erase payment/audit records.`)) return;
        setDeleting(true);
        setError("");
        try {
            const response = await fetch(endpoint, { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ confirmDelete: true, eventSlug }) });
            const data = await response.json().catch(() => ({}));
            if (!response.ok) throw new Error(data.error || `Could not delete entry (HTTP ${response.status}).`);
            onDeleted();
        } catch (failure) { setError(failure instanceof Error ? failure.message : "Could not delete entry."); }
        finally { setDeleting(false); }
    }

    return <div><button type="button" onClick={remove} disabled={deleting || disabled} title={disabled ? "Resolve the pending or uncertain refund before deleting" : `Delete ${label}`} aria-label={`Delete ${label}`} className="inline-flex items-center gap-1 text-xs text-error disabled:opacity-50 disabled:cursor-not-allowed"><Trash2 className="h-4 w-4" />{deleting ? "Deleting..." : "Delete"}</button>{error && <p role="alert" className="mt-1 max-w-xs text-xs text-error">{error}</p>}</div>;
}