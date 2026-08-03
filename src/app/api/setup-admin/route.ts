import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashSync } from "bcryptjs";

export async function GET() {
  const existing = await prisma.user.findUnique({
    where: { email: "admin@dirtridecamp.com" },
  });

  if (existing) {
    return NextResponse.json({ message: "Admin already exists", id: existing.id });
  }

  const admin = await prisma.user.create({
    data: {
      name: "DRC Admin",
      email: "admin@dirtridecamp.com",
      passwordHash: hashSync("admin123", 10),
      role: "admin",
      referralCode: "DRCADMIN",
    },
  });

  return NextResponse.json({ message: "Admin created", id: admin.id });
}
