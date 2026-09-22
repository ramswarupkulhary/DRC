import type { Metadata } from "next";
import { Fraunces, Lora, IBM_Plex_Mono } from "next/font/google";
import { Providers } from "@/components/Providers";
import { PWA } from "@/components/PWA";
import { Analytics } from "@/components/seo/Analytics";
import "./globals.css";

// Retro serif display for headings — warm, editorial, hand-set feel.
const fraunces = Fraunces({
  variable: "--font-heading-family",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

// Warm book serif for body copy.
const lora = Lora({
  variable: "--font-body-family",
  subsets: ["latin"],
  display: "swap",
});

// Typewriter mono for eyebrows, captions, tags.
const plexMono = IBM_Plex_Mono({
  variable: "--font-mono-family",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500"],
});

const BASE_URL = "https://www.dirtridecamp.com";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "DRC — Dirt Ride Camp | Off-Road Academy & Adventure Rides in Bangalore",
    template: "%s | DRC Dirt Ride Camp",
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
    "A small Bangalore off-road riding club and academy. We run limited-slot adventure rides, hands-on dirt-bike training, and camping trips across Karnataka and India — six riders per group, a support jeep, a real fire at camp.",
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
      "A small Bangalore off-road riding club and academy — small-group adventure rides, hands-on dirt-bike training, and camping trips.",
  },
  twitter: {
    card: "summary_large_image",
    title: "DRC — Dirt Ride Camp | Off-Road Academy & Adventure Rides",
    description:
      "Six riders per group. Real terrain. A support jeep and a real fire at camp. Rides & training out of Bangalore.",
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
    <html lang="en" className={`${fraunces.variable} ${lora.variable} ${plexMono.variable} h-full`}>
      <body className="min-h-full flex flex-col antialiased">
        <Providers>{children}</Providers>
        <PWA />
        <Analytics />
      </body>
    </html>
  );
}
