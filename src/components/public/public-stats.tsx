import { CheckCircle2, Clock, Star, Users } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { getPublicStats } from "@/lib/api/server";
import { formatHours } from "@/lib/format";

/** Server Component: transparency numbers from GET /stats/public, cached with `use cache`. */
export async function PublicStats() {
  const stats = await getPublicStats();

  const items = [
    { icon: Users, label: "Requests filed", value: stats ? stats.totalRequests.toLocaleString("en") : "—", hint: "All time" },
    {
      icon: CheckCircle2,
      label: "Resolution rate",
      value: stats?.resolutionRatePercent != null ? `${stats.resolutionRatePercent}%` : "—",
      hint: `${stats?.open ?? 0} open right now`,
    },
    {
      icon: Clock,
      label: "Avg. time to fix",
      value: stats?.avgResolutionHours != null ? formatHours(stats.avgResolutionHours) : "—",
      hint: stats?.avgResolutionHours != null ? "Filing → resolved" : "Awaiting first resolution",
    },
    {
      icon: Star,
      label: "Citizen rating",
      value: stats?.averageRating != null ? `${stats.averageRating}/5` : "—",
      hint: stats?.averageRating != null ? "From closed requests" : "No ratings yet",
    },
  ];

  return (
    <dl className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {items.map(({ icon: Icon, label, value, hint }) => (
        <div key={label} className="rounded-2xl bg-white/8 p-5 ring-1 ring-white/15 backdrop-blur-sm sm:p-6">
          <dt className="flex items-center gap-2 text-sm text-white/75">
            <span className="flex size-8 items-center justify-center rounded-lg bg-white/12">
              <Icon className="size-4 text-warning" aria-hidden="true" />
            </span>
            {label}
          </dt>
          <dd className="mt-3 font-heading text-3xl font-semibold text-white tabular-nums sm:text-4xl">{value}</dd>
          <dd className="mt-1 text-xs text-white/65">{hint}</dd>
        </div>
      ))}
    </dl>
  );
}

export function PublicStatsSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {Array.from({ length: 4 }, (_, i) => (
        <Skeleton key={i} className="h-36 rounded-2xl bg-white/10" />
      ))}
    </div>
  );
}
