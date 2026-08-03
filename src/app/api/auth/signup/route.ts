import { prisma } from "@/lib/prisma";
import { hashSync } from "bcryptjs";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { name, email, phone, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Name, email, and password are required." }, { status: 400 });
    }

    const existing = await prisma.user.findFirst({
      where: { OR: [{ email }, ...(phone ? [{ phone }] : [])] },
    });

    if (existing) {
      if (existing.email === email && !existing.passwordHash) {
        await prisma.user.update({
          where: { id: existing.id },
          data: {
            name,
            phone: phone || existing.phone,
            passwordHash: hashSync(password, 10),
          },
        });
        return NextResponse.json({ id: existing.id, name, email, claimed: true }, { status: 201 });
      }

      return NextResponse.json({ error: "An account with this email or phone already exists." }, { status: 409 });
    }

    const user = await prisma.user.create({
      data: {
        name,
        email,
        phone: phone || null,
        passwordHash: hashSync(password, 10),
        role: "rider",
      },
    });

    return NextResponse.json({ id: user.id, name: user.name, email: user.email }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}
