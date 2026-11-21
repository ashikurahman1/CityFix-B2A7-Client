import type { Metadata } from "next";
import { Suspense } from "react";
import { PaymentsTable } from "@/components/payments/payments-table";
import { PageHeader } from "@/components/shared/page-header";
import { PageSkeleton } from "@/components/shared/page-skeleton";

export const metadata: Metadata = { title: "Payments" };

export default function CitizenPaymentsPage() {
  return (
    <>
      <PageHeader
        title="Payments"
        description="Service fees paid through Stripe. Pending checkouts can be resumed or re-synced with Stripe."
      />
      <Suspense fallback={<PageSkeleton />}>
        <PaymentsTable />
      </Suspense>
    </>
  );
}
