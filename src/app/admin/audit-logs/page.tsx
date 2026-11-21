import type { Metadata } from "next";
import { Suspense } from "react";
import { AuditLogTable } from "@/components/admin/audit-log-table";
import { PageHeader } from "@/components/shared/page-header";
import { PageSkeleton } from "@/components/shared/page-skeleton";

export const metadata: Metadata = { title: "Audit logs" };

export default function AuditLogsPage() {
  return (
    <>
      <PageHeader
        title="Audit logs"
        description="Every login, role change, assignment, status change, payment and refund, written in the same transaction as the change."
      />
      <Suspense fallback={<PageSkeleton />}>
        <AuditLogTable />
      </Suspense>
    </>
  );
}
