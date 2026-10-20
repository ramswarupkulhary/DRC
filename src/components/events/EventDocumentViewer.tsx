"use client";

import { useEffect, useRef, useState } from "react";
import { Download, X } from "lucide-react";

interface EventPdf { id: string; displayText: string; size: number }

export function EventDocumentViewer({ documents }: { documents: EventPdf[] }) {
    const [selected, setSelected] = useState<EventPdf | null>(null);
    const [loading, setLoading] = useState(false);
    const dialogRef = useRef<HTMLDialogElement>(null);

    useEffect(() => {
        if (!selected) return;
        const dialog = dialogRef.current;
        if (!dialog) return;
        dialog.showModal();
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => { dialog.close(); document.body.style.overflow = previousOverflow; };
    }, [selected]);

    function open(document: EventPdf) {
        setLoading(true);
        setSelected(document);
    }

    return <>
        <ul className="mt-6 divide-y divide-border">{documents.map((document) => <li key={document.id} className="flex items-center gap-4 py-4">
            <button type="button" onClick={() => open(document)} className="min-w-0 flex-1 text-left text-orange hover:underline break-words" aria-haspopup="dialog">{document.displayText}</button>
            <span className="shrink-0 text-xs text-muted">PDF · {(document.size / 1024).toFixed(0)} KB</span>
            <a href={`/api/event-documents/${document.id}`} download aria-label={`Download ${document.displayText}`} title={`Download ${document.displayText}`} className="shrink-0 p-2 text-orange hover:bg-orange/10"><Download className="h-5 w-5" /></a>
        </li>)}</ul>
        <dialog ref={dialogRef} onCancel={(event) => { event.preventDefault(); setSelected(null); }} aria-labelledby="event-pdf-viewer-title" className="m-auto h-[85dvh] max-h-[calc(100dvh_-_2rem)] w-[calc(100%_-_2rem)] max-w-6xl border border-border bg-background p-0 text-foreground backdrop:bg-black/70">
            {selected && <div className="flex h-full min-h-0 flex-col">
                <header className="flex flex-wrap items-center gap-3 border-b border-border px-4 py-3">
                    <h3 id="event-pdf-viewer-title" className="min-w-0 flex-1 font-heading text-lg font-semibold break-words">{selected.displayText}</h3>
                    <a href={`/api/event-documents/${selected.id}`} download className="inline-flex items-center gap-2 text-sm text-orange"><Download className="h-4 w-4" />Download PDF</a>
                    <button type="button" onClick={() => setSelected(null)} aria-label="Close PDF viewer" title="Close PDF viewer" className="shrink-0 p-2 hover:text-orange"><X className="h-5 w-5" /></button>
                </header>
                {loading && <p role="status" className="px-4 py-2 text-sm text-muted">Loading PDF...</p>}
                <iframe key={selected.id} src={`/api/event-documents/${selected.id}?view=inline#toolbar=1`} title={selected.displayText} onLoad={() => setLoading(false)} className="min-h-0 w-full flex-1 border-0 bg-white" />
            </div>}
        </dialog>
    </>;
}