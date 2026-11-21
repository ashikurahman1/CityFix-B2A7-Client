"use client";

import { Ban, CheckCircle2, CreditCard, Hand, Play, RotateCcw, Star, Trash2, XCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { useComplaintAction } from "@/hooks/queries/use-complaints";
import { useStartCheckout } from "@/hooks/queries/use-payments";
import { ADMIN_TRANSITIONS, ALL_PRIORITIES, PRIORITY_META, REOPEN_WINDOW_DAYS, STAFF_TRANSITIONS } from "@/lib/constants";
import { formatMoney } from "@/lib/format";
import type { ComplaintDetail, Me, Priority, Role } from "@/types/api";
import { AssignDialog } from "./assign-dialog";
import { EditComplaintDialog } from "./edit-dialog";
import { FeedbackDialog } from "./feedback-dialog";
import { NoteDialog } from "./note-dialog";

const LIST_PATH: Record<Role, string> = {
  CITIZEN: "/dashboard/requests",
  STAFF: "/staff",
  ADMIN: "/admin/complaints",
};

const FINAL = ["CANCELLED", "REJECTED", "CLOSED"];

/**
 * Role-based UI: every button here maps to an endpoint the current role may call for the
 * current status. The API enforces the same rules; hiding what would fail keeps the UI honest.
 */
export function ComplaintActions({ complaint, role, me }: { complaint: ComplaintDetail; role: Role; me: Me | null | undefined }) {
  const action = useComplaintAction(complaint.id);
  const checkout = useStartCheckout();
  const router = useRouter();
  const s = complaint.status;
  // Captured once per mount: render must stay pure for the React Compiler.
  const [now] = useState(() => Date.now());
  const busy = action.isPending;

  const del = (
    <ConfirmDialog
      trigger={
        <Button variant="ghost" className="text-destructive hover:text-destructive">
          <Trash2 data-icon="inline-start" /> Delete
        </Button>
      }
      title="Delete this request?"
      description="It will be removed from your lists. The audit trail is kept."
      confirmLabel="Delete"
      destructive
      pending={busy}
      onConfirm={() =>
        action.mutate({ kind: "delete" }, { onSuccess: () => router.replace(LIST_PATH[role]) })
      }
    />
  );

  if (role === "CITIZEN") {
    const reopenDeadline = complaint.resolvedAt
      ? new Date(complaint.resolvedAt).getTime() + REOPEN_WINDOW_DAYS * 864e5
      : 0;
    const canReopen = s === "RESOLVED" && now < reopenDeadline;

    return (
      <div className="flex flex-wrap gap-2">
        {s === "PENDING_PAYMENT" ? (
          <Button onClick={() => checkout.mutate(complaint.id)} disabled={checkout.isPending || checkout.isSuccess}>
            {checkout.isPending || checkout.isSuccess ? <Spinner /> : <CreditCard data-icon="inline-start" />}
            Pay {formatMoney(complaint.feeAmount)}
          </Button>
        ) : null}
        {s === "RESOLVED" ? (
          <FeedbackDialog
            trigger={
              <Button>
                <Star data-icon="inline-start" /> Rate & close
              </Button>
            }
            onSubmit={(v) => action.mutateAsync({ kind: "feedback", ...v })}
          />
        ) : null}
        {canReopen ? (
          <NoteDialog
            trigger={
              <Button variant="outline">
                <RotateCcw data-icon="inline-start" /> Reopen
              </Button>
            }
            title="Reopen this request"
            description={`It goes back to the same staff member with a fresh SLA. Available for ${REOPEN_WINDOW_DAYS} days after resolution.`}
            label="What is still wrong?"
            confirmLabel="Reopen request"
            onConfirm={(reason) => action.mutateAsync({ kind: "reopen", reason: reason ?? "" })}
          />
        ) : null}
        {s === "SUBMITTED" || s === "PENDING_PAYMENT" ? (
          <>
            <EditComplaintDialog complaint={complaint} onSave={(body) => action.mutateAsync({ kind: "update", body })} />
            <NoteDialog
              trigger={
                <Button variant="ghost" className="text-destructive hover:text-destructive">
                  <Ban data-icon="inline-start" /> Cancel request
                </Button>
              }
              title="Cancel this request?"
              description={
                complaint.feeStatus === "PAID"
                  ? "The fee you paid will be refunded by a city administrator."
                  : "You can cancel until a staff member is assigned."
              }
              label="Reason"
              required={false}
              destructive
              confirmLabel="Cancel request"
              onConfirm={(reason) => action.mutateAsync({ kind: "cancel", reason })}
            />
          </>
        ) : null}
        {FINAL.includes(s) ? del : null}
      </div>
    );
  }

  if (role === "STAFF") {
    const mine = complaint.assignedToId === me?.id;
    const allowed = mine ? (STAFF_TRANSITIONS[s] ?? []) : [];
    return (
      <div className="flex flex-wrap gap-2">
        {s === "SUBMITTED" && !complaint.assignedToId ? (
          <Button onClick={() => action.mutate({ kind: "claim" })} disabled={busy}>
            {busy ? <Spinner /> : <Hand data-icon="inline-start" />}
            Claim this request
          </Button>
        ) : null}
        {allowed.includes("IN_PROGRESS") ? (
          <Button onClick={() => action.mutate({ kind: "status", status: "IN_PROGRESS" })} disabled={busy}>
            {busy ? <Spinner /> : <Play data-icon="inline-start" />}
            Start work
          </Button>
        ) : null}
        {allowed.includes("RESOLVED") ? (
          <NoteDialog
            trigger={
              <Button>
                <CheckCircle2 data-icon="inline-start" /> Mark resolved
              </Button>
            }
            title="Resolve this request"
            description="The citizen sees this note and can rate the fix or reopen it within 7 days."
            label="Resolution note"
            placeholder="What was done to fix it?"
            confirmLabel="Mark resolved"
            onConfirm={(note) => action.mutateAsync({ kind: "status", status: "RESOLVED", note })}
          />
        ) : null}
        {!mine && complaint.assignedToId ? (
          <p className="text-sm text-muted-foreground">Assigned to {complaint.assignedTo?.name}. View only.</p>
        ) : null}
      </div>
    );
  }

  // ADMIN
  const allowed = ADMIN_TRANSITIONS[s] ?? [];
  const canAssign = ["SUBMITTED", "ASSIGNED", "REOPENED"].includes(s);
  const paid = complaint.payments.find((p) => p.status === "PAID");

  return (
    <div className="flex flex-wrap items-center gap-2">
      {canAssign ? (
        <AssignDialog
          departmentId={complaint.departmentId}
          departmentName={complaint.department.name}
          currentStaffId={complaint.assignedToId}
          onAssign={(v) => action.mutateAsync({ kind: "assign", ...v })}
        />
      ) : null}
      {!FINAL.includes(s) ? (
        <Select
          value={complaint.priority}
          onValueChange={(v) => action.mutate({ kind: "update", body: { priority: v as Priority } })}
          disabled={busy}
        >
          <SelectTrigger className="w-40" aria-label="Change priority">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ALL_PRIORITIES.map((p) => (
              <SelectItem key={p} value={p}>
                {PRIORITY_META[p].label} priority
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : null}
      {allowed.includes("IN_PROGRESS") ? (
        <Button variant="outline" onClick={() => action.mutate({ kind: "status", status: "IN_PROGRESS" })} disabled={busy}>
          <Play data-icon="inline-start" /> Mark in progress
        </Button>
      ) : null}
      {allowed.includes("RESOLVED") ? (
        <NoteDialog
          trigger={
            <Button variant="outline">
              <CheckCircle2 data-icon="inline-start" /> Resolve
            </Button>
          }
          title="Resolve on behalf of staff"
          description="The citizen will be able to rate the fix or reopen it."
          label="Resolution note"
          confirmLabel="Resolve"
          onConfirm={(note) => action.mutateAsync({ kind: "status", status: "RESOLVED", note })}
        />
      ) : null}
      {allowed.includes("CLOSED") ? (
        <Button variant="outline" onClick={() => action.mutate({ kind: "status", status: "CLOSED" })} disabled={busy}>
          Close without feedback
        </Button>
      ) : null}
      {allowed.includes("REJECTED") ? (
        <NoteDialog
          trigger={
            <Button variant="ghost" className="text-destructive hover:text-destructive">
              <XCircle data-icon="inline-start" /> Reject
            </Button>
          }
          title="Reject this request"
          description={
            paid ? "This request was paid. Refund the fee from Payments after rejecting." : "The citizen sees the reason."
          }
          label="Reason"
          destructive
          confirmLabel="Reject request"
          onConfirm={(note) => action.mutateAsync({ kind: "status", status: "REJECTED", note })}
        />
      ) : null}
      {FINAL.includes(s) ? del : null}
    </div>
  );
}
