"use client";

import { ChevronDown, FilterX, ScrollText } from "lucide-react";
import { useMemo } from "react";
import { type Column, DataTable } from "@/components/shared/data-table";
import { FilterSelect } from "@/components/shared/filter-select";
import { PaginationBar } from "@/components/shared/pagination-bar";
import { RoleBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useAuditLogs } from "@/hooks/queries/use-admin";
import { useUrlState } from "@/hooks/use-url-state";
import { formatDateTime, titleCase } from "@/lib/format";
import type { AuditLog } from "@/types/api";

const KEYS = ["action", "entity", "from", "to", "sortOrder"] as const;

/** Actions written by the API (utils/audit + services). */
const ACTIONS = [
  "USER_LOGIN",
  "USER_REGISTERED",
  "USER_CREATED_BY_ADMIN",
  "USER_ROLE_CHANGED",
  "USER_ACTIVATED",
  "USER_DEACTIVATED",
  "USER_DELETED",
  "USER_PASSWORD_CHANGED",
  "COMPLAINT_CREATED",
  "COMPLAINT_UPDATED",
  "COMPLAINT_ASSIGNED",
  "COMPLAINT_CLAIMED",
  "COMPLAINT_STATUS_CHANGED",
  "COMPLAINT_REOPENED",
  "COMPLAINT_CANCELLED",
  "COMPLAINT_FEEDBACK_SUBMITTED",
  "COMPLAINT_DELETED",
  "PAYMENT_INITIATED",
  "PAYMENT_COMPLETED",
  "PAYMENT_REFUNDED",
  "DEPARTMENT_CREATED",
  "DEPARTMENT_UPDATED",
  "DEPARTMENT_DELETED",
  "CATEGORY_CREATED",
  "CATEGORY_UPDATED",
  "CATEGORY_DELETED",
];
const ENTITIES = ["User", "Complaint", "Payment", "Department", "Category"];

function Metadata({ value }: { value: AuditLog["metadata"] }) {
  if (!value || Object.keys(value).length === 0) return <span className="text-xs text-muted-foreground">—</span>;
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="h-7 text-xs">
          {Object.keys(value).length} field{Object.keys(value).length > 1 ? "s" : ""} <ChevronDown data-icon="inline-end" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80">
        <pre className="max-h-64 overflow-auto rounded-md bg-muted p-3 font-mono text-xs whitespace-pre-wrap">
          {JSON.stringify(value, null, 2)}
        </pre>
      </PopoverContent>
    </Popover>
  );
}

export function AuditLogTable() {
  const { values, page, update, setPage, reset, activeCount, isPending } = useUrlState(KEYS);
  // Date inputs give yyyy-mm-dd; "to" is made inclusive of the whole day.
  const query = useAuditLogs({
    page,
    limit: 20,
    action: values.action,
    entity: values.entity,
    from: values.from ? new Date(`${values.from}T00:00:00`).toISOString() : undefined,
    to: values.to ? new Date(`${values.to}T23:59:59`).toISOString() : undefined,
    sortOrder: values.sortOrder ?? "desc",
  });

  const columns = useMemo<Column<AuditLog>[]>(
    () => [
      {
        key: "when",
        header: "When",
        cell: (l) => <span className="text-sm whitespace-nowrap">{formatDateTime(l.createdAt)}</span>,
      },
      {
        key: "action",
        header: "Action",
        cell: (l) => <span className="font-mono text-xs font-medium">{l.action}</span>,
      },
      {
        key: "actor",
        header: "Actor",
        className: "min-w-44",
        cell: (l) =>
          l.actor ? (
            <div className="flex flex-col gap-1">
              <span className="text-sm">{l.actor.name}</span>
              <RoleBadge role={l.actor.role} className="h-5 w-fit px-2 text-[11px]" />
            </div>
          ) : (
            <span className="text-sm text-muted-foreground">System</span>
          ),
      },
      {
        key: "entity",
        header: "Entity",
        cell: (l) => (
          <div className="text-sm">
            <p>{l.entity}</p>
            {l.entityId ? <p className="max-w-32 truncate font-mono text-xs text-muted-foreground">{l.entityId}</p> : null}
          </div>
        ),
      },
      { key: "ip", header: "IP", cell: (l) => <span className="font-mono text-xs text-muted-foreground">{l.ipAddress ?? "—"}</span> },
      { key: "meta", header: "Details", className: "text-right", cell: (l) => <Metadata value={l.metadata} /> },
    ],
    [],
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col flex-wrap gap-2 sm:flex-row sm:items-end">
        <FilterSelect
          label="Action"
          allLabel="All actions"
          value={values.action}
          onChange={(action) => update({ action })}
          options={ACTIONS.map((a) => ({ value: a, label: titleCase(a) }))}
          className="sm:w-60"
        />
        <FilterSelect
          label="Entity"
          allLabel="All entities"
          value={values.entity}
          onChange={(entity) => update({ entity })}
          options={ENTITIES.map((e) => ({ value: e, label: e }))}
          className="sm:w-40"
        />
        <div className="flex gap-2">
          <div className="grid gap-1">
            <Label htmlFor="from" className="text-xs text-muted-foreground">
              From
            </Label>
            <Input id="from" type="date" className="h-9 w-40" value={values.from ?? ""} max={values.to} onChange={(e) => update({ from: e.target.value })} />
          </div>
          <div className="grid gap-1">
            <Label htmlFor="to" className="text-xs text-muted-foreground">
              To
            </Label>
            <Input id="to" type="date" className="h-9 w-40" value={values.to ?? ""} min={values.from} onChange={(e) => update({ to: e.target.value })} />
          </div>
        </div>
        <FilterSelect
          label="Order"
          allLabel="Newest first"
          value={values.sortOrder}
          onChange={(sortOrder) => update({ sortOrder })}
          options={[{ value: "asc", label: "Oldest first" }]}
          className="sm:w-36"
        />
        {activeCount > 0 ? (
          <Button variant="ghost" size="sm" onClick={reset} className="h-9">
            <FilterX data-icon="inline-start" /> Clear
          </Button>
        ) : null}
      </div>
      <DataTable
        columns={columns}
        rows={query.data?.items}
        rowKey={(l) => l.id}
        isLoading={query.isPending}
        isFetching={query.isFetching || isPending}
        skeletonRows={10}
        empty={{ icon: ScrollText, title: "No audit entries", description: "Nothing was recorded for these filters." }}
        mobileCard={(l) => (
          <div className="rounded-xl border bg-card p-4">
            <div className="flex items-start justify-between gap-2">
              <span className="font-mono text-xs font-medium">{l.action}</span>
              <Metadata value={l.metadata} />
            </div>
            <p className="mt-1 text-sm">
              {l.actor?.name ?? "System"} · {l.entity}
            </p>
            <p className="text-xs text-muted-foreground">{formatDateTime(l.createdAt)}</p>
          </div>
        )}
      />
      <PaginationBar meta={query.data?.meta} onPage={setPage} />
    </div>
  );
}
