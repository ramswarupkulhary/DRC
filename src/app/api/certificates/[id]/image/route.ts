import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const cert = await prisma.certificate.findUnique({
    where: { id },
    include: {
      user: { select: { name: true } },
      ride: { select: { title: true, startDate: true, location: true, difficulty: true } },
      training: { select: { title: true, level: true } },
    },
  });

  if (!cert) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const riderName = cert.user.name || "Rider";
  const eventTitle = cert.ride?.title || cert.training?.title || "DRC Event";
  const eventDate = cert.ride?.startDate
    ? new Date(cert.ride.startDate).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })
    : new Date(cert.issuedAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
  const location = cert.ride?.location || "";
  const issuedDate = new Date(cert.issuedAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800" viewBox="0 0 1200 800">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#0D0D0D"/>
      <stop offset="100%" style="stop-color:#1a1a1a"/>
    </linearGradient>
    <linearGradient id="border" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:#E8622C"/>
      <stop offset="50%" style="stop-color:#F4A261"/>
      <stop offset="100%" style="stop-color:#E8622C"/>
    </linearGradient>
  </defs>

  <!-- Background -->
  <rect width="1200" height="800" fill="url(#bg)"/>

  <!-- Border -->
  <rect x="20" y="20" width="1160" height="760" fill="none" stroke="url(#border)" stroke-width="3" rx="4"/>
  <rect x="35" y="35" width="1130" height="730" fill="none" stroke="#333" stroke-width="1" rx="2"/>

  <!-- Corner ornaments -->
  <circle cx="50" cy="50" r="6" fill="#E8622C"/>
  <circle cx="1150" cy="50" r="6" fill="#E8622C"/>
  <circle cx="50" cy="750" r="6" fill="#E8622C"/>
  <circle cx="1150" cy="750" r="6" fill="#E8622C"/>

  <!-- DRC Logo -->
  <text x="600" y="120" text-anchor="middle" font-family="Georgia, serif" font-size="28" font-weight="bold" fill="#E8622C" letter-spacing="8">D R C</text>
  <text x="600" y="150" text-anchor="middle" font-family="Georgia, serif" font-size="14" fill="#B9A886" letter-spacing="4">DIRT RIDE CAMP</text>

  <!-- Divider -->
  <line x1="400" y1="175" x2="800" y2="175" stroke="#E8622C" stroke-width="1" opacity="0.5"/>

  <!-- Title -->
  <text x="600" y="230" text-anchor="middle" font-family="Georgia, serif" font-size="16" fill="#B9A886" letter-spacing="6">CERTIFICATE OF</text>
  <text x="600" y="280" text-anchor="middle" font-family="Georgia, serif" font-size="42" font-weight="bold" fill="#F1E9DD" letter-spacing="3">${cert.type === "ride_completion" ? "RIDE COMPLETION" : "ACHIEVEMENT"}</text>

  <!-- Presented to -->
  <text x="600" y="340" text-anchor="middle" font-family="Georgia, serif" font-size="16" fill="#888" letter-spacing="2">PRESENTED TO</text>

  <!-- Name -->
  <text x="600" y="400" text-anchor="middle" font-family="Georgia, serif" font-size="48" font-weight="bold" fill="#E8622C">${escapeXml(riderName)}</text>

  <!-- Underline -->
  <line x1="300" y1="420" x2="900" y2="420" stroke="#444" stroke-width="1"/>

  <!-- Description -->
  <text x="600" y="470" text-anchor="middle" font-family="Georgia, serif" font-size="16" fill="#B9A886">For successfully completing</text>
  <text x="600" y="505" text-anchor="middle" font-family="Georgia, serif" font-size="24" font-weight="bold" fill="#F1E9DD">${escapeXml(eventTitle)}</text>
  ${location ? `<text x="600" y="540" text-anchor="middle" font-family="Georgia, serif" font-size="14" fill="#888">${escapeXml(location)} · ${eventDate}</text>` : `<text x="600" y="540" text-anchor="middle" font-family="Georgia, serif" font-size="14" fill="#888">${eventDate}</text>`}

  <!-- Certificate Number -->
  <text x="600" y="610" text-anchor="middle" font-family="monospace" font-size="12" fill="#666">Certificate No: ${cert.certNumber}</text>

  <!-- Footer -->
  <line x1="200" y1="660" x2="450" y2="660" stroke="#444" stroke-width="1"/>
  <text x="325" y="685" text-anchor="middle" font-family="Georgia, serif" font-size="12" fill="#888">Issued: ${issuedDate}</text>

  <line x1="750" y1="660" x2="1000" y2="660" stroke="#444" stroke-width="1"/>
  <text x="875" y="685" text-anchor="middle" font-family="Georgia, serif" font-size="12" fill="#888">Dirt Ride Camp</text>

  <!-- Seal -->
  <circle cx="600" cy="700" r="30" fill="none" stroke="#E8622C" stroke-width="2" opacity="0.6"/>
  <text x="600" y="705" text-anchor="middle" font-family="Georgia, serif" font-size="12" font-weight="bold" fill="#E8622C">DRC</text>
</svg>`;

  return new NextResponse(svg, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "public, max-age=86400",
    },
  });
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
