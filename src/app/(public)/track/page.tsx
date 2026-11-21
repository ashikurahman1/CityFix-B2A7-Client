import { Building2, CalendarClock, MapPinned, SearchX, Tag } from "lucide-react";
import type { Metadata } from "next";
import { Suspense } from "react";
import { EmptyState } from "@/components/shared/empty-state";
import { PriorityBadge, StatusBadge, TypeBadge } from "@/components/shared/status-badge";
import { StatusTimeline } from "@/components/shared/status-timeline";
import { PageHero } from "@/components/public/page-hero";
import { RecentCodes } from "@/components/public/recent-codes";
import { TrackForm } from "@/components/public/track-form";
import { Skeleton } from "@/components/ui/skeleton";
import { trackRequest } from "@/lib/api/server";
import { formatDate, formatDateTime, formatHours } from "@/lib/format";
import { trackingCodeField } from "@/lib/validations/common";

export const metadata: Metadata = {
  title: "Track a request",
  description: "Follow any CityFix complaint or service request with its tracking code. No login required.",
  alternates: { canonical: "/track" },
  openGraph: { title: "Track a CityFix request", url: "/track" },
};

/** Reads ?code= on the server, so this part streams in behind the Suspense boundary. */
async function TrackResult({ searchParams }: { searchParams: PageProps<"/track">["searchParams"] }) {
  const raw = (await searchParams).code;
  const input = typeof raw === "string" ? raw : undefined;

  if (!input) {
    return (
      <>
        <TrackForm size="lg" />
        <RecentCodes />
        <EmptyState
          className="mt-10"
          icon={MapPinned}
          title="Enter a tracking code"
          description="You received it when the request was filed. It looks like CF-261116-ABC123."
        />
      </>
    );
  }

  const parsed = trackingCodeField.safeParse(input);
  const result = parsed.success ? await trackRequest(parsed.data) : null;
  const code = parsed.success ? parsed.data : input;

  return (
    <>
      <TrackForm key={code} size="lg" defaultCode={code} />
      <RecentCodes current={result?.ok ? code : undefined} />
      {!result || !result.ok ? (
        <EmptyState
          className="mt-10"
          icon={SearchX}
          title={!parsed.success ? "That doesn't look like a tracking code" : "No request found"}
          description={
            !parsed.success
              ? "Tracking codes look like CF-261116-ABC123."
              : result && result.status >= 500
                ? result.message
                : `We couldn't find a request with code ${code}. Check for typos and try again.`
          }
        />
      ) : (
        <article className="mt-10 grid gap-6 lg:grid-cols-[1.3fr_1fr]">
          <div className="rounded-2xl border bg-card p-6">
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge status={result.data.status} />
              <PriorityBadge priority={result.data.priority} />
              <TypeBadge type={result.data.type} />
            </div>
            <h2 className="mt-4 font-mono text-2xl font-semibold">{result.data.trackingCode}</h2>
            <dl className="mt-5 grid gap-4 text-sm sm:grid-cols-2">
              <div className="flex gap-3">
                <Tag className="mt-0.5 size-4 text-muted-foreground" aria-hidden="true" />
                <div>
                  <dt className="text-muted-foreground">Category</dt>
                  <dd className="font-medium">{result.data.category.name}</dd>
                </div>
              </div>
              <div className="flex gap-3">
                <Building2 className="mt-0.5 size-4 text-muted-foreground" aria-hidden="true" />
                <div>
                  <dt className="text-muted-foreground">Department</dt>
                  <dd className="font-medium">{result.data.department.name}</dd>
                </div>
              </div>
              <div className="flex gap-3">
                <CalendarClock className="mt-0.5 size-4 text-muted-foreground" aria-hidden="true" />
                <div>
                  <dt className="text-muted-foreground">Filed</dt>
                  <dd className="font-medium">{formatDate(result.data.createdAt)}</dd>
                </div>
              </div>
              <div className="flex gap-3">
                <CalendarClock className="mt-0.5 size-4 text-muted-foreground" aria-hidden="true" />
                <div>
                  <dt className="text-muted-foreground">SLA deadline</dt>
                  <dd className="font-medium">
                    {result.data.sla.dueAt ? formatDateTime(result.data.sla.dueAt) : "Starts after payment"}
                    {result.data.sla.breached ? <span className="ms-2 text-destructive">(missed)</span> : null}
                    {result.data.sla.hoursRemaining != null && result.data.sla.hoursRemaining > 0 ? (
                      <span className="ms-2 text-muted-foreground">
                        ({formatHours(result.data.sla.hoursRemaining)} left)
                      </span>
                    ) : null}
                  </dd>
                </div>
              </div>
              {result.data.ward ? (
                <div className="flex gap-3">
                  <MapPinned className="mt-0.5 size-4 text-muted-foreground" aria-hidden="true" />
                  <div>
                    <dt className="text-muted-foreground">Ward</dt>
                    <dd className="font-medium">{result.data.ward}</dd>
                  </div>
                </div>
              ) : null}
            </dl>
            <p className="mt-6 rounded-xl bg-muted/60 p-4 text-xs text-muted-foreground">
              Public tracking shows progress only. Personal details and the description are visible to the citizen who
              filed the request and to city staff.
            </p>
          </div>
          <div className="rounded-2xl border bg-card p-6">
            <h3 className="mb-5 font-sans font-semibold">Status history</h3>
            <StatusTimeline
              items={result.data.history.map((h, i) => ({ id: `${i}`, status: h.toStatus, at: h.createdAt }))}
            />
          </div>
        </article>
      )}
    </>
  );
}

export default function TrackPage(props: PageProps<"/track">) {
  return (
    <>
      <PageHero
        eyebrow="Public tracking"
        title="Where is my request?"
        description="Enter the tracking code from your confirmation to see the current status and full history. No login needed."
      />
      <section className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        <Suspense
          fallback={
            <div className="space-y-6">
              <Skeleton className="h-11 w-full" />
              <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
                <Skeleton className="h-72 rounded-2xl" />
                <Skeleton className="h-72 rounded-2xl" />
              </div>
            </div>
          }
        >
          <TrackResult searchParams={props.searchParams} />
        </Suspense>
      </section>
    </>
  );
}
