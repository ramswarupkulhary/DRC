import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const body = await req.json();

  const inquiry = await prisma.corporateInquiry.create({
    data: {
      companyName: body.companyName,
      contactName: body.contactName,
      email: body.email,
      phone: body.phone,
      groupSize: body.groupSize,
      eventType: body.eventType,
      preferredDate: body.preferredDate,
      budget: body.budget,
      requirements: body.requirements,
    },
  });

  return NextResponse.json(inquiry, { status: 201 });
}
