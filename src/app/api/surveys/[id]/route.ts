import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const survey = await prisma.survey.findUnique({ where: { id } });
  if (!survey) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(survey);
}
