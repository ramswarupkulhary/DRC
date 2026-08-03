import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
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
    city: user.city || "",
    address: user.address || "",
    addressState: user.addressState || "",
    pincode: user.pincode || "",
    tshirtSize: user.tshirtSize || "",
    instagramHandle: user.instagramHandle || "",
    bikeName: user.bikeName || "",
    bikeCC: user.bikeCC || "",
    ridingExperience: user.ridingExperience || "",
    licenseNumber: user.licenseNumber || "",
    emergencyName: user.emergencyName || "",
    emergencyPhone: user.emergencyPhone || "",
    bloodGroup: user.bloodGroup || "",
    image: user.image || null,
  });
}

export async function PUT(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { section } = body;

  let data: Record<string, unknown>;

  if (section === "personal") {
    data = {
      name: body.name,
      phone: body.phone || null,
      city: body.city || null,
      address: body.address || null,
      addressState: body.addressState || null,
      pincode: body.pincode || null,
      tshirtSize: body.tshirtSize || null,
      instagramHandle: body.instagramHandle || null,
    };
  } else if (section === "bike") {
    data = {
      bikeName: body.bikeName || null,
      bikeCC: body.bikeCC || null,
      ridingExperience: body.ridingExperience || null,
      licenseNumber: body.licenseNumber || null,
    };
  } else if (section === "emergency") {
    data = {
      emergencyName: body.emergencyName || null,
      emergencyPhone: body.emergencyPhone || null,
      bloodGroup: body.bloodGroup || null,
    };
  } else {
    data = {
      name: body.name,
      phone: body.phone || null,
      city: body.city || null,
      address: body.address || null,
      addressState: body.addressState || null,
      pincode: body.pincode || null,
      tshirtSize: body.tshirtSize || null,
      instagramHandle: body.instagramHandle || null,
      bikeName: body.bikeName || null,
      bikeCC: body.bikeCC || null,
      ridingExperience: body.ridingExperience || null,
      emergencyName: body.emergencyName || null,
      emergencyPhone: body.emergencyPhone || null,
      bloodGroup: body.bloodGroup || null,
      licenseNumber: body.licenseNumber || null,
      image: body.image || null,
    };
  }

  await prisma.user.update({
    where: { email: session.user.email },
    data,
  });

  return NextResponse.json({ success: true });
}
