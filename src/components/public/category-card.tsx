import { Clock, Coins } from "lucide-react";
import { formatHours, formatMoney } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Category } from "@/types/api";
import { categoryIcon } from "./category-icon";

export function CategoryCard({ category, className }: { category: Category; className?: string }) {
  const fee = Number(category.serviceFee);
  const paid = category.type === "SERVICE";
  const Icon = categoryIcon(category.name);

  return (
    <article
      className={cn(
        "group relative flex h-full flex-col overflow-hidden rounded-2xl border bg-card p-5 shadow-soft transition-all hover:-translate-y-0.5 hover:border-primary/40",
        className,
      )}
    >
      <span
        className={cn("absolute inset-x-0 top-0 h-1", paid ? "bg-warning" : "bg-primary")}
        aria-hidden="true"
      />
      <div className="flex items-start gap-4">
        <span
          className={cn(
            "flex size-12 shrink-0 items-center justify-center rounded-xl transition-transform group-hover:scale-105",
            paid
              ? "bg-warning/15 text-[color-mix(in_oklch,var(--warning)_65%,var(--foreground))]"
              : "bg-primary/12 text-primary",
          )}
        >
          <Icon className="size-6" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <h3 className="font-sans text-base font-semibold">{category.name}</h3>
          <p className="text-sm text-muted-foreground">{category.department.name}</p>
        </div>
      </div>
      {category.description ? <p className="mt-4 flex-1 text-sm">{category.description}</p> : <div className="flex-1" />}
      <div className="mt-5 flex flex-wrap items-center gap-2 text-xs font-medium">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-1">
          <Clock className="size-3.5" aria-hidden="true" /> SLA {formatHours(category.slaHours)}
        </span>
        <span
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1",
            paid
              ? "bg-warning/15 text-[color-mix(in_oklch,var(--warning)_65%,var(--foreground))]"
              : "bg-success/12 text-success",
          )}
        >
          <Coins className="size-3.5" aria-hidden="true" /> {fee > 0 ? formatMoney(fee) : "Free to file"}
        </span>
      </div>
    </article>
  );
}
