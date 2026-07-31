import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  return NextResponse.json({
    name: user.name || "",
    email: user.email,
    phone: user.phone || "",
    bikeName: user.bikeName || "",
    bikeCC: user.bikeCC || "",
    ridingExperience: user.ridingExperience || "",
    emergencyName: user.emergencyName || "",
    emergencyPhone: user.emergencyPhone || "",
    bloodGroup: user.bloodGroup || "",
    licenseNumber: user.licenseNumber || "",
    city: user.city || "",
  });
}

export async function PUT(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();

  await prisma.user.update({
    where: { email: session.user.email },
    data: {
      name: body.name,
      phone: body.phone || null,
      bikeName: body.bikeName || null,
      bikeCC: body.bikeCC || null,
      ridingExperience: body.ridingExperience || null,
      emergencyName: body.emergencyName || null,
      emergencyPhone: body.emergencyPhone || null,
      bloodGroup: body.bloodGroup || null,
      licenseNumber: body.licenseNumber || null,
      city: body.city || null,
    },
  });

  return NextResponse.json({ success: true });
}
