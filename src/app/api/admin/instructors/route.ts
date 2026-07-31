import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as { role?: string }).role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const instructors = await prisma.instructor.findMany({ orderBy: { name: "asc" } });
  return NextResponse.json(instructors);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as { role?: string }).role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const body = await req.json();
  const instructor = await prisma.instructor.create({
    data: {
      name: body.name,
      slug: body.slug,
      bio: body.bio,
      certifications: body.certifications || null,
      specialties: body.specialties || null,
      experience: body.experience || null,
    },
  });
  return NextResponse.json(instructor, { status: 201 });
}
