import type { Metadata } from "next";
import { Suspense } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { PageSkeleton } from "@/components/shared/page-skeleton";
import { StaffQueue } from "@/components/staff/staff-views";

export const metadata: Metadata = { title: "Department queue" };

export default function StaffQueuePage() {
  return (
    <>
      <PageHeader
        title="Department queue"
        description="Submitted requests in your department that nobody owns yet. Claim one to take responsibility for it."
      />
      <Suspense fallback={<PageSkeleton />}>
        <StaffQueue />
      </Suspense>
    </>
  );
}
