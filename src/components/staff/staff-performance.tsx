"use client";

import { endOfWeek, format, startOfWeek, subWeeks } from "date-fns";
import { CheckCircle2, ClipboardList, Gauge, Timer } from "lucide-react";
import { useMemo } from "react";
import { ColumnChart, HBarChart } from "@/components/charts/bar-charts";
import { EmptyState } from "@/components/shared/empty-state";
import { StatCard, StatCardSkeleton } from "@/components/shared/stat-card";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useComplaints } from "@/hooks/queries/use-complaints";
import { ALL_PRIORITIES, PRIORITY_META, STATUS_META } from "@/lib/constants";
import { formatHours } from "@/lib/format";
import type { ComplaintStatus } from "@/types/api";

const DONE: ComplaintStatus[] = ["RESOLVED", "CLOSED"];

/** Personal analytics computed from the staff member's assigned requests (latest 100). */
export function StaffPerformance() {
  const query = useComplaints({ assignedToMe: "true", limit: 100, sortBy: "updatedAt" });
  const items = query.data?.items;

  const stats = useMemo(() => {
    if (!items) return null;
    const done = items.filter((c) => DONE.includes(c.status) && c.resolvedAt);
    const hours = done.map((c) => (new Date(c.resolvedAt as string).getTime() - new Date(c.createdAt).getTime()) / 36e5);
    const withinSla = done.filter((c) => !c.sla.breached).length;

    const byStatus = Object.entries(
      items.reduce<Record<string, number>>((acc, c) => ({ ...acc, [c.status]: (acc[c.status] ?? 0) + 1 }), {}),
    )
      .map(([s, value]) => ({ label: STATUS_META[s as ComplaintStatus].label, value }))
      .sort((a, b) => b.value - a.value);

    const byPriority = ALL_PRIORITIES.map((p) => ({
      label: PRIORITY_META[p].label,
      value: items.filter((c) => c.priority === p).length,
    })).filter((d) => d.value > 0);

    const now = new Date();
    const weeks = Array.from({ length: 8 }, (_, i) => {
      const start = startOfWeek(subWeeks(now, 7 - i), { weekStartsOn: 6 });
      const end = endOfWeek(start, { weekStartsOn: 6 });
      return {
        label: format(start, "d MMM"),
        value: done.filter((c) => {
          const t = new Date(c.resolvedAt as string);
          return t >= start && t <= end;
        }).length,
      };
    });

    return {
      total: items.length,
      done: done.length,
      active: items.filter((c) => ["ASSIGNED", "IN_PROGRESS", "REOPENED"].includes(c.status)).length,
      avgHours: hours.length ? hours.reduce((a, b) => a + b, 0) / hours.length : null,
      slaPct: done.length ? Math.round((withinSla / done.length) * 100) : null,
      byStatus,
      byPriority,
      weeks,
    };
  }, [items]);

  if (query.isPending) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }, (_, i) => (
            <StatCardSkeleton key={i} />
          ))}
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <Skeleton className="h-72 rounded-xl" />
          <Skeleton className="h-72 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!stats || stats.total === 0) {
    return (
      <EmptyState
        icon={Gauge}
        title="No work history yet"
        description="Once you claim and resolve requests, your performance appears here."
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Requests handled" value={stats.total} icon={ClipboardList} hint={`${stats.active} active now`} />
        <StatCard label="Resolved" value={stats.done} icon={CheckCircle2} tone="success" hint="Resolved or closed" />
        <StatCard label="Avg. time to resolve" value={formatHours(stats.avgHours)} icon={Timer} tone="info" hint="From filing to resolution" />
        <StatCard
          label="SLA met"
          value={stats.slaPct === null ? "—" : `${stats.slaPct}%`}
          icon={Gauge}
          tone={stats.slaPct !== null && stats.slaPct < 80 ? "warning" : "success"}
          hint="Of resolved requests"
        />
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="font-sans text-base">Resolved per week</CardTitle>
            <CardDescription>Last 8 weeks (weeks start on Saturday)</CardDescription>
          </CardHeader>
          <CardContent>
            <ColumnChart data={stats.weeks} seriesLabel="Resolved" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="font-sans text-base">Where your requests stand</CardTitle>
            <CardDescription>Requests by current status</CardDescription>
          </CardHeader>
          <CardContent>
            <HBarChart data={stats.byStatus} seriesLabel="Requests" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="font-sans text-base">Priority mix</CardTitle>
            <CardDescription>How urgent your assigned work has been</CardDescription>
          </CardHeader>
          <CardContent>
            <HBarChart data={stats.byPriority} seriesLabel="Requests" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
