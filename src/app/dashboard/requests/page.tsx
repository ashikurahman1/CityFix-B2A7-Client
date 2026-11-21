import { FilePlus2 } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { CitizenRequestsTable } from "@/components/citizen/citizen-requests-table";
import { PageHeader } from "@/components/shared/page-header";
import { PageSkeleton } from "@/components/shared/page-skeleton";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "My requests" };

export default function MyRequestsPage() {
  return (
    <>
      <PageHeader
        title="My requests"
        description="Everything you have reported or applied for. Filters are saved in the URL so you can bookmark a view."
        actions={
          <Button asChild>
            <Link href="/dashboard/requests/new">
              <FilePlus2 data-icon="inline-start" /> New request
            </Link>
          </Button>
        }
      />
      <Suspense fallback={<PageSkeleton />}>
        <CitizenRequestsTable />
      </Suspense>
    </>
  );
}
