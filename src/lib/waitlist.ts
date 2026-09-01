import { prisma } from "@/lib/prisma";
import { notifyRider } from "@/lib/notify";

/**
 * Notifies the next waiting rider that a slot has opened for a ride or training.
 * Called when a confirmed registration is cancelled/refunded.
 */
export async function promoteWaitlist(opts: { rideId?: string | null; trainingId?: string | null }): Promise<void> {
    const { rideId, trainingId } = opts;
    if (!rideId && !trainingId) return;

    const next = await prisma.waitlist.findFirst({
        where: {
            ...(rideId ? { rideId } : {}),
            ...(trainingId ? { trainingId } : {}),
            status: "waiting",
            notified: false,
        },
        orderBy: { createdAt: "asc" },
    });
    if (!next) return;

    let title = "";
    let link = "";
    if (rideId) {
        const ride = await prisma.ride.findUnique({ where: { id: rideId }, select: { title: true, slug: true } });
        if (!ride) return;
        title = ride.title;
        link = `/rides/${ride.slug}`;
    } else if (trainingId) {
        const training = await prisma.training.findUnique({ where: { id: trainingId }, select: { title: true, slug: true } });
        if (!training) return;
        title = training.title;
        link = `/trainings/${training.slug}`;
    }

    await prisma.waitlist.update({ where: { id: next.id }, data: { notified: true, status: "notified" } });

    await notifyRider({
        userId: next.userId,
        type: "waitlist",
        title: "A slot just opened up!",
        message: `Good news — a spot for "${title}" is now available. Book quickly before it's gone!`,
        link,
        email: true,
        push: true,
        whatsapp: true,
    });
}
