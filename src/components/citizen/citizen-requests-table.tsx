"use client";

import Link from "next/link";
import { ComplaintsTable } from "@/components/complaints/complaints-table";
import { Button } from "@/components/ui/button";

const hrefFor = (id: string) => `/dashboard/requests/${id}`;

export function CitizenRequestsTable() {
  return (
    <ComplaintsTable
      role="CITIZEN"
      filters={["status", "priority", "type", "category"]}
      hrefFor={hrefFor}
      empty={{
        title: "You haven't filed anything yet",
        description: "Report a problem in your area or apply for a municipal service.",
        action: (
          <Button asChild>
            <Link href="/dashboard/requests/new">File your first request</Link>
          </Button>
        ),
      }}
    />
  );
}
