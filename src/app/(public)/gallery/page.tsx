export const dynamic = "force-dynamic";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { prisma } from "@/lib/prisma";
import { Image as ImageIcon } from "lucide-react";
import { GalleryWithLightbox } from "@/components/gallery/GalleryWithLightbox";
import { AnimatedPageHeader } from "@/components/ui/AnimatedPage";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Gallery — Off-Road Riding Photos | DRC Bangalore",
  description: "Photos from DRC dirt bike rides, off-road training camps & adventure camping trips across Karnataka and India.",
};

export default async function GalleryPage() {
  const images = await prisma.galleryImage.findMany({
    orderBy: { createdAt: "desc" },
    take: 48,
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
      <AnimatedPageHeader>
        <SectionHeader
          accent="Memories from the trail"
          title="Gallery"
          subtitle="Snapshots from our rides, camps, and training sessions."
        />
      </AnimatedPageHeader>

      {images.length > 0 ? (
        <GalleryWithLightbox
          images={images.map((img) => ({
            id: img.id,
            url: img.url,
            caption: img.caption,
            category: img.category,
          }))}
        />
      ) : (
        <div className="mt-16 text-center py-24 bg-surface border border-border rounded-sm">
          <ImageIcon className="w-16 h-16 text-muted/20 mx-auto mb-4" />
          <p className="text-muted text-lg">Gallery is being updated.</p>
          <p className="text-muted text-sm mt-2">
            Check out our{" "}
            <a
              href="https://instagram.com/dirtridecamp"
              target="_blank"
              rel="noopener noreferrer"
              className="text-orange hover:underline"
            >
              Instagram
            </a>{" "}
            for the latest photos!
          </p>
        </div>
      )}
    </div>
  );
}
