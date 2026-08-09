import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const amount = searchParams.get("amount") || "0";

  const settings = await prisma.siteSetting.findMany({
    where: { key: { in: ["razorpay_key_id", "razorpay_key_secret", "upi_id", "upi_name"] } },
  });

  const map: Record<string, string> = {};
  settings.forEach((s) => { map[s.key] = s.value; });

  const razorpayEnabled = !!(map.razorpay_key_id && map.razorpay_key_secret);

  if (razorpayEnabled) {
    return NextResponse.json({ razorpayEnabled: true });
  }

  const upiId = map.upi_id || "ramswarup.kulhary@ybl";
  const upiName = map.upi_name || "Dirt Ride Camp";
  const upiParams = `pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(upiName)}&am=${amount}&cu=INR`;

  return NextResponse.json({
    razorpayEnabled: false,
    upiIntentUrls: {
      gpay: `tez://upi/pay?${upiParams}`,
      phonepe: `phonepe://pay?${upiParams}`,
      paytm: `paytmmp://pay?${upiParams}`,
      generic: `upi://pay?${upiParams}`,
    },
  });
}
