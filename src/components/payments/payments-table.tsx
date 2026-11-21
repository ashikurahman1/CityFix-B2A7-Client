"use client";

import { CreditCard, RefreshCw, Undo2 } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";
import { NoteDialog } from "@/components/complaints/note-dialog";
import { type Column, DataTable } from "@/components/shared/data-table";
import { FilterSelect } from "@/components/shared/filter-select";
import { PaginationBar } from "@/components/shared/pagination-bar";
import { PaymentBadge, StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { useRefundPayment, useVerifyPayment } from "@/hooks/queries/use-payments";
import { usePayments } from "@/hooks/queries/use-payments";
import { useUrlState } from "@/hooks/use-url-state";
import { ALL_PAYMENT_STATUSES, PAYMENT_META } from "@/lib/constants";
import { formatDateTime, formatMoney } from "@/lib/format";
import type { Payment } from "@/types/api";

const KEYS = ["status", "sortOrder"] as const;

/** Payment history. Citizens see their own; admins see everyone's and can refund. */
export function PaymentsTable({ admin = false }: { admin?: boolean }) {
  const { values, page, update, setPage, isPending } = useUrlState(KEYS);
  const query = usePayments({ page, limit: 10, status: values.status, sortOrder: values.sortOrder ?? "desc" });
  const verify = useVerifyPayment();
  const refund = useRefundPayment();
  const requestHref = (id: string) => (admin ? `/admin/complaints/${id}` : `/dashboard/requests/${id}`);

  const columns = useMemo<Column<Payment>[]>(() => {
    const cols: Column<Payment>[] = [
      {
        key: "request",
        header: "Request",
        className: "min-w-56",
        cell: (p) => (
          <Link href={requestHref(p.complaint.id)} className="group block">
            <span className="line-clamp-1 font-medium group-hover:text-primary">{p.complaint.title}</span>
            <span className="font-mono text-xs text-muted-foreground">{p.complaint.trackingCode}</span>
          </Link>
        ),
      },
    ];
    if (admin) {
      cols.push({
        key: "citizen",
        header: "Citizen",
        cell: (p) => (
          <div className="text-sm">
            <p>{p.user?.name}</p>
            <p className="text-xs text-muted-foreground">{p.user?.email}</p>
          </div>
        ),
      });
    }
    cols.push(
      {
        key: "amount",
        header: "Amount",
        cell: (p) => <span className="font-medium tabular-nums">{formatMoney(p.amount, p.currency)}</span>,
      },
      { key: "status", header: "Payment", cell: (p) => <PaymentBadge status={p.status} /> },
      { key: "req-status", header: "Request status", cell: (p) => <StatusBadge status={p.complaint.status} /> },
      {
        key: "date",
        header: "Date",
        cell: (p) => <span className="text-sm whitespace-nowrap text-muted-foreground">{formatDateTime(p.paidAt ?? p.createdAt)}</span>,
      },
      {
        key: "actions",
        header: <span className="sr-only">Actions</span>,
        className: "text-right",
        cell: (p) => (
          <div className="flex justify-end gap-1">
            {p.status === "PENDING" && p.stripeSessionId ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => verify.mutate(p.id)}
                disabled={verify.isPending}
                title="Re-check the status with Stripe"
              >
                <RefreshCw data-icon="inline-start" /> Sync
              </Button>
            ) : null}
            {!admin && p.status === "PENDING" && p.checkoutUrl ? (
              <Button variant="outline" size="sm" asChild>
                <a href={p.checkoutUrl}>
                  <CreditCard data-icon="inline-start" /> Resume
                </a>
              </Button>
            ) : null}
            {admin && p.status === "PAID" && ["REJECTED", "CANCELLED"].includes(p.complaint.status) ? (
              <NoteDialog
                trigger={
                  <Button variant="outline" size="sm">
                    <Undo2 data-icon="inline-start" /> Refund
                  </Button>
                }
                title={`Refund ${formatMoney(p.amount, p.currency)}`}
                description="The full amount is returned to the citizen's card through Stripe. This cannot be undone."
                label="Reason"
                confirmLabel="Issue refund"
                destructive
                onConfirm={(reason) => refund.mutateAsync({ id: p.id, reason: reason ?? "" })}
              />
            ) : null}
          </div>
        ),
      },
    );
    return cols;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [admin, verify.isPending]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row">
        <FilterSelect
          label="Status"
          value={values.status}
          onChange={(status) => update({ status })}
          options={ALL_PAYMENT_STATUSES.map((s) => ({ value: s, label: PAYMENT_META[s].label }))}
        />
        <FilterSelect
          label="Order"
          allLabel="Newest first"
          value={values.sortOrder}
          onChange={(sortOrder) => update({ sortOrder })}
          options={[{ value: "asc", label: "Oldest first" }]}
        />
      </div>
      <DataTable
        columns={columns}
        rows={query.data?.items}
        rowKey={(p) => p.id}
        isLoading={query.isPending}
        isFetching={query.isFetching || isPending}
        empty={{
          icon: CreditCard,
          title: values.status ? "No payments with this status" : "No payments yet",
          description: admin
            ? "Service fee payments made by citizens will appear here."
            : "When you pay for a municipal service, the receipt shows up here.",
        }}
        mobileCard={(p) => (
          <div className="rounded-xl border bg-card p-4">
            <div className="flex items-start justify-between gap-3">
              <Link href={requestHref(p.complaint.id)} className="line-clamp-2 font-medium">
                {p.complaint.title}
              </Link>
              <span className="font-semibold tabular-nums">{formatMoney(p.amount, p.currency)}</span>
            </div>
            <p className="font-mono text-xs text-muted-foreground">{p.complaint.trackingCode}</p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <PaymentBadge status={p.status} />
              <span className="text-xs text-muted-foreground">{formatDateTime(p.paidAt ?? p.createdAt)}</span>
            </div>
          </div>
        )}
      />
      <PaginationBar meta={query.data?.meta} onPage={setPage} />
    </div>
  );
}
