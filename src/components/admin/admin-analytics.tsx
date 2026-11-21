"use client";

import {
  AlarmClock,
  ArrowRight,
  Banknote,
  ClipboardList,
  Gauge,
  RefreshCw,
  Star,
  Timer,
  UserX,
  Users,
} from "lucide-react";
import Link from "next/link";
import { HBarChart } from "@/components/charts/bar-charts";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorView } from "@/components/shared/error-view";
import { PageHeader } from "@/components/shared/page-header";
import { PageSkeleton } from "@/components/shared/page-skeleton";
import { StatCard } from "@/components/shared/stat-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useDashboardStats } from "@/hooks/queries/use-admin";
import { ALL_PRIORITIES, ALL_STATUSES, PRIORITY_META, STATUS_META } from "@/lib/constants";
import { formatHours, formatMoney, fromNow } from "@/lib/format";

export function AdminAnalytics() {
  const { data: s, isPending, error, refetch, isFetching } = useDashboardStats();

  if (isPending) return <PageSkeleton stats={8} variant="detail" />;
  if (error || !s) return <ErrorView error={error} retry={() => void refetch()} homeHref="/admin" />;

  const c = s.complaints;
  const open = (["SUBMITTED", "ASSIGNED", "IN_PROGRESS", "REOPENED"] as const).reduce((n, k) => n + (c.byStatus[k] ?? 0), 0);
  const byStatus = ALL_STATUSES.map((k) => ({ label: STATUS_META[k].label, value: c.byStatus[k] ?? 0 })).filter((d) => d.value > 0);
  const byDept = [...c.byDepartment].sort((a, b) => b.count - a.count).map((d) => ({ label: d.department, value: d.count }));
  const byPriority = ALL_PRIORITIES.map((p) => ({ label: PRIORITY_META[p].label, value: c.openByPriority[p] ?? 0 }));
  const totalUsers = (s.users.CITIZEN ?? 0) + (s.users.STAFF ?? 0) + (s.users.ADMIN ?? 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="City analytics"
        description={`Operational picture across every department · updated ${fromNow(s.generatedAt)}`}
        actions={
          <Button variant="outline" onClick={() => void refetch()} disabled={isFetching}>
            <RefreshCw data-icon="inline-start" className={isFetching ? "animate-spin" : undefined} /> Refresh
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total requests" value={c.total} icon={ClipboardList} hint={`${open} open right now`} />
        <StatCard label="Overdue" value={c.overdue} icon={AlarmClock} tone="danger" hint="Open and past SLA" />
        <StatCard label="Unassigned" value={c.unassigned} icon={UserX} tone="warning" hint="Submitted, no owner" />
        <StatCard
          label="SLA compliance"
          value={s.performance.slaCompliancePercent == null ? "—" : `${s.performance.slaCompliancePercent}%`}
          icon={Gauge}
          tone="success"
          hint={`${s.performance.resolved} resolved requests`}
        />
        <StatCard label="Avg. resolution" value={formatHours(s.performance.avgResolutionHours)} icon={Timer} tone="info" hint="Filing → resolved" />
        <StatCard
          label="Citizen rating"
          value={s.performance.averageRating == null ? "—" : `${s.performance.averageRating} / 5`}
          icon={Star}
          tone="warning"
          hint={`${s.performance.feedbackCount} ratings`}
        />
        <StatCard
          label="Fee revenue"
          value={formatMoney(s.payments.totalRevenue, s.payments.currency)}
          icon={Banknote}
          tone="success"
          hint={`${s.payments.paidCount} paid checkouts`}
        />
        <StatCard
          label="Accounts"
          value={totalUsers}
          icon={Users}
          tone="primary"
          hint={`${s.users.CITIZEN ?? 0} citizens · ${s.users.STAFF ?? 0} staff · ${s.users.ADMIN ?? 0} admins`}
        />
      </div>

      {c.overdue > 0 || c.unassigned > 0 ? (
        <div className="flex flex-col gap-2 sm:flex-row">
          {c.overdue > 0 ? (
            <Button asChild variant="outline" className="border-destructive/40 text-destructive hover:text-destructive">
              <Link href="/admin/complaints?overdue=true&sortBy=slaDueAt&sortOrder=asc">
                Review {c.overdue} overdue <ArrowRight data-icon="inline-end" />
              </Link>
            </Button>
          ) : null}
          {c.unassigned > 0 ? (
            <Button asChild variant="outline">
              <Link href="/admin/complaints?status=SUBMITTED&sortBy=createdAt&sortOrder=asc">
                Assign {c.unassigned} waiting <ArrowRight data-icon="inline-end" />
              </Link>
            </Button>
          ) : null}
        </div>
      ) : null}

      {c.total === 0 ? (
        <EmptyState title="No requests yet" description="Charts appear once citizens start filing requests." />
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="font-sans text-base">Requests by status</CardTitle>
              <CardDescription>All non-deleted requests</CardDescription>
            </CardHeader>
            <CardContent>
              <HBarChart data={byStatus} seriesLabel="Requests" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="font-sans text-base">Load by department</CardTitle>
              <CardDescription>Where requests are routed</CardDescription>
            </CardHeader>
            <CardContent>
              <HBarChart data={byDept} seriesLabel="Requests" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="font-sans text-base">Open requests by priority</CardTitle>
              <CardDescription>Submitted, assigned, in progress or reopened</CardDescription>
            </CardHeader>
            <CardContent>
              <HBarChart data={byPriority} seriesLabel="Open requests" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="font-sans text-base">Busiest staff</CardTitle>
              <CardDescription>Active requests against the 10-request cap</CardDescription>
            </CardHeader>
            <CardContent>
              {s.performance.busiestStaff.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nobody has active work right now.</p>
              ) : (
                <ul className="space-y-4">
                  {s.performance.busiestStaff.map((st) => (
                    <li key={st.staffId ?? st.name}>
                      <div className="mb-1.5 flex justify-between text-sm">
                        <span className="font-medium">{st.name}</span>
                        <span className="tabular-nums text-muted-foreground">{st.activeComplaints} / 10</span>
                      </div>
                      <Progress value={st.activeComplaints * 10} aria-label={`${st.name} workload`} />
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
