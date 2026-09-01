export const dynamic = "force-dynamic";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/Badge";
import { Calendar, User, ChevronLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { BlogPostJsonLd, BreadcrumbJsonLd } from "@/components/seo/JsonLd";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await prisma.blogPost.findUnique({ where: { slug } });
  if (!post) return { title: "Post Not Found" };
  const description = post.excerpt || post.content.slice(0, 160);
  return {
    title: post.title,
    description,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      type: "article",
      title: post.title,
      description,
      url: `/blog/${post.slug}`,
      publishedTime: post.publishedAt?.toISOString(),
      ...(post.coverImage && { images: [post.coverImage] }),
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await prisma.blogPost.findUnique({
    where: { slug, published: true },
    include: { author: { select: { name: true } } },
  });

  if (!post) notFound();

  const tags = post.tags ? (JSON.parse(post.tags) as string[]) : [];

  const related = await prisma.blogPost.findMany({
    where: { published: true, category: post.category, id: { not: post.id } },
    take: 3,
    orderBy: { publishedAt: "desc" },
  });

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <BlogPostJsonLd post={{ title: post.title, slug: post.slug, excerpt: post.excerpt, content: post.content, publishedAt: post.publishedAt?.toISOString(), author: post.author?.name, coverImage: post.coverImage }} />
      <BreadcrumbJsonLd items={[
        { name: "Home", url: "https://www.dirtridecamp.com" },
        { name: "Blog", url: "https://www.dirtridecamp.com/blog" },
        { name: post.title, url: `https://www.dirtridecamp.com/blog/${post.slug}` },
      ]} />
      <Link href="/blog" className="inline-flex items-center gap-1 text-sm text-muted hover:text-orange mb-6 transition-colors">
        <ChevronLeft className="w-4 h-4" /> Back to Blog
      </Link>

      <article>
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Badge variant="orange">{post.category}</Badge>
            {post.featured && <Badge variant="warning">Featured</Badge>}
          </div>

          <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight">{post.title}</h1>

          <div className="flex items-center gap-4 text-sm text-muted">
            {post.publishedAt && (
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                {post.publishedAt.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
              </span>
            )}
            {post.author?.name && (
              <span className="flex items-center gap-1.5">
                <User className="w-4 h-4" />
                {post.author.name}
              </span>
            )}
          </div>
        </div>

        {post.coverImage && (
          <div className="mt-8 rounded-sm overflow-hidden border border-border">
            <Image src={post.coverImage} alt={post.title} width={1200} height={675} priority sizes="(max-width: 768px) 100vw, 768px" className="w-full h-auto block" />
          </div>
        )}

        <div className="mt-8 prose prose-invert max-w-none text-foreground/85 leading-relaxed text-lg space-y-6 whitespace-pre-line">
          {post.content}
        </div>

        {tags.length > 0 && (
          <div className="mt-8 pt-6 border-t border-border">
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <span key={tag} className="text-xs px-3 py-1 bg-surface border border-border rounded-full text-muted">
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </article>

      {related.length > 0 && (
        <div className="mt-16 pt-8 border-t border-border">
          <h3 className="font-heading text-xl font-bold mb-6">Related Posts</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {related.map((r) => (
              <Link key={r.id} href={`/blog/${r.slug}`} className="block group">
                <div className="bg-surface border border-border rounded-sm p-4 hover:border-orange/30 transition-colors">
                  <h4 className="font-heading font-semibold group-hover:text-orange transition-colors line-clamp-2">{r.title}</h4>
                  {r.publishedAt && (
                    <p className="text-xs text-muted mt-2">{r.publishedAt.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="mt-12 text-center bg-surface border border-border rounded-sm p-8">
        <h3 className="font-heading text-xl font-bold">Ready for your next adventure?</h3>
        <p className="text-muted mt-2">Check out our upcoming rides and training programs.</p>
        <div className="flex justify-center gap-3 mt-4">
          <Link href="/rides"><Button size="md">Explore Rides <ArrowRight className="w-4 h-4" /></Button></Link>
          <Link href="/trainings"><Button variant="outline" size="md">Training Programs</Button></Link>
        </div>
      </div>
    </div>
  );
}
