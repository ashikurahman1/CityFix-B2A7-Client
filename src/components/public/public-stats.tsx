import { CheckCircle2, Clock, Star, Users } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { getPublicStats } from "@/lib/api/server";
import { formatHours } from "@/lib/format";

/** Server Component: transparency numbers from GET /stats/public, cached with `use cache`. */
export async function PublicStats() {
  const stats = await getPublicStats();

  const items = [
    { icon: Users, label: "Requests filed", value: stats ? stats.totalRequests.toLocaleString("en") : "—" },
    {
      icon: CheckCircle2,
      label: "Resolution rate",
      value: stats?.resolutionRatePercent != null ? `${stats.resolutionRatePercent}%` : "—",
    },
    { icon: Clock, label: "Avg. time to fix", value: formatHours(stats?.avgResolutionHours) },
    { icon: Star, label: "Citizen rating", value: stats?.averageRating != null ? `${stats.averageRating} / 5` : "—" },
  ];

  return (
    <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border bg-border lg:grid-cols-4">
      {items.map(({ icon: Icon, label, value }) => (
        <div key={label} className="flex flex-col gap-1 bg-card p-5 sm:p-6">
          <dt className="flex items-center gap-2 text-sm text-muted-foreground">
            <Icon className="size-4 text-primary" aria-hidden="true" />
            {label}
          </dt>
          <dd className="font-heading text-2xl font-semibold tabular-nums sm:text-3xl">{value}</dd>
        </div>
      ))}
    </dl>
  );
}

export function PublicStatsSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border bg-border lg:grid-cols-4">
      {Array.from({ length: 4 }, (_, i) => (
        <div key={i} className="space-y-2 bg-card p-6">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-8 w-20" />
        </div>
      ))}
    </div>
  );
}
