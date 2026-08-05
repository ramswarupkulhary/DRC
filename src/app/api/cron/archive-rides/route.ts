import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET || process.env.NEXTAUTH_SECRET;
  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();

  const result = await prisma.ride.updateMany({
    where: {
      status: { in: ["published", "draft"] },
      endDate: { lt: now },
    },
    data: { status: "past" },
  });

  return NextResponse.json({ archived: result.count, timestamp: now.toISOString() });
}
