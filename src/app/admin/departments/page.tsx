import type { Metadata } from "next";
import { DepartmentsAdmin } from "@/components/admin/catalog-admin";
import { PageHeader } from "@/components/shared/page-header";

export const metadata: Metadata = { title: "Departments" };

export default function AdminDepartmentsPage() {
  return (
    <>
      <PageHeader title="Departments" description="The teams requests are routed to. Contact details are shown on the public contact page." />
      <DepartmentsAdmin />
    </>
  );
}
