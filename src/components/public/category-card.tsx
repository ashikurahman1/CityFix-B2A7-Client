import { Clock, Coins } from "lucide-react";
import { TypeBadge } from "@/components/shared/status-badge";
import { formatHours, formatMoney } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Category } from "@/types/api";

export function CategoryCard({ category, className }: { category: Category; className?: string }) {
  const fee = Number(category.serviceFee);
  return (
    <article
      className={cn(
        "group flex h-full flex-col rounded-2xl border bg-card p-5 transition-shadow hover:shadow-md",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-sans text-base font-semibold">{category.name}</h3>
        <TypeBadge type={category.type} />
      </div>
      <p className="mt-1 text-sm text-muted-foreground">{category.department.name}</p>
      {category.description ? <p className="mt-3 flex-1 text-sm">{category.description}</p> : <div className="flex-1" />}
      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 border-t pt-3 text-sm text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <Clock className="size-4" aria-hidden="true" />
          SLA {formatHours(category.slaHours)}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Coins className="size-4" aria-hidden="true" />
          {fee > 0 ? formatMoney(fee) : "Free to file"}
        </span>
      </div>
    </article>
  );
}
