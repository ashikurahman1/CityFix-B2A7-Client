import type { Metadata } from "next";
import { Suspense } from "react";
import { PaymentsTable } from "@/components/payments/payments-table";
import { PageHeader } from "@/components/shared/page-header";
import { PageSkeleton } from "@/components/shared/page-skeleton";

export const metadata: Metadata = { title: "Payments & refunds" };

export default function AdminPaymentsPage() {
  return (
    <>
      <PageHeader
        title="Payments & refunds"
        description="Every Stripe checkout across the city. Paid fees on rejected or cancelled requests can be refunded here."
      />
      <Suspense fallback={<PageSkeleton />}>
        <PaymentsTable admin />
      </Suspense>
    </>
  );
}
