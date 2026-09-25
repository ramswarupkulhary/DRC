import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import Razorpay from "razorpay";

const CATEGORY_FEES: Record<string, { name: string; fee: number }> = {
  amateurs: { name: "Amateurs", fee: 4999 },
  professionals: { name: "Professionals", fee: 7999 },
  women: { name: "Women Category", fee: 4999 },
  "big-bikes": { name: "Big Bikes", fee: 7999 },
};

async function getRazorpayInstance() {
  const settings = await prisma.siteSetting.findMany({
    where: { key: { in: ["razorpay_key_id", "razorpay_key_secret"] } },
  });
  const map: Record<string, string> = {};
  settings.forEach((s) => {
    map[s.key] = s.value;
  });

  const keyId = map.razorpay_key_id || process.env.RAZORPAY_KEY_ID || "";
  const keySecret = map.razorpay_key_secret || process.env.RAZORPAY_KEY_SECRET || "";

  if (!keyId || !keySecret) return null;

  return { instance: new Razorpay({ key_id: keyId, key_secret: keySecret }), keyId };
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { category, name, email, phone } = body ?? {};

    if (!category || !name || !email || !phone) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    }
    const cat = CATEGORY_FEES[category];
    if (!cat) {
      return NextResponse.json({ error: "Invalid category." }, { status: 400 });
    }

    const rz = await getRazorpayInstance();
    if (!rz) {
      return NextResponse.json(
        { error: "Online payment is not configured yet. Please complete registration and pay via the instructions we email you." },
        { status: 503 },
      );
    }

    const order = await rz.instance.orders.create({
      amount: cat.fee * 100,
      currency: "INR",
      receipt: `ur_${category}_${Date.now()}`,
      notes: {
        event: "drc-ultimate-rider",
        category,
        categoryName: cat.name,
        name,
        email,
        phone,
      },
    });

    return NextResponse.json({
      orderId: order.id,
      amount: cat.fee,
      currency: "INR",
      key: rz.keyId,
      categoryName: cat.name,
    });
  } catch (err) {
    console.error("[ultimate-rider create-order]", err);
    return NextResponse.json({ error: "Failed to create payment order." }, { status: 500 });
  }
}
