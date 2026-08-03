export const dynamic = "force-dynamic";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Clock, MapPin, Users, ChevronLeft, CheckCircle2, BarChart3 } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatPrice } from "@/lib/utils";
import { TrainingRegisterButton } from "@/components/rides/TrainingRegisterButton";
import Link from "next/link";
import type { Metadata } from "next";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const training = await prisma.training.findUnique({ where: { slug } });
  if (!training) return { title: "Training Not Found" };
  return { title: training.title, description: training.shortDesc || training.description.slice(0, 160) };
}

export default async function TrainingDetailPage({ params }: Props) {
  const { slug } = await params;
  const training = await prisma.training.findUnique({ where: { slug } });

  if (!training) notFound();

  const curriculum: string[] = training.curriculum ? JSON.parse(training.curriculum) : [];

  const levelColors: Record<string, "success" | "warning" | "orange"> = {
    beginner: "success",
    intermediate: "warning",
    advanced: "orange",
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <Link href="/trainings" className="inline-flex items-center gap-1 text-sm text-muted hover:text-orange mb-6 transition-colors">
        <ChevronLeft className="w-4 h-4" /> Back to Training
      </Link>

      <div className="flex flex-wrap items-center gap-2 mb-4">
        <Badge variant={levelColors[training.level] || "orange"}>{training.level}</Badge>
        {training.featured && <Badge variant="tan">Popular</Badge>}
      </div>

      <h1 className="font-heading text-4xl sm:text-5xl font-bold">{training.title}</h1>

      <div className="flex flex-wrap gap-6 text-muted mt-4">
        {training.duration && (
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-orange" />
            <span>{training.duration}</span>
          </div>
        )}
        {training.location && (
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-orange" />
            <span>{training.location}</span>
          </div>
        )}
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-orange" />
          <span>Max {training.totalSlots} riders per batch</span>
        </div>
      </div>

      <div className="mt-8 h-64 sm:h-80 bg-surface border border-border rounded-sm flex items-center justify-center">
        {training.coverImage ? (
          <img src={training.coverImage} alt={training.title} className="w-full h-full object-cover rounded-sm" />
        ) : (
          <BarChart3 className="w-24 h-24 text-muted/20" />
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-10">
        <div className="lg:col-span-2 space-y-8">
          <div>
            <h2 className="font-heading text-2xl font-semibold mb-4">About This Program</h2>
            <p className="text-foreground/80 leading-relaxed whitespace-pre-line">{training.description}</p>
          </div>

          {curriculum.length > 0 && (
            <div>
              <h2 className="font-heading text-2xl font-semibold mb-4">What You&apos;ll Learn</h2>
              <div className="space-y-3">
                {curriculum.map((item, i) => (
                  <div key={i} className="flex items-start gap-3 text-foreground/80">
                    <CheckCircle2 className="w-5 h-5 text-success mt-0.5 shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-1">
          <div className="sticky top-24 bg-surface border border-border rounded-sm p-6 space-y-6">
            <div>
              <span className="text-sm text-muted uppercase tracking-wider">Program Fee</span>
              <div className="font-heading text-4xl font-bold text-orange mt-1">
                {formatPrice(training.price)}
              </div>
              <span className="text-sm text-muted">per rider</span>
            </div>

            <TrainingRegisterButton trainingId={training.id} trainingSlug={training.slug} />

            <a href="https://wa.me/919414870102" target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="md" className="w-full mt-2">
                Ask on WhatsApp
              </Button>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
