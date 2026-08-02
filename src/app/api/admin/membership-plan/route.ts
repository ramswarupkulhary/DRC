import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;
  const role = (session.user as { role?: string }).role;
  if (role !== "admin" && role !== "coordinator") return null;
  return session;
}

export async function GET() {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const plan = await prisma.membershipPlan.findFirst({ where: { active: true } });
  if (!plan) return NextResponse.json({ plan: null });

  return NextResponse.json({
    plan: {
      id: plan.id,
      name: plan.name,
      price: plan.price,
      duration: plan.duration,
      description: plan.description,
      benefits: plan.benefits,
      upiId: plan.upiId,
    },
  });
}

export async function PUT(req: Request) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { price, upiId, benefits, name, description, duration } = body;

  let plan = await prisma.membershipPlan.findFirst({ where: { active: true } });

  if (plan) {
    plan = await prisma.membershipPlan.update({
      where: { id: plan.id },
      data: {
        ...(price !== undefined && { price: Number(price) }),
        ...(upiId !== undefined && { upiId }),
        ...(benefits !== undefined && { benefits }),
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(duration !== undefined && { duration: Number(duration) }),
      },
    });
  } else {
    plan = await prisma.membershipPlan.create({
      data: {
        name: name || "DRC Membership",
        slug: "drc-membership",
        tier: "drc",
        price: Number(price) || 999,
        duration: Number(duration) || 365,
        description: description || "Annual DRC membership with welcome kit",
        benefits: benefits || "[]",
        upiId: upiId || "ramswarup.kulhary@ybl",
      },
    });
  }

  return NextResponse.json({
    plan: {
      id: plan.id,
      name: plan.name,
      price: plan.price,
      duration: plan.duration,
      description: plan.description,
      benefits: plan.benefits,
      upiId: plan.upiId,
    },
  });
}
