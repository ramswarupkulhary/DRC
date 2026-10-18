import { NextResponse } from "next/server";
import { getContactInfo } from "@/lib/contact";

// Public, read-only contact details for footer/contact page.
export async function GET() {
    const info = await getContactInfo();
    return NextResponse.json(info);
}
