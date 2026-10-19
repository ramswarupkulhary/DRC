import { prisma } from "@/lib/prisma";
import { Download, FileText } from "lucide-react";

export async function EventDocuments({ eventSlug }: { eventSlug: string }) {
    const event = await prisma.event.findUnique({ where: { slug: eventSlug }, select: { documents: { where: { active: true }, orderBy: { createdAt: "asc" }, select: { id: true, displayText: true, size: true } } } });
    if (!event?.documents.length) return null;
    return <section id="full-race-brief" className="border-b border-border scroll-mt-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 py-12">
            <h2 className="font-heading text-2xl font-bold uppercase flex items-center gap-3"><FileText className="h-6 w-6 text-orange" />Full Race Brief</h2>
            <ul className="mt-6 divide-y divide-border">{event.documents.map((document) => <li key={document.id}><a href={`/api/event-documents/${document.id}`} download className="flex items-center justify-between gap-4 py-4 text-orange hover:underline"><span className="min-w-0 break-words">{document.displayText}</span><span className="inline-flex items-center gap-2 shrink-0 text-xs text-muted">PDF · {(document.size / 1024).toFixed(0)} KB<Download className="h-4 w-4" /></span></a></li>)}</ul>
        </div>
    </section>;
}