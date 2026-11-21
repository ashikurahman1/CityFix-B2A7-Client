"use client";

import { ArrowDownWideNarrow, ArrowUpNarrowWide, ClipboardList, FilterX } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { type Column, DataTable } from "@/components/shared/data-table";
import { FilterSelect } from "@/components/shared/filter-select";
import { PaginationBar } from "@/components/shared/pagination-bar";
import { SearchInput } from "@/components/shared/search-input";
import { SlaIndicator } from "@/components/shared/sla-indicator";
import { PriorityBadge, StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useCategories, useDepartments } from "@/hooks/queries/use-catalog";
import { useComplaints } from "@/hooks/queries/use-complaints";
import { useUrlState } from "@/hooks/use-url-state";
import type { QueryParams } from "@/lib/api/client";
import { ALL_PRIORITIES, ALL_STATUSES, PRIORITY_META, STATUS_META } from "@/lib/constants";
import { formatDate, formatMoney } from "@/lib/format";
import type { ComplaintListItem, ComplaintStatus, Role } from "@/types/api";

const KEYS = ["q", "status", "priority", "type", "categoryId", "departmentId", "overdue", "sortBy", "sortOrder"] as const;

const SORTS = [
  { value: "createdAt", label: "Newest filed" },
  { value: "updatedAt", label: "Recently updated" },
  { value: "slaDueAt", label: "SLA deadline" },
  { value: "priority", label: "Priority" },
  { value: "status", label: "Status" },
];

type Filter = "status" | "priority" | "type" | "category" | "department" | "overdue";

interface ComplaintsTableProps {
  role: Role;
  /** Fixed API filters for this view (e.g. assignedToMe=true). Not shown in the URL. */
  baseParams?: QueryParams;
  filters?: Filter[];
  statuses?: ComplaintStatus[];
  hrefFor: (id: string) => string;
  empty: { title: string; description?: string; action?: React.ReactNode };
  pageSize?: number;
  /** Extra trailing cell, e.g. a quick "Claim" button. */
  rowAction?: (row: ComplaintListItem) => React.ReactNode;
}

export function ComplaintsTable({
  role,
  baseParams,
  filters = ["status", "priority", "type"],
  statuses = ALL_STATUSES,
  hrefFor,
  empty,
  pageSize = 10,
  rowAction,
}: ComplaintsTableProps) {
  const router = useRouter();
  const { values, page, update, setPage, reset, activeCount, isPending } = useUrlState(KEYS);
  const categories = useCategories();
  const departments = useDepartments();

  const params: QueryParams = {
    ...baseParams,
    page,
    limit: pageSize,
    q: values.q,
    status: values.status,
    priority: values.priority,
    type: values.type,
    categoryId: values.categoryId,
    departmentId: values.departmentId,
    overdue: values.overdue,
    sortBy: values.sortBy ?? "createdAt",
    sortOrder: values.sortOrder ?? "desc",
  };
  const query = useComplaints(params);

  const columns = useMemo<Column<ComplaintListItem>[]>(() => {
    const cols: Column<ComplaintListItem>[] = [
      {
        key: "title",
        header: "Request",
        className: "min-w-64",
        cell: (c) => (
          <Link href={hrefFor(c.id)} className="group block" onClick={(e) => e.stopPropagation()}>
            <span className="line-clamp-1 font-medium group-hover:text-primary">{c.title}</span>
            <span className="font-mono text-xs text-muted-foreground">{c.trackingCode}</span>
          </Link>
        ),
      },
      { key: "status", header: "Status", cell: (c) => <StatusBadge status={c.status} /> },
      { key: "priority", header: "Priority", cell: (c) => <PriorityBadge priority={c.priority} /> },
      {
        key: "category",
        header: "Category",
        cell: (c) => (
          <div className="text-sm">
            <p className="line-clamp-1">{c.category.name}</p>
            {role === "ADMIN" ? <p className="text-xs text-muted-foreground">{c.department.name}</p> : null}
          </div>
        ),
      },
    ];
    if (role !== "CITIZEN") {
      cols.push({
        key: "assigned",
        header: "Assignee",
        cell: (c) =>
          c.assignedTo ? (
            <span className="text-sm">{c.assignedTo.name}</span>
          ) : (
            <span className="text-sm text-muted-foreground">Unassigned</span>
          ),
      });
    } else {
      cols.push({
        key: "fee",
        header: "Fee",
        cell: (c) => (
          <span className="text-sm tabular-nums">{Number(c.feeAmount) > 0 ? formatMoney(c.feeAmount) : "Free"}</span>
        ),
      });
    }
    cols.push(
      { key: "sla", header: "SLA", cell: (c) => <SlaIndicator sla={c.sla} /> },
      {
        key: "created",
        header: "Filed",
        cell: (c) => <span className="text-sm whitespace-nowrap text-muted-foreground">{formatDate(c.createdAt)}</span>,
      },
    );
    if (rowAction) {
      cols.push({
        key: "action",
        header: <span className="sr-only">Actions</span>,
        className: "text-right",
        cell: (c) => (
          <div className="flex justify-end" onClick={(e) => e.stopPropagation()}>
            {rowAction(c)}
          </div>
        ),
      });
    }
    return cols;
  }, [role, hrefFor, rowAction]);

  const desc = (values.sortOrder ?? "desc") === "desc";

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex flex-col flex-wrap gap-2 sm:flex-row sm:items-center">
          <SearchInput value={values.q} onChange={(q) => update({ q })} placeholder="Search title, address, code" />
          {filters.includes("status") ? (
            <FilterSelect
              label="Status"
              value={values.status}
              onChange={(status) => update({ status })}
              options={statuses.map((s) => ({ value: s, label: STATUS_META[s].label }))}
            />
          ) : null}
          {filters.includes("priority") ? (
            <FilterSelect
              label="Priority"
              value={values.priority}
              onChange={(priority) => update({ priority })}
              options={ALL_PRIORITIES.map((p) => ({ value: p, label: PRIORITY_META[p].label }))}
              className="sm:w-36"
            />
          ) : null}
          {filters.includes("type") ? (
            <FilterSelect
              label="Type"
              allLabel="All types"
              value={values.type}
              onChange={(type) => update({ type })}
              options={[
                { value: "COMPLAINT", label: "Complaints" },
                { value: "SERVICE", label: "Paid services" },
              ]}
              className="sm:w-36"
            />
          ) : null}
          {filters.includes("department") ? (
            <FilterSelect
              label="Department"
              allLabel="All departments"
              value={values.departmentId}
              onChange={(departmentId) => update({ departmentId })}
              options={(departments.data ?? []).map((d) => ({ value: d.id, label: d.name }))}
              className="sm:w-52"
            />
          ) : null}
          {filters.includes("category") ? (
            <FilterSelect
              label="Category"
              allLabel="All categories"
              value={values.categoryId}
              onChange={(categoryId) => update({ categoryId })}
              options={(categories.data ?? []).map((c) => ({ value: c.id, label: c.name }))}
              className="sm:w-52"
            />
          ) : null}
          {filters.includes("overdue") ? (
            <div className="flex h-9 items-center gap-2 rounded-lg border px-3">
              <Switch
                id="overdue"
                checked={values.overdue === "true"}
                onCheckedChange={(v) => update({ overdue: v ? "true" : undefined })}
              />
              <Label htmlFor="overdue" className="text-sm font-normal">
                Overdue only
              </Label>
            </div>
          ) : null}
          {activeCount > 0 ? (
            <Button variant="ghost" size="sm" onClick={reset}>
              <FilterX data-icon="inline-start" /> Clear
            </Button>
          ) : null}
        </div>
        <div className="flex items-center gap-2">
          <FilterSelect
            label="Sort by"
            allLabel="Newest filed"
            value={values.sortBy && values.sortBy !== "createdAt" ? values.sortBy : undefined}
            onChange={(sortBy) => update({ sortBy })}
            options={SORTS.slice(1)}
            className="sm:w-44"
          />
          <Button
            variant="outline"
            size="icon"
            onClick={() => update({ sortOrder: desc ? "asc" : undefined })}
            aria-label={desc ? "Sort ascending" : "Sort descending"}
            title={desc ? "Descending" : "Ascending"}
          >
            {desc ? <ArrowDownWideNarrow /> : <ArrowUpNarrowWide />}
          </Button>
        </div>
      </div>

      <DataTable
        columns={columns}
        rows={query.data?.items}
        rowKey={(c) => c.id}
        isLoading={query.isPending}
        isFetching={query.isFetching || isPending}
        onRowClick={(c) => router.push(hrefFor(c.id))}
        empty={{
          icon: activeCount > 0 ? FilterX : ClipboardList,
          title: activeCount > 0 ? "No requests match these filters" : empty.title,
          description: activeCount > 0 ? "Try a different status or clear the filters." : empty.description,
          action:
            activeCount > 0 ? (
              <Button variant="outline" onClick={reset}>
                Clear filters
              </Button>
            ) : (
              empty.action
            ),
        }}
        mobileCard={(c) => (
          <Link href={hrefFor(c.id)} className="block rounded-xl border bg-card p-4 active:bg-muted/50">
            <div className="flex items-start justify-between gap-3">
              <p className="line-clamp-2 font-medium">{c.title}</p>
              <PriorityBadge priority={c.priority} />
            </div>
            <p className="mt-0.5 font-mono text-xs text-muted-foreground">{c.trackingCode}</p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <StatusBadge status={c.status} />
              <SlaIndicator sla={c.sla} />
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              {c.category.name} · {formatDate(c.createdAt)}
              {role !== "CITIZEN" ? ` · ${c.assignedTo?.name ?? "Unassigned"}` : ""}
            </p>
          </Link>
        )}
      />
      {query.isError && !query.data ? (
        <p className="text-sm text-destructive" role="alert">
          {query.error.message}
        </p>
      ) : null}
      <PaginationBar meta={query.data?.meta} onPage={setPage} />
    </div>
  );
}
