export const dynamic = "force-dynamic";
import { prisma } from "@/lib/prisma";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Badge } from "@/components/ui/Badge";
import { AnimatedPageHeader, AnimatedGrid, AnimatedGridItem, HoverCard } from "@/components/ui/AnimatedPage";
import { Calendar, ArrowRight } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog",
  description: "Ride stories, trail guides, gear reviews, and tips from the DRC crew.",
};

export default async function BlogPage() {
  const posts = await prisma.blogPost.findMany({
    where: { published: true },
    orderBy: { publishedAt: "desc" },
    include: { author: { select: { name: true } } },
  });

  const featured = posts.filter((p) => p.featured);
  const regular = posts.filter((p) => !p.featured);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
      <AnimatedPageHeader>
        <SectionHeader
          accent="From the trail"
          title="Blog"
          subtitle="Ride stories, trail guides, gear reviews, and tips from the DRC crew."
        />
      </AnimatedPageHeader>

      {featured.length > 0 && (
        <div className="mt-12">
          {featured.map((post) => (
            <Link key={post.id} href={`/blog/${post.slug}`} className="block group">
              <HoverCard>
                <div className="bg-surface border border-border rounded-sm overflow-hidden grid grid-cols-1 lg:grid-cols-2">
                  <div className="bg-surface-light overflow-hidden">
                    {post.coverImage ? (
                      <img src={post.coverImage} alt={post.title} className="w-full h-auto block" />
                    ) : (
                      <span className="font-heading text-6xl text-orange/20">DRC</span>
                    )}
                  </div>
                  <div className="p-8 flex flex-col justify-center">
                    <div className="flex items-center gap-2 mb-3">
                      <Badge variant="orange">Featured</Badge>
                      <Badge variant="muted">{post.category}</Badge>
                    </div>
                    <h2 className="font-heading text-2xl sm:text-3xl font-bold group-hover:text-orange transition-colors">
                      {post.title}
                    </h2>
                    {post.excerpt && (
                      <p className="text-muted mt-3 line-clamp-3">{post.excerpt}</p>
                    )}
                    <div className="flex items-center gap-4 mt-4 text-sm text-muted">
                      {post.publishedAt && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {post.publishedAt.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                        </span>
                      )}
                      {post.author?.name && <span>by {post.author.name}</span>}
                    </div>
                    <span className="text-orange text-sm font-semibold mt-4 inline-flex items-center gap-1 group-hover:gap-2 transition-all">
                      Read More <ArrowRight className="w-4 h-4" />
                    </span>
                  </div>
                </div>
              </HoverCard>
            </Link>
          ))}
        </div>
      )}

      {regular.length > 0 && (
        <AnimatedGrid className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
          {regular.map((post) => (
            <AnimatedGridItem key={post.id}>
              <HoverCard>
                <Link href={`/blog/${post.slug}`} className="block group h-full">
                  <div className="bg-surface border border-border rounded-sm overflow-hidden h-full flex flex-col">
                    <div className="bg-surface-light overflow-hidden">
                      {post.coverImage ? (
                        <img src={post.coverImage} alt={post.title} className="w-full h-auto block" />
                      ) : (
                        <span className="font-heading text-4xl text-orange/20">DRC</span>
                      )}
                    </div>
                    <div className="p-5 flex-1 flex flex-col">
                      <Badge variant="muted" className="w-fit mb-2">{post.category}</Badge>
                      <h3 className="font-heading text-lg font-bold group-hover:text-orange transition-colors">
                        {post.title}
                      </h3>
                      {post.excerpt && (
                        <p className="text-sm text-muted mt-2 line-clamp-2">{post.excerpt}</p>
                      )}
                      <div className="mt-auto pt-4 flex items-center gap-3 text-xs text-muted">
                        {post.publishedAt && (
                          <span>{post.publishedAt.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                        )}
                        {post.author?.name && <span>by {post.author.name}</span>}
                      </div>
                    </div>
                  </div>
                </Link>
              </HoverCard>
            </AnimatedGridItem>
          ))}
        </AnimatedGrid>
      )}

      {posts.length === 0 && (
        <div className="mt-16 text-center py-16 bg-surface border border-border rounded-sm">
          <p className="text-muted text-lg">Blog posts coming soon!</p>
          <p className="text-muted text-sm mt-2">Follow us on Instagram for stories from the trail.</p>
        </div>
      )}
    </div>
  );
}
