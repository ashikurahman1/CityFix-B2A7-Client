"use client";

import {
  ArrowLeft,
  Building2,
  CalendarDays,
  Copy,
  CreditCard,
  ExternalLink,
  MapPin,
  Tag,
  UserRound,
  Wrench,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { ErrorView } from "@/components/shared/error-view";
import { PageSkeleton } from "@/components/shared/page-skeleton";
import { SlaIndicator } from "@/components/shared/sla-indicator";
import { PaymentBadge, PriorityBadge, StatusBadge, TypeBadge } from "@/components/shared/status-badge";
import { StatusTimeline } from "@/components/shared/status-timeline";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useMe } from "@/hooks/use-auth";
import { useComplaint, useTimeline } from "@/hooks/queries/use-complaints";
import { ApiError } from "@/lib/api/client";
import { ROLE_LABEL } from "@/lib/auth/roles";
import { formatDateTime, formatMoney } from "@/lib/format";
import type { Role } from "@/types/api";
import { AttachmentsPanel } from "./attachments-panel";
import { CommentsPanel } from "./comments-panel";
import { ComplaintActions } from "./complaint-actions";
import { StarRating } from "./feedback-dialog";

const BACK: Record<Role, { href: string; label: string }> = {
  CITIZEN: { href: "/dashboard/requests", label: "My requests" },
  STAFF: { href: "/staff", label: "My tasks" },
  ADMIN: { href: "/admin/complaints", label: "All requests" },
};

function Detail({ icon: Icon, label, children }: { icon: typeof Tag; label: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-3">
      <Icon className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
      <div className="min-w-0">
        <dt className="text-xs text-muted-foreground">{label}</dt>
        <dd className="text-sm font-medium break-words">{children}</dd>
      </div>
    </div>
  );
}

function TimelineCard({ id }: { id: string }) {
  const timeline = useTimeline(id);
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-sans text-base">Timeline</CardTitle>
      </CardHeader>
      <CardContent>
        {timeline.isPending ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }, (_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : timeline.data ? (
          <StatusTimeline
            items={timeline.data.map((t) => ({
              id: t.id,
              status: t.toStatus,
              at: t.createdAt,
              note: t.note,
              by: t.changedBy ? `${t.changedBy.name} (${ROLE_LABEL[t.changedBy.role]})` : null,
            }))}
          />
        ) : (
          <p className="text-sm text-muted-foreground">Timeline unavailable.</p>
        )}
      </CardContent>
    </Card>
  );
}

/** Full request view shared by citizen, staff and admin; actions and fields adapt to the role. */
export function ComplaintDetailView({ id, role }: { id: string; role: Role }) {
  const { data: c, isPending, error, refetch } = useComplaint(id);
  const { data: me } = useMe();

  if (isPending) return <PageSkeleton variant="detail" />;
  if (error || !c) {
    const notFound = error instanceof ApiError && (error.status === 404 || error.status === 403);
    return notFound ? (
      <div className="py-16 text-center">
        <h1 className="text-2xl font-semibold">Request not available</h1>
        <p className="mt-2 text-muted-foreground">{error.message}</p>
        <Button asChild className="mt-6">
          <Link href={BACK[role].href}>Back to {BACK[role].label.toLowerCase()}</Link>
        </Button>
      </div>
    ) : (
      <ErrorView error={error} retry={() => void refetch()} homeHref={BACK[role].href} />
    );
  }

  const locked = ["CLOSED", "CANCELLED", "REJECTED"].includes(c.status);
  const mapHref =
    c.latitude != null && c.longitude != null
      ? `https://www.openstreetmap.org/?mlat=${c.latitude}&mlon=${c.longitude}#map=18/${c.latitude}/${c.longitude}`
      : `https://www.openstreetmap.org/search?query=${encodeURIComponent(c.address)}`;

  return (
    <div className="space-y-6">
      <div>
        <Button variant="ghost" size="sm" asChild className="-ms-2 mb-3 text-muted-foreground">
          <Link href={BACK[role].href}>
            <ArrowLeft data-icon="inline-start" /> {BACK[role].label}
          </Link>
        </Button>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <button
              type="button"
              onClick={() => {
                void navigator.clipboard.writeText(c.trackingCode);
                toast.success("Tracking code copied");
              }}
              className="inline-flex items-center gap-1.5 font-mono text-sm text-muted-foreground hover:text-foreground"
              aria-label={`Copy tracking code ${c.trackingCode}`}
            >
              {c.trackingCode} <Copy className="size-3.5" />
            </button>
            <h1 className="mt-1 text-2xl font-semibold text-balance sm:text-3xl">{c.title}</h1>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <StatusBadge status={c.status} />
              <PriorityBadge priority={c.priority} />
              <TypeBadge type={c.type} />
              <SlaIndicator sla={c.sla} className="ms-1" />
            </div>
          </div>
          <ComplaintActions complaint={c} role={role} me={me} />
        </div>
      </div>

      {c.status === "PENDING_PAYMENT" && role === "CITIZEN" ? (
        <Alert className="border-warning/40 bg-warning/10">
          <CreditCard className="size-4" />
          <AlertTitle>Payment required</AlertTitle>
          <AlertDescription>
            This service costs {formatMoney(c.feeAmount)}. It is sent to {c.department.name} once the payment is
            confirmed by Stripe (test card 4242 4242 4242 4242).
          </AlertDescription>
        </Alert>
      ) : null}
      {c.resolutionNote && (c.status === "RESOLVED" || c.status === "CLOSED" || c.status === "REJECTED") ? (
        <Alert className={c.status === "REJECTED" ? "border-destructive/40" : "border-success/40 bg-success/8"}>
          <AlertTitle>{c.status === "REJECTED" ? "Reason for rejection" : "Resolution note"}</AlertTitle>
          <AlertDescription className="whitespace-pre-wrap">{c.resolutionNote}</AlertDescription>
        </Alert>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <div className="min-w-0 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="font-sans text-base">Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{c.description}</p>
              <div className="mt-5 flex flex-wrap items-start justify-between gap-3 rounded-xl bg-muted/50 p-4">
                <div className="flex gap-3">
                  <MapPin className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
                  <div className="text-sm">
                    <p className="font-medium">{c.address}</p>
                    <p className="text-muted-foreground">
                      {c.ward ? `Ward ${c.ward}` : "No ward given"}
                      {c.latitude != null ? ` · ${c.latitude.toFixed(5)}, ${c.longitude?.toFixed(5)}` : ""}
                    </p>
                  </div>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <a href={mapHref} target="_blank" rel="noreferrer">
                    Open map <ExternalLink data-icon="inline-end" />
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
          <AttachmentsPanel complaintId={c.id} attachments={c.attachments} status={c.status} />
          <CommentsPanel complaintId={c.id} role={role} locked={locked} />
        </div>

        <div className="min-w-0 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="font-sans text-base">Details</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid gap-4">
                <Detail icon={Tag} label="Category">
                  {c.category.name}
                </Detail>
                <Detail icon={Building2} label="Department">
                  {c.department.name}
                </Detail>
                <Detail icon={Wrench} label="Assigned to">
                  {c.assignedTo ? c.assignedTo.name : <span className="text-muted-foreground">Not assigned yet</span>}
                </Detail>
                {role !== "CITIZEN" ? (
                  <Detail icon={UserRound} label="Filed by">
                    {c.citizen.name}
                    <span className="block text-xs font-normal text-muted-foreground">
                      {c.citizen.email}
                      {c.citizen.phone ? ` · ${c.citizen.phone}` : ""}
                    </span>
                  </Detail>
                ) : null}
                <Detail icon={CalendarDays} label="Filed">
                  {formatDateTime(c.createdAt)}
                </Detail>
                <Detail icon={CalendarDays} label="SLA deadline">
                  {c.sla.dueAt ? formatDateTime(c.sla.dueAt) : "Starts after payment"}
                </Detail>
              </dl>
            </CardContent>
          </Card>

          {c.type === "SERVICE" ? (
            <Card>
              <CardHeader>
                <CardTitle className="font-sans text-base">Service fee</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="font-heading text-2xl font-semibold">{formatMoney(c.feeAmount)}</p>
                {c.payments.length > 0 ? (
                  <ul className="space-y-2">
                    {c.payments.map((p) => (
                      <li key={p.id} className="flex items-center justify-between gap-2 text-sm">
                        <span className="text-muted-foreground">{formatDateTime(p.paidAt ?? p.createdAt)}</span>
                        <PaymentBadge status={p.status} />
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">No payment attempts yet.</p>
                )}
              </CardContent>
            </Card>
          ) : null}

          {c.feedback ? (
            <Card>
              <CardHeader>
                <CardTitle className="font-sans text-base">Citizen feedback</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <StarRating value={c.feedback.rating} size="sm" />
                {c.feedback.comment ? <p className="text-sm">{c.feedback.comment}</p> : null}
              </CardContent>
            </Card>
          ) : null}

          <TimelineCard id={c.id} />
        </div>
      </div>
    </div>
  );
}
