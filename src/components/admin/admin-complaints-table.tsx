"use client";

import { ComplaintsTable } from "@/components/complaints/complaints-table";

const hrefFor = (id: string) => `/admin/complaints/${id}`;

export function AdminComplaintsTable() {
  return (
    <ComplaintsTable
      role="ADMIN"
      filters={["status", "priority", "type", "department", "category", "overdue"]}
      hrefFor={hrefFor}
      pageSize={15}
      empty={{ title: "No requests yet", description: "Requests filed by citizens appear here." }}
    />
  );
}
