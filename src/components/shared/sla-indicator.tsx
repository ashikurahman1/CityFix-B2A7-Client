"use client";

import { AlarmClock, CheckCircle2, Clock, TimerOff } from "lucide-react";
import { formatDateTime, formatHours } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Sla } from "@/types/api";

/** Compact SLA read-out: time left, overdue, or met. */
export function SlaIndicator({ sla, className }: { sla: Sla; className?: string }) {
  if (!sla.dueAt) {
    return <span className={cn("text-xs text-muted-foreground", className)}>No SLA yet</span>;
  }

  if (sla.hoursRemaining === null) {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1 text-xs",
          sla.breached ? "text-destructive" : "text-success",
          className,
        )}
        title={`Due ${formatDateTime(sla.dueAt)}`}
      >
        {sla.breached ? <TimerOff className="size-3.5" /> : <CheckCircle2 className="size-3.5" />}
        {sla.breached ? "SLA missed" : "Within SLA"}
      </span>
    );
  }

  const overdue = sla.hoursRemaining < 0;
  const soon = !overdue && sla.hoursRemaining < 12;
  const Icon = overdue ? AlarmClock : Clock;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-xs font-medium tabular-nums",
        overdue
          ? "text-destructive"
          : soon
            ? "text-[color-mix(in_oklch,var(--warning)_75%,var(--foreground))]"
            : "text-muted-foreground",
        className,
      )}
      title={`Due ${formatDateTime(sla.dueAt)}`}
    >
      <Icon className="size-3.5" aria-hidden="true" />
      {overdue ? `${formatHours(sla.hoursRemaining)} overdue` : `${formatHours(sla.hoursRemaining)} left`}
    </span>
  );
}
