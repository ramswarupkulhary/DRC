import { TrainingCardSkeleton, PageHeaderSkeleton } from "@/components/ui/Skeletons";

export default function Loading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
      <PageHeaderSkeleton />
      <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <TrainingCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
