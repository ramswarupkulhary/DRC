import { Skeleton, PageHeaderSkeleton } from "@/components/ui/Skeletons";

export default function Loading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
      <PageHeaderSkeleton />
      <div className="mt-12 space-y-8">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="space-y-4">
            <Skeleton className="h-6 w-32" />
            <div className="grid grid-cols-7 gap-2">
              {Array.from({ length: 7 }).map((_, j) => (
                <Skeleton key={j} className="h-20 rounded-sm" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
