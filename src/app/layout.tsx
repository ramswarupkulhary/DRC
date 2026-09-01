import type { Metadata } from "next";
import { Inter, Oswald } from "next/font/google";
import { Providers } from "@/components/Providers";
import { PWA } from "@/components/PWA";
import { Analytics } from "@/components/seo/Analytics";
import "./globals.css";

const inter = Inter({
  variable: "--font-body",
  subsets: ["latin"],
  display: "swap",
});

const oswald = Oswald({
  variable: "--font-heading",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const BASE_URL = "https://www.dirtridecamp.com";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "DRC — Dirt Ride Camp | Off-Road Academy & Adventure Rides in Bangalore",
    template: "%s | DRC Dirt Ride Camp",
  },
  description:
    "Bangalore's premier off-road academy & riding group. Off-road training classes, adventure bike trips, camping rides & trail riding. Join DRC — Dirt Ride Camp for limited-slot adventure trips across Karnataka & India.",
  keywords: [
    "off road academy",
    "off road academy bangalore",
    "off road training",
    "off road training bangalore",
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
      "Bangalore's premier off-road academy & riding group. Off-road training, dirt bike rides, adventure camping & trail riding.",
  },
  twitter: {
    card: "summary_large_image",
    title: "DRC — Dirt Ride Camp | Off-Road Academy & Adventure Rides",
    description:
      "Bangalore's premier off-road academy & riding group. Off-road training, dirt bike rides, adventure camping.",
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
    <html lang="en" className={`${inter.variable} ${oswald.variable} h-full`}>
      <body className="min-h-full flex flex-col antialiased">
        <Providers>{children}</Providers>
        <PWA />
        <Analytics />
      </body>
    </html>
  );
}
