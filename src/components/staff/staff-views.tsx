"use client";

import { AlarmClock, CheckCircle2, Hand, Inbox, ListChecks, Timer } from "lucide-react";
import Link from "next/link";
import { ComplaintsTable } from "@/components/complaints/complaints-table";
import { StatCard, StatCardSkeleton } from "@/components/shared/stat-card";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useComplaintAction, useComplaints } from "@/hooks/queries/use-complaints";
import { useMe } from "@/hooks/use-auth";
import type { ComplaintListItem, ComplaintStatus } from "@/types/api";

const taskHref = (id: string) => `/staff/tasks/${id}`;
const MY_STATUSES: ComplaintStatus[] = ["ASSIGNED", "IN_PROGRESS", "REOPENED", "RESOLVED", "CLOSED", "REJECTED"];

function TaskStats() {
  const base = { assignedToMe: "true", limit: 1 };
  const assigned = useComplaints({ ...base, status: "ASSIGNED" });
  const progress = useComplaints({ ...base, status: "IN_PROGRESS" });
  const overdue = useComplaints({ ...base, overdue: "true" });
  const resolved = useComplaints({ ...base, status: "RESOLVED" });
  const { data: me } = useMe();

  if (assigned.isPending || progress.isPending || overdue.isPending || resolved.isPending) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>
    );
  }
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard label="To start" value={assigned.data?.meta.total ?? 0} icon={ListChecks} hint="Assigned, not started" />
      <StatCard label="In progress" value={progress.data?.meta.total ?? 0} icon={Timer} tone="info" hint={`${me?.stats.activeAssignments ?? 0} / 10 active slots used`} />
      <StatCard label="Overdue" value={overdue.data?.meta.total ?? 0} icon={AlarmClock} tone="danger" hint="Past SLA deadline" />
      <StatCard label="Awaiting citizen" value={resolved.data?.meta.total ?? 0} icon={CheckCircle2} tone="success" hint="Resolved, pending feedback" />
    </div>
  );
}

export function StaffTasks() {
  return (
    <div className="space-y-6">
      <TaskStats />
      <ComplaintsTable
        role="STAFF"
        baseParams={{ assignedToMe: "true" }}
        filters={["status", "priority", "overdue"]}
        statuses={MY_STATUSES}
        hrefFor={taskHref}
        empty={{
          title: "No tasks assigned to you",
          description: "Claim open requests from your department's queue to get started.",
          action: (
            <Button asChild>
              <Link href="/staff/queue">
                <Inbox data-icon="inline-start" /> Open the queue
              </Link>
            </Button>
          ),
        }}
      />
    </div>
  );
}

function ClaimButton({ complaint }: { complaint: ComplaintListItem }) {
  const action = useComplaintAction(complaint.id);
  return (
    <Button size="sm" variant="outline" onClick={() => action.mutate({ kind: "claim" })} disabled={action.isPending || action.isSuccess}>
      {action.isPending ? <Spinner /> : <Hand data-icon="inline-start" />}
      {action.isSuccess ? "Claimed" : "Claim"}
    </Button>
  );
}

const claim = (c: ComplaintListItem) => <ClaimButton complaint={c} />;

export function StaffQueue() {
  const { data: me } = useMe();
  const full = (me?.stats.activeAssignments ?? 0) >= 10;
  return (
    <div className="space-y-4">
      {full ? (
        <p className="rounded-xl border border-warning/40 bg-warning/10 p-3 text-sm">
          You already hold 10 active requests, the maximum. Resolve one before claiming more.
        </p>
      ) : null}
      <ComplaintsTable
        role="STAFF"
        baseParams={{ unassigned: "true" }}
        filters={["priority", "type", "category", "overdue"]}
        hrefFor={taskHref}
        rowAction={full ? undefined : claim}
        empty={{
          title: "The queue is clear",
          description: "Every submitted request in your department has an owner. Nice work!",
        }}
      />
    </div>
  );
}
