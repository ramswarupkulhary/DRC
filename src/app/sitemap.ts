export const dynamic = "force-dynamic";
import { prisma } from "@/lib/prisma";
import type { MetadataRoute } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://www.dirtridecamp.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [rides, trainings, events, posts] = await Promise.all([
    prisma.ride.findMany({ where: { status: "published" }, select: { slug: true, updatedAt: true } }),
    prisma.training.findMany({ where: { status: "published" }, select: { slug: true, updatedAt: true } }),
    prisma.event.findMany({ select: { slug: true, updatedAt: true } }),
    prisma.blogPost.findMany({ where: { published: true }, select: { slug: true, updatedAt: true } }),
  ]);

  const staticPages = [
    { url: `${BASE_URL}/`, changeFrequency: "weekly" as const, priority: 1.0 },
    { url: `${BASE_URL}/programs`, changeFrequency: "weekly" as const, priority: 0.9 },
    { url: `${BASE_URL}/rides`, changeFrequency: "daily" as const, priority: 0.9 },
    { url: `${BASE_URL}/trainings`, changeFrequency: "weekly" as const, priority: 0.9 },
    { url: `${BASE_URL}/events`, changeFrequency: "weekly" as const, priority: 0.8 },
    { url: `${BASE_URL}/blog`, changeFrequency: "daily" as const, priority: 0.8 },
    { url: `${BASE_URL}/about`, changeFrequency: "monthly" as const, priority: 0.7 },
    { url: `${BASE_URL}/contact`, changeFrequency: "monthly" as const, priority: 0.7 },
    { url: `${BASE_URL}/gallery`, changeFrequency: "weekly" as const, priority: 0.6 },
    { url: `${BASE_URL}/instructors`, changeFrequency: "monthly" as const, priority: 0.6 },
    { url: `${BASE_URL}/leaderboard`, changeFrequency: "daily" as const, priority: 0.5 },
    { url: `${BASE_URL}/calendar`, changeFrequency: "daily" as const, priority: 0.7 },
    { url: `${BASE_URL}/store`, changeFrequency: "weekly" as const, priority: 0.7 },
    { url: `${BASE_URL}/membership`, changeFrequency: "monthly" as const, priority: 0.6 },
    { url: `${BASE_URL}/corporate`, changeFrequency: "monthly" as const, priority: 0.5 },
    { url: `${BASE_URL}/off-road-training-bangalore`, changeFrequency: "monthly" as const, priority: 0.9 },
    { url: `${BASE_URL}/dirt-bike-classes-bangalore`, changeFrequency: "monthly" as const, priority: 0.9 },
    { url: `${BASE_URL}/bike-trips-near-bangalore`, changeFrequency: "monthly" as const, priority: 0.9 },
  ];

  const ridePages = rides.map((r) => ({
    url: `${BASE_URL}/rides/${r.slug}`,
    lastModified: r.updatedAt,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const trainingPages = trainings.map((t) => ({
    url: `${BASE_URL}/trainings/${t.slug}`,
    lastModified: t.updatedAt,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const eventPages = events.map((e) => ({
    url: `${BASE_URL}/events/${e.slug}`,
    lastModified: e.updatedAt,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  const blogPages = posts.map((p) => ({
    url: `${BASE_URL}/blog/${p.slug}`,
    lastModified: p.updatedAt,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  return [...staticPages, ...ridePages, ...trainingPages, ...eventPages, ...blogPages];
}
