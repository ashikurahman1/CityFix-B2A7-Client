"use client";

import type { LucideIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { EmptyState } from "./empty-state";

export interface Column<T> {
  key: string;
  header: React.ReactNode;
  cell: (row: T) => React.ReactNode;
  className?: string;
  /** Hide on small screens; the mobile card view shows the important fields instead. */
  hideOnMobile?: boolean;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  rows: T[] | undefined;
  rowKey: (row: T) => string;
  isLoading?: boolean;
  isFetching?: boolean;
  empty: { icon?: LucideIcon; title: string; description?: React.ReactNode; action?: React.ReactNode };
  /** Compact card rendering used below the `md` breakpoint. */
  mobileCard?: (row: T) => React.ReactNode;
  onRowClick?: (row: T) => void;
  skeletonRows?: number;
}

/** Reusable table with loading skeleton, empty state and a card layout on phones. */
export function DataTable<T>({
  columns,
  rows,
  rowKey,
  isLoading,
  isFetching,
  empty,
  mobileCard,
  onRowClick,
  skeletonRows = 6,
}: DataTableProps<T>) {
  if (!isLoading && rows && rows.length === 0) {
    return <EmptyState {...empty} />;
  }

  return (
    <div className={cn("transition-opacity", isFetching && !isLoading && "opacity-60")} aria-busy={isLoading}>
      {mobileCard ? (
        <ul className="grid gap-3 md:hidden">
          {isLoading
            ? Array.from({ length: 4 }, (_, i) => (
                <li key={i}>
                  <Skeleton className="h-28 w-full rounded-xl" />
                </li>
              ))
            : rows?.map((row) => <li key={rowKey(row)}>{mobileCard(row)}</li>)}
        </ul>
      ) : null}

      <div className={cn("overflow-hidden rounded-xl border bg-card", mobileCard && "hidden md:block")}>
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow className="hover:bg-transparent">
              {columns.map((col) => (
                <TableHead
                  key={col.key}
                  className={cn("h-11 text-xs font-medium tracking-wide text-muted-foreground uppercase", col.className)}
                >
                  {col.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading
              ? Array.from({ length: skeletonRows }, (_, i) => (
                  <TableRow key={i}>
                    {columns.map((col) => (
                      <TableCell key={col.key} className={col.className}>
                        <Skeleton className="h-5 w-full max-w-40" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              : rows?.map((row) => (
                  <TableRow
                    key={rowKey(row)}
                    onClick={onRowClick ? () => onRowClick(row) : undefined}
                    className={cn(onRowClick && "cursor-pointer")}
                  >
                    {columns.map((col) => (
                      <TableCell key={col.key} className={cn("py-3", col.className)}>
                        {col.cell(row)}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
