import { prisma } from "@/lib/prisma";
import { getProgram } from "@/lib/programs";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const {
            fullName,
            age,
            phone,
            email,
            emergencyName,
            emergencyPhone,
            motorcycleModel,
            ridingExperience,
            offRoadExperience,
            programSlug,
            participants,
            companions,
            lunch,
            medical,
        } = body;

        if (!fullName || !email || !phone || !programSlug) {
            return NextResponse.json(
                { error: "Name, email, phone and selected program are required." },
                { status: 400 }
            );
        }

        const program = getProgram(programSlug);
        if (!program) {
            return NextResponse.json({ error: "Invalid program selected." }, { status: 400 });
        }

        const details = [
            `Program: ${program.name} (${program.slug})`,
            `Participants: ${participants || 1}`,
            companions ? `Family/Friends: ${companions}` : null,
            `Age: ${age || "—"}`,
            `Motorcycle: ${motorcycleModel || "—"}`,
            `Riding experience: ${ridingExperience || "—"}`,
            `Off-road experience: ${offRoadExperience || "—"}`,
            `Emergency contact: ${emergencyName || "—"} / ${emergencyPhone || "—"}`,
            program.optionalLunch ? `Optional lunch: ${lunch ? "Yes" : "No"}` : null,
            medical ? `Medical/allergy: ${medical}` : null,
        ]
            .filter(Boolean)
            .join("\n");

        await prisma.contactMessage.create({
            data: {
                name: fullName,
                email,
                phone,
                subject: `Program Booking — ${program.name}`,
                message: details,
            },
        });

        const admins = await prisma.user.findMany({ where: { role: "admin" }, select: { id: true } });
        await Promise.all(
            admins.map((admin) =>
                prisma.notification.create({
                    data: {
                        userId: admin.id,
                        type: "booking",
                        title: "New Program Booking",
                        message: `${fullName} requested to book ${program.name}`,
                        link: "/admin/messages",
                    },
                })
            )
        );

        return NextResponse.json({ success: true });
    } catch {
        return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
    }
}
