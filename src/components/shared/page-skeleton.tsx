import { Skeleton } from "@/components/ui/skeleton";
import { StatCardSkeleton } from "./stat-card";

/** Generic loading.tsx body: header, optional stat row and a table/card block. */
export function PageSkeleton({ stats = 0, variant = "table" }: { stats?: number; variant?: "table" | "detail" | "form" }) {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Loading">
      <div className="space-y-2">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-4 w-80 max-w-full" />
      </div>
      {stats > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: stats }, (_, i) => (
            <StatCardSkeleton key={i} />
          ))}
        </div>
      ) : null}
      {variant === "table" ? (
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            <Skeleton className="h-9 w-72" />
            <Skeleton className="h-9 w-40" />
            <Skeleton className="h-9 w-40" />
          </div>
          <div className="overflow-hidden rounded-xl border">
            <Skeleton className="h-11 w-full rounded-none" />
            {Array.from({ length: 7 }, (_, i) => (
              <div key={i} className="flex gap-4 border-t p-3">
                <Skeleton className="h-5 w-1/4" />
                <Skeleton className="h-5 w-1/5" />
                <Skeleton className="h-5 w-1/6" />
                <Skeleton className="h-5 w-1/6" />
              </div>
            ))}
          </div>
        </div>
      ) : variant === "detail" ? (
        <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
          <Skeleton className="h-96 rounded-xl" />
          <Skeleton className="h-96 rounded-xl" />
        </div>
      ) : (
        <Skeleton className="h-[520px] max-w-3xl rounded-xl" />
      )}
    </div>
  );
}
