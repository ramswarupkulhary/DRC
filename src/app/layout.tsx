import type { Metadata } from "next";
import { Inter, Oswald } from "next/font/google";
import { Providers } from "@/components/Providers";
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

export const metadata: Metadata = {
  title: {
    default: "DRC — Dirt Ride Camp | Ride · Explore · Connect",
    template: "%s | DRC Dirt Ride Camp",
  },
  description:
    "Off-road adventure rides, camping trips & dirt riding training. Join limited-slot rides across India.",
  keywords: [
    "dirt ride camp",
    "off-road riding",
    "adventure motorcycle",
    "camping rides",
    "dirt bike training",
    "DRC",
  ],
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
      </body>
    </html>
  );
}
