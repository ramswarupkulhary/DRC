import { prisma } from "@/lib/prisma";

/**
 * Resolve the active EventCategory for a given event slug + category slug.
 * Returns null if the event or category doesn't exist, or the category is inactive.
 */
export async function resolveEventCategory(eventSlug: string, categorySlug: string) {
  const event = await prisma.event.findUnique({ where: { slug: eventSlug } });
  if (!event) return null;
  const category = await prisma.eventCategory.findUnique({
    where: { eventId_slug: { eventId: event.id, slug: categorySlug } },
  });
  if (!category || !category.active) return null;
  return { event, category };
}
