import type { Metadata } from "next";
import { Suspense } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { PageSkeleton } from "@/components/shared/page-skeleton";
import { StaffTasks } from "@/components/staff/staff-views";

export const metadata: Metadata = { title: "My tasks" };

export default function StaffTasksPage() {
  return (
    <>
      <PageHeader title="My tasks" description="Requests assigned to you. Start work, post updates and resolve them before the SLA runs out." />
      <Suspense fallback={<PageSkeleton stats={4} />}>
        <StaffTasks />
      </Suspense>
    </>
  );
}
