import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as { role?: string }).role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const products = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ products });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as { role?: string }).role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();

  if (!body.name || !body.description || !body.category || body.price == null) {
    return NextResponse.json(
      { error: "Name, description, category, and price are required" },
      { status: 400 }
    );
  }

  const slug = slugify(body.name);

  const product = await prisma.product.create({
    data: {
      name: body.name,
      slug,
      description: body.description,
      price: body.price,
      salePrice: body.salePrice ?? null,
      category: body.category,
      images: body.images || null,
      sizes: body.sizes || null,
      stock: body.stock ?? 0,
      featured: body.featured || false,
      active: body.active ?? true,
    },
  });

  return NextResponse.json({ product }, { status: 201 });
}
