"use client";

import { useEffect, useRef, useState } from "react";
import { Download, FileText, Trash2, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface EventDocumentRow { id: string; displayText: string; filename: string; size: number; _count: { downloads: number } }

export function EventDocumentsManager({ eventId, eventTitle, onClose }: { eventId: string; eventTitle: string; onClose: () => void }) {
    const [documents, setDocuments] = useState<EventDocumentRow[]>([]);
    const [displayText, setDisplayText] = useState("");
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const fileInput = useRef<HTMLInputElement>(null);

    async function load() {
        const response = await fetch(`/api/admin/events/${eventId}/documents`);
        if (!response.ok) throw new Error("Could not load event documents.");
        setDocuments(await response.json());
    }

    useEffect(() => {
        let active = true;
        fetch(`/api/admin/events/${eventId}/documents`).then(async (response) => {
            if (!response.ok) throw new Error("Could not load event documents.");
            const data = await response.json();
            if (active) setDocuments(data);
        }).catch((failure) => { if (active) setError(failure.message); }).finally(() => { if (active) setLoading(false); });
        return () => { active = false; };
    }, [eventId]);

    async function upload(event: React.FormEvent) {
        event.preventDefault();
        if (!file) return;
        setSaving(true);
        setError("");
        try {
            const form = new FormData();
            form.set("displayText", displayText.trim());
            form.set("file", file);
            const response = await fetch(`/api/admin/events/${eventId}/documents`, { method: "POST", body: form });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || "Upload failed.");
            setDisplayText("");
            setFile(null);
            if (fileInput.current) fileInput.current.value = "";
            await load();
        } catch (failure) { setError(failure instanceof Error ? failure.message : "Upload failed."); }
        finally { setSaving(false); }
    }

    async function remove(document: EventDocumentRow) {
        if (!confirm(`Remove the public link for "${document.displayText}"?`)) return;
        try {
            const response = await fetch(`/api/admin/events/${eventId}/documents/${document.id}`, { method: "DELETE" });
            if (!response.ok) throw new Error("Could not remove the document.");
            await load();
        } catch (failure) { setError(failure instanceof Error ? failure.message : "Remove failed."); }
    }

    return <div className="fixed inset-0 z-50 bg-black/60 p-4 sm:p-8 overflow-y-auto flex items-start justify-center">
        <div role="dialog" aria-modal="true" aria-labelledby="event-documents-title" className="w-full max-w-3xl bg-background border border-border">
            <header className="p-5 border-b border-border flex items-center justify-between gap-4"><div><h2 id="event-documents-title" className="font-heading text-xl font-bold">Full Race Brief PDFs</h2><p className="text-sm text-muted mt-1">{eventTitle}</p></div><button onClick={onClose} aria-label="Close PDF manager"><X className="h-5 w-5" /></button></header>
            <div className="p-5 space-y-6">
                {error && <p role="alert" className="text-error">{error}</p>}
                {loading ? <p className="text-muted">Loading documents...</p> : <ul className="divide-y divide-border">{documents.map((document) => <li key={document.id} className="py-4 flex items-start justify-between gap-4"><div className="min-w-0"><a href={`/api/event-documents/${document.id}`} download className="inline-flex items-center gap-2 text-orange break-words"><Download className="h-4 w-4 shrink-0" />{document.displayText}</a><p className="text-xs text-muted mt-1 break-all">{document.filename} · {(document.size / 1024).toFixed(0)} KB · {document._count.downloads} downloads</p></div><button onClick={() => remove(document)} title="Remove document link" aria-label={`Remove ${document.displayText}`} className="text-error p-1"><Trash2 className="h-4 w-4" /></button></li>)}</ul>}
                <form onSubmit={upload} className="border-t border-border pt-5 space-y-4">
                    <h3 className="font-heading font-semibold flex items-center gap-2"><FileText className="h-4 w-4" />Add PDF</h3>
                    <label className="block text-sm">Display text<input required maxLength={150} value={displayText} onChange={(event) => setDisplayText(event.target.value)} className="mt-2 w-full bg-background border border-border p-3" /></label>
                    <label className="block text-sm">PDF file (up to 10 MB)<input ref={fileInput} required type="file" accept="application/pdf,.pdf" onChange={(event) => setFile(event.target.files?.[0] || null)} className="mt-2 block w-full max-w-full text-sm" /></label>
                    <Button type="submit" loading={saving} disabled={!file || !displayText.trim()}><Upload className="h-4 w-4" />Upload PDF</Button>
                </form>
            </div>
        </div>
    </div>;
}