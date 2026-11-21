import type { Metadata } from "next";
import { Suspense } from "react";
import { AdminComplaintsTable } from "@/components/admin/admin-complaints-table";
import { PageHeader } from "@/components/shared/page-header";
import { PageSkeleton } from "@/components/shared/page-skeleton";

export const metadata: Metadata = { title: "Requests" };

export default function AdminComplaintsPage() {
  return (
    <>
      <PageHeader
        title="All requests"
        description="Triage, assign and follow up on every request in the city. Open a request to assign, re-prioritise or reject it."
      />
      <Suspense fallback={<PageSkeleton />}>
        <AdminComplaintsTable />
      </Suspense>
    </>
  );
}
