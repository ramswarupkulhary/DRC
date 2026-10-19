import { Workbook } from "exceljs";
import JSZip from "jszip";
import type { EventRegistration } from "@/generated/prisma/client";

export type RegistrationExportRow = Pick<EventRegistration, "id" | "category" | "name" | "email" | "phone" | "createdAt"> & Partial<EventRegistration>;
export interface ExportCategory { slug: string; name: string; classLabel: string | null }

export async function buildRegistrationWorkbook(eventTitle: string, registrations: RegistrationExportRow[], categories: ExportCategory[]): Promise<Uint8Array> {
    const workbook = new Workbook();
    const sheet = workbook.addWorksheet("Registrations");
    const classBySlug = new Map(categories.map((category) => [category.slug, category.classLabel]));
    sheet.columns = [
        ["Registration ID", "id", 30], ["Event", "event", 28], ["Registered at (IST)", "date", 26],
        ["Type", "registrationType", 14], ["Name", "name", 28], ["Email", "email", 35], ["Phone", "phone", 20],
        ["City", "city", 22], ["Category", "categoryName", 45], ["Class", "classes", 25],
        ["Amount", "amount", 14], ["Member discount", "membershipDiscount", 18], ["Currency", "currency", 12],
        ["Booking status", "status", 18], ["Payment status", "paymentStatus", 18], ["Payment ID", "razorpayPaymentId", 28],
        ["Order ID", "razorpayOrderId", 28], ["Tent booked", "tent", 14], ["Tent amount", "stayAmount", 14],
        ["Bike make", "bikeMake", 20], ["Bike model", "bikeModel", 20], ["Experience", "experience", 22],
        ["Cancellation reason", "cancellationReason", 35], ["Notes", "notes", 45],
    ].map(([header, key, width]) => ({ header: String(header), key: String(key), width: Number(width) }));
    for (const registration of registrations) {
        sheet.addRow({ ...registration, event: eventTitle, date: registration.createdAt.toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }), tent: registration.stayBooked ? "Yes" : "No", classes: registration.category.split(",").map((slug) => classBySlug.get(slug)).filter(Boolean).join(", ") });
    }
    sheet.getRow(1).font = { bold: true };
    sheet.views = [{ state: "frozen", ySplit: 1 }];
    sheet.autoFilter = { from: { row: 1, column: 1 }, to: { row: 1, column: sheet.columnCount } };
    return new Uint8Array(await workbook.xlsx.writeBuffer());
}

export async function buildCategoryWorkbooks(eventTitle: string, registrations: RegistrationExportRow[], categories: ExportCategory[], selectedCategory?: string): Promise<Uint8Array> {
    const archive = new JSZip();
    const definitions = new Map(categories.map((category) => [category.slug, category]));
    for (const registration of registrations.filter((row) => row.registrationType !== "spectator")) {
        for (const slug of registration.category.split(",")) if ((!selectedCategory || slug === selectedCategory) && !definitions.has(slug)) definitions.set(slug, { slug, name: slug, classLabel: null });
    }
    for (const category of definitions.values()) {
        const rows = registrations.filter((row) => row.registrationType !== "spectator" && row.category.split(",").includes(category.slug));
        const filename = `${category.classLabel ? `${category.classLabel}-` : ""}${category.slug}`.replace(/[^a-zA-Z0-9_-]/g, "-");
        archive.file(`${filename}-registrations.xlsx`, await buildRegistrationWorkbook(eventTitle, rows, categories));
    }
    const spectators = registrations.filter((row) => row.registrationType === "spectator");
    if (spectators.length) archive.file("spectator-passes.xlsx", await buildRegistrationWorkbook(eventTitle, spectators, []));
    if (!Object.keys(archive.files).length) archive.file("registrations.xlsx", await buildRegistrationWorkbook(eventTitle, [], categories));
    return archive.generateAsync({ type: "uint8array", compression: "DEFLATE" });
}