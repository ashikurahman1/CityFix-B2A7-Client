import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/page-header";
import { StaffPerformance } from "@/components/staff/staff-performance";

export const metadata: Metadata = { title: "Performance" };

export default function StaffPerformancePage() {
  return (
    <>
      <PageHeader title="Performance" description="Your throughput, resolution time and SLA record, based on your latest 100 assignments." />
      <StaffPerformance />
    </>
  );
}
