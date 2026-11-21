"use client";

import { AlertCircle, ArrowRight, CheckCircle2, ClipboardList, CreditCard, FilePlus2, Star, Timer } from "lucide-react";
import Link from "next/link";
import { EmptyState } from "@/components/shared/empty-state";
import { SlaIndicator } from "@/components/shared/sla-indicator";
import { StatCard, StatCardSkeleton } from "@/components/shared/stat-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useComplaints } from "@/hooks/queries/use-complaints";
import { useMe } from "@/hooks/use-auth";
import { fromNow } from "@/lib/format";

/** Citizen home: counts come from list endpoints with limit=1 (only `meta.total` is used). */
export function CitizenOverview() {
  const { data: me } = useMe();
  const recent = useComplaints({ limit: 5, sortBy: "updatedAt" });
  const awaitingPayment = useComplaints({ limit: 3, status: "PENDING_PAYMENT" });
  const toRate = useComplaints({ limit: 3, status: "RESOLVED" });
  const open = useComplaints({ limit: 1, status: "IN_PROGRESS" });

  const loading = recent.isPending || awaitingPayment.isPending || toRate.isPending || open.isPending;
  const firstName = me?.name.split(" ")[0];

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-2xl font-semibold sm:text-3xl">{firstName ? `Hello, ${firstName}` : "Hello"} 👋</h1>
          <p className="mt-1 text-muted-foreground">Here is what is happening with your requests.</p>
        </div>
        <Button asChild size="lg">
          <Link href="/dashboard/requests/new">
            <FilePlus2 data-icon="inline-start" /> Report an issue
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {loading || !me ? (
          Array.from({ length: 4 }, (_, i) => <StatCardSkeleton key={i} />)
        ) : (
          <>
            <StatCard label="Requests filed" value={me.stats.complaintsSubmitted} icon={ClipboardList} hint="All time" />
            <StatCard label="Being worked on" value={open.data?.meta.total ?? 0} icon={Timer} tone="info" hint="In progress now" />
            <StatCard
              label="Awaiting payment"
              value={awaitingPayment.data?.meta.total ?? 0}
              icon={CreditCard}
              tone="warning"
              hint="Pay to route to the department"
            />
            <StatCard
              label="Ready to rate"
              value={toRate.data?.meta.total ?? 0}
              icon={Star}
              tone="success"
              hint="Resolved, waiting for you"
            />
          </>
        )}
      </div>

      {(awaitingPayment.data?.items.length ?? 0) > 0 || (toRate.data?.items.length ?? 0) > 0 ? (
        <Card className="border-warning/40">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-sans text-base">
              <AlertCircle className="size-4 text-warning" /> Needs your attention
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="divide-y">
              {[...(awaitingPayment.data?.items ?? []), ...(toRate.data?.items ?? [])].map((c) => (
                <li key={c.id} className="flex flex-wrap items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                  <div className="min-w-0">
                    <Link href={`/dashboard/requests/${c.id}`} className="font-medium hover:text-primary">
                      {c.title}
                    </Link>
                    <p className="font-mono text-xs text-muted-foreground">{c.trackingCode}</p>
                  </div>
                  <Button asChild size="sm" variant={c.status === "PENDING_PAYMENT" ? "default" : "outline"}>
                    <Link href={`/dashboard/requests/${c.id}`}>
                      {c.status === "PENDING_PAYMENT" ? (
                        <>
                          <CreditCard data-icon="inline-start" /> Pay now
                        </>
                      ) : (
                        <>
                          <CheckCircle2 data-icon="inline-start" /> Rate the fix
                        </>
                      )}
                    </Link>
                  </Button>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <div>
            <CardTitle className="font-sans text-base">Recent activity</CardTitle>
            <CardDescription>Your most recently updated requests</CardDescription>
          </div>
          <Button asChild variant="ghost" size="sm">
            <Link href="/dashboard/requests">
              View all <ArrowRight data-icon="inline-end" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {recent.isPending ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }, (_, i) => (
                <Skeleton key={i} className="h-14 w-full" />
              ))}
            </div>
          ) : recent.data && recent.data.items.length > 0 ? (
            <ul className="divide-y">
              {recent.data.items.map((c) => (
                <li key={c.id}>
                  <Link
                    href={`/dashboard/requests/${c.id}`}
                    className="-mx-2 flex flex-col gap-2 rounded-lg px-2 py-3 hover:bg-muted/50 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-medium">{c.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {c.category.name} · updated {fromNow(c.updatedAt)}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-3">
                      <SlaIndicator sla={c.sla} />
                      <StatusBadge status={c.status} />
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState
              title="Nothing here yet"
              description="When you report an issue, its progress shows up here."
              action={
                <Button asChild>
                  <Link href="/dashboard/requests/new">Report an issue</Link>
                </Button>
              }
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
