import type { Metadata } from "next";
import { Suspense } from "react";
import { CategoriesAdmin } from "@/components/admin/catalog-admin";
import { PageHeader } from "@/components/shared/page-header";
import { PageSkeleton } from "@/components/shared/page-skeleton";

export const metadata: Metadata = { title: "Categories" };

export default function AdminCategoriesPage() {
  return (
    <>
      <PageHeader
        title="Categories & fees"
        description="What citizens can report or apply for, which department owns it, its SLA and its service fee."
      />
      <Suspense fallback={<PageSkeleton />}>
        <CategoriesAdmin />
      </Suspense>
    </>
  );
}
