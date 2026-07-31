import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  const userId = (session.user as { id: string }).id;
  const body = await req.json();

  if (!body.surveyId || !body.answers) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const existing = await prisma.surveyResponse.findFirst({
    where: { surveyId: body.surveyId, userId },
  });

  if (existing) return NextResponse.json({ error: "Already submitted" }, { status: 400 });

  const response = await prisma.surveyResponse.create({
    data: {
      surveyId: body.surveyId,
      userId,
      answers: JSON.stringify(body.answers),
      npsScore: body.npsScore || null,
    },
  });

  return NextResponse.json(response, { status: 201 });
}
