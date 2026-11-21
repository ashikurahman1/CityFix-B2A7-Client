import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: React.ReactNode;
  icon: LucideIcon;
  hint?: React.ReactNode;
  tone?: "primary" | "warning" | "success" | "danger" | "info";
  className?: string;
}

const toneClass: Record<NonNullable<StatCardProps["tone"]>, string> = {
  primary: "bg-primary/12 text-primary",
  warning: "bg-warning/15 text-[color-mix(in_oklch,var(--warning)_70%,var(--foreground))]",
  success: "bg-success/12 text-success",
  danger: "bg-destructive/10 text-destructive",
  info: "bg-info/12 text-info",
};

export function StatCard({ label, value, icon: Icon, hint, tone = "primary", className }: StatCardProps) {
  return (
    <Card className={cn("gap-0 py-0", className)}>
      <CardContent className="flex items-start justify-between gap-4 p-5">
        <div className="min-w-0">
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="mt-1.5 font-heading text-2xl font-semibold tabular-nums sm:text-3xl">{value}</p>
          {hint ? <p className="mt-1 truncate text-xs text-muted-foreground">{hint}</p> : null}
        </div>
        <span className={cn("flex size-10 shrink-0 items-center justify-center rounded-xl", toneClass[tone])}>
          <Icon className="size-5" aria-hidden="true" />
        </span>
      </CardContent>
    </Card>
  );
}

export function StatCardSkeleton() {
  return (
    <Card className="gap-0 py-0">
      <CardContent className="flex items-start justify-between p-5">
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-3 w-32" />
        </div>
        <Skeleton className="size-10 rounded-xl" />
      </CardContent>
    </Card>
  );
}
