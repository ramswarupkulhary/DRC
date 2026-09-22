import type { Metadata } from "next";
import { Oswald, Inter, JetBrains_Mono } from "next/font/google";
import { Providers } from "@/components/Providers";
import { PWA } from "@/components/PWA";
import { Analytics } from "@/components/seo/Analytics";
import "./globals.css";

// Oswald — bold condensed motorsport display, used for every heading.
const oswald = Oswald({
  variable: "--font-heading-family",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

// Inter — tight, modern, high-legibility body copy.
const inter = Inter({
  variable: "--font-body-family",
  subsets: ["latin"],
  display: "swap",
});

// JetBrains Mono — tech/racing telemetry look for eyebrows, tags, timing.
const jetbrains = JetBrains_Mono({
  variable: "--font-mono-family",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "700"],
});

const BASE_URL = "https://www.dirtridecamp.com";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "DRC Motorsports — Racing, Training & Adventure Across India",
    template: "%s | DRC Motorsports",
  },
  icons: {
    icon: [
      { url: "/brand/drc-logo-main.png", type: "image/png" },
      { url: "/icon.png", type: "image/png" },
    ],
    apple: [{ url: "/apple-icon.png" }],
    shortcut: ["/brand/drc-logo-main.png"],
  },
  description:
    "DRC Motorsports Pvt Ltd — an Indian motorcycle culture and motorsport platform. Racing, training, adventure and community. Flag-off event: DRC Ultimate Rider, 12\u201313 December 2026, Bengaluru. Six official races every year across India.",
  keywords: [
    "off road academy",
    "off road academy bangalore",
    "off road training",
    "off road training bangalore",
    "offroad",
    "offroad bangalore",
    "offroad india",
    "offroad academy bangalore",
    "offroad academy",
    "offroad training bangalore",
    "offroad riding",
    "offroad bike",
    "offroad training india",
    "dirt ride camp",
    "DRC",
    "dirtridecamp",
    "bangalore riding group",
    "off-road riding",
    "off-road bike",
    "adventure motorcycle bangalore",
    "dirt bike training",
    "camping rides bangalore",
    "trail riding karnataka",
    "adventure riding india",
    "motorcycle camping",
    "off-road motorcycle training",
    "bike riding group bangalore",
    "weekend rides bangalore",
    "dirt biking india",
    "enduro training",
    "adventure bike trips",
    "off road riding academy",
    "motorcycle academy bangalore",
    "bike trip bangalore",
    "bike trip near bangalore",
    "adventure bike trip",
    "motorcycle trip bangalore",
    "weekend bike trip",
    "camping trip bangalore",
    "adventure camping bangalore",
    "motorcycle camping trip",
    "bike camping near bangalore",
    "off road classes bangalore",
    "dirt bike classes",
    "riding classes bangalore",
    "motorcycle adventure india",
    "adventure rides near bangalore",
    "bike ride group bangalore",
    "overnight bike trip",
    "motorcycle tour karnataka",
    "adventure biking bangalore",
    "off road camping",
    "bike adventure trip india",
  ],
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: BASE_URL,
    siteName: "Dirt Ride Camp (DRC)",
    title: "DRC — Dirt Ride Camp | Off-Road Academy & Adventure Rides in Bangalore",
    description:
      "An Indian motorcycle culture & motorsport platform — racing, training, adventure and community. Six official races every year, across India.",
  },
  twitter: {
    card: "summary_large_image",
    title: "DRC Motorsports — Racing, Training & Adventure Across India",
    description:
      "Flag-off: DRC Ultimate Rider, Bengaluru, 12\u201313 December 2026. Six official races every year, across India.",
  },
  alternates: {
    canonical: BASE_URL,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "FdNQX0-zW-kQMxH9I7JF4NgDc4xlt74ciMeQC2OxKHA",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${oswald.variable} ${inter.variable} ${jetbrains.variable} h-full`}>
      <body className="min-h-full flex flex-col antialiased">
        <Providers>{children}</Providers>
        <PWA />
        <Analytics />
      </body>
    </html>
  );
}
