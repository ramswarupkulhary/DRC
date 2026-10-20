import { prisma } from "@/lib/prisma";
import { FileText } from "lucide-react";
import { EventDocumentViewer } from "@/components/events/EventDocumentViewer";

export async function EventDocuments({ eventSlug }: { eventSlug: string }) {
    const event = await prisma.event.findUnique({ where: { slug: eventSlug }, select: { documents: { where: { active: true }, orderBy: { createdAt: "asc" }, select: { id: true, displayText: true, size: true } } } });
    if (!event?.documents.length) return null;
    return <section id="full-race-brief" className="border-b border-border scroll-mt-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 py-12">
            <h2 className="font-heading text-2xl font-bold uppercase flex items-center gap-3"><FileText className="h-6 w-6 text-orange" />Full Race Brief</h2>
            <EventDocumentViewer documents={event.documents} />
        </div>
    </section>;
}