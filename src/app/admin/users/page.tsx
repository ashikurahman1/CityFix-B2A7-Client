import type { Metadata } from "next";
import { Suspense } from "react";
import { UsersTable } from "@/components/admin/users-table";
import { CreateUserDialog } from "@/components/admin/user-dialogs";
import { PageHeader } from "@/components/shared/page-header";
import { PageSkeleton } from "@/components/shared/page-skeleton";

export const metadata: Metadata = { title: "Users & staff" };

export default function AdminUsersPage() {
  return (
    <>
      <PageHeader
        title="Users & staff"
        description="Create staff and admin accounts, move people between departments and deactivate access."
        actions={<CreateUserDialog />}
      />
      <Suspense fallback={<PageSkeleton />}>
        <UsersTable />
      </Suspense>
    </>
  );
}
