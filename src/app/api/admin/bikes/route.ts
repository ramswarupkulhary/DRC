import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function isAdmin(session: unknown) {
  return !!session && (session as { user?: { role?: string } }).user?.role === "admin";
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!isAdmin(session)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const bikes = await prisma.rentalBike.findMany({ orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }] });
  return NextResponse.json({ bikes });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!isAdmin(session)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { name, price } = await req.json();
  if (!name || price == null) {
    return NextResponse.json({ error: "Name and price are required" }, { status: 400 });
  }
  const max = await prisma.rentalBike.aggregate({ _max: { sortOrder: true } });
  const bike = await prisma.rentalBike.create({
    data: { name: String(name).trim(), price: parseInt(price, 10) || 0, sortOrder: (max._max.sortOrder ?? 0) + 1 },
  });
  return NextResponse.json({ bike }, { status: 201 });
}
