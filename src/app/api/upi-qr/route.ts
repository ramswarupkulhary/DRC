import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import QRCode from "qrcode";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const amount = searchParams.get("amount");

  if (!amount || isNaN(Number(amount))) {
    return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
  }

  const settings = await prisma.siteSetting.findMany({
    where: { key: { in: ["upi_id", "upi_name"] } },
  });

  const map: Record<string, string> = {};
  settings.forEach((s) => { map[s.key] = s.value; });

  const upiId = map.upi_id || "ramswarup.kulhary@ybl";
  const upiName = map.upi_name || "Dirt Ride Camp";

  const upiParams = `pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(upiName)}&am=${amount}&cu=INR`;
  const upiUrl = `upi://pay?${upiParams}`;

  const appUrls = {
    gpay: `tez://upi/pay?${upiParams}`,
    phonepe: `phonepe://pay?${upiParams}`,
    paytm: `paytmmp://pay?${upiParams}`,
    generic: upiUrl,
  };

  try {
    const qrDataUrl = await QRCode.toDataURL(upiUrl, {
      width: 280,
      margin: 2,
      color: { dark: "#000000", light: "#ffffff" },
    });

    return NextResponse.json({ qrDataUrl, upiId, upiName, upiUrl, appUrls, amount: Number(amount) });
  } catch {
    return NextResponse.json({ error: "Failed to generate QR code" }, { status: 500 });
  }
}
