import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { resolveEventCategory } from "@/lib/eventCategories";
import Razorpay from "razorpay";

async function getRazorpayInstance() {
    const settings = await prisma.siteSetting.findMany({
        where: { key: { in: ["razorpay_key_id", "razorpay_key_secret"] } },
    });
    const map: Record<string, string> = {};
    settings.forEach((s) => {
        map[s.key] = s.value;
    });

    const keyId = map.razorpay_key_id || process.env.RAZORPAY_KEY_ID || "";
    const keySecret = map.razorpay_key_secret || process.env.RAZORPAY_KEY_SECRET || "";

    if (!keyId || !keySecret) return null;

    return { instance: new Razorpay({ key_id: keyId, key_secret: keySecret }), keyId };
}

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: "Please sign in to register." }, { status: 401 });
        }

        const body = await req.json();
        const {
            category,
            name,
            email,
            phone,
            city,
            bikeMake,
            bikeModel,
            experience,
            notes,
            stayBooked,
            registrationType = "rider",
            attendanceDays,
            foodPackage = "none",
        } = body ?? {};

        if (!name || !email || !phone || !city) {
            return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
        }
        if (registrationType !== "rider" && registrationType !== "spectator") {
            return NextResponse.json({ error: "Invalid registration type." }, { status: 400 });
        }
        if (registrationType === "rider" && (!category || !bikeMake || !bikeModel || !experience)) {
            return NextResponse.json({ error: "Race category and rider details are required." }, { status: 400 });
        }

        let event;
        let categorySlug: string;
        let categoryName: string;
        let entryAmount: number;
        if (registrationType === "rider") {
            const resolved = await resolveEventCategory("drc-ultimate-rider", String(category));
            if (!resolved) return NextResponse.json({ error: "Invalid or inactive category." }, { status: 400 });
            event = resolved.event;
            categorySlug = resolved.category.slug;
            categoryName = resolved.category.name;
            entryAmount = resolved.category.fee;
        } else {
            if (!["saturday", "sunday", "both"].includes(attendanceDays)) {
                return NextResponse.json({ error: "Please select a spectator pass." }, { status: 400 });
            }
            if (foodPackage !== "none" && foodPackage !== "full" && foodPackage !== "day") {
                return NextResponse.json({ error: "Invalid food package." }, { status: 400 });
            }
            event = await prisma.event.findUnique({ where: { slug: "drc-ultimate-rider" } });
            if (!event) return NextResponse.json({ error: "Event not found." }, { status: 404 });
            categorySlug = "spectator";
            categoryName = attendanceDays === "both"
                ? "Spectator pass — Both days"
                : `Spectator pass — ${attendanceDays === "saturday" ? "Saturday" : "Sunday"}`;
            entryAmount = attendanceDays === "saturday"
                ? event.spectatorSaturdayFee
                : attendanceDays === "sunday" ? event.spectatorSundayFee : event.spectatorWeekendFee;
        }
        const wantsStay = stayBooked === true;
        if (wantsStay && (!event.stayEnabled || event.stayTotalTents < 1)) {
            return NextResponse.json({ error: "Tent stay is currently unavailable." }, { status: 409 });
        }

        const chosenFood = registrationType === "spectator" && foodPackage !== "none"
            ? foodPackage === "full"
                ? { name: event.spectatorFullMealName, details: event.spectatorFullMealDetails, fee: event.spectatorFullMealFee }
                : { name: event.spectatorDayMealName, details: event.spectatorDayMealDetails, fee: event.spectatorDayMealFee }
            : null;
        const foodAmount = chosenFood?.fee ?? 0;
        const foodPackageName = chosenFood ? `${chosenFood.name} (${chosenFood.details})` : null;
        const stayAmount = wantsStay ? event.stayPrice : 0;
        const amount = entryAmount + foodAmount + stayAmount;
        const reservationExpiresAt = wantsStay ? new Date(Date.now() + 15 * 60 * 1000) : null;

        const rz = amount > 0 ? await getRazorpayInstance() : null;
        if (amount > 0 && !rz) {
            return NextResponse.json(
                { error: "Online payment is not configured yet. Please complete registration and pay via the instructions we email you." },
                { status: 503 },
            );
        }

        const order = amount > 0 && rz
            ? await rz.instance.orders.create({
                amount: amount * 100,
                currency: "INR",
                receipt: `ur_${categorySlug}_${Date.now()}`,
                ...(reservationExpiresAt ? { expire_by: Math.floor(reservationExpiresAt.getTime() / 1000) } : {}),
                notes: {
                    event: "drc-ultimate-rider",
                    registrationType,
                    category: categorySlug,
                    categoryName,
                    attendanceDays: attendanceDays || "",
                    foodPackage: foodPackageName || "",
                    name,
                    email,
                    phone,
                    stayBooked: String(wantsStay),
                },
            })
            : null;

        const registrationData = {
            userId: (session.user as { id: string }).id,
            eventSlug: event.slug,
            category: categorySlug,
            categoryName,
            amount,
            currency: "INR",
            paymentStatus: order ? "pending" : "paid",
            razorpayOrderId: order?.id ?? null,
            name: String(name),
            email: String(email),
            phone: String(phone),
            city: city ? String(city) : null,
            registrationType,
            attendanceDays: registrationType === "spectator" ? String(attendanceDays) : null,
            foodPackage: foodPackageName,
            foodAmount,
            bikeMake: registrationType === "rider" && bikeMake ? String(bikeMake) : null,
            bikeModel: registrationType === "rider" && bikeModel ? String(bikeModel) : null,
            experience: registrationType === "rider" && experience ? String(experience) : null,
            notes: notes ? String(notes) : null,
            stayBooked: wantsStay,
            stayAmount,
            reservationExpiresAt,
        };

        if (wantsStay) {
            await prisma.$transaction(async (tx) => {
                const now = new Date();
                const reservedTents = await tx.eventRegistration.count({
                    where: {
                        eventSlug: event.slug,
                        stayBooked: true,
                        OR: [
                            { paymentStatus: "paid" },
                            { paymentStatus: "pending", reservationExpiresAt: { gt: now } },
                        ],
                    },
                });
                if (reservedTents >= event.stayTotalTents) throw new Error("TENT_CAPACITY");
                await tx.eventRegistration.create({ data: registrationData });
            }, { isolationLevel: "Serializable" });
        } else {
            await prisma.eventRegistration.create({ data: registrationData });
        }

        return NextResponse.json({
            freeBooking: !order,
            orderId: order?.id,
            amount,
            currency: "INR",
            key: rz?.keyId,
            categoryName,
            stayAmount,
            foodAmount,
        });
    } catch (err) {
        if (err instanceof Error && err.message === "TENT_CAPACITY") {
            return NextResponse.json({ error: "All tents have just been reserved. Please try again without tent stay." }, { status: 409 });
        }
        if (typeof err === "object" && err !== null && "code" in err && err.code === "P2034") {
            return NextResponse.json({ error: "Tent availability changed during checkout. Please try again." }, { status: 409 });
        }
        console.error("[ultimate-rider create-order]", err);
        return NextResponse.json({ error: "Failed to create payment order." }, { status: 500 });
    }
}
