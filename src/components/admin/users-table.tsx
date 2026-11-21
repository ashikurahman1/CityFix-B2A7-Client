"use client";

import { MoreHorizontal, ShieldCheck, Trash2, Users } from "lucide-react";
import { useMemo, useState } from "react";
import { UserAvatar } from "@/components/layout/user-menu";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { type Column, DataTable } from "@/components/shared/data-table";
import { FilterSelect } from "@/components/shared/filter-select";
import { PaginationBar } from "@/components/shared/pagination-bar";
import { SearchInput } from "@/components/shared/search-input";
import { RoleBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";
import { useUserMutations, useUsers } from "@/hooks/queries/use-admin";
import { useDepartments } from "@/hooks/queries/use-catalog";
import { useMe } from "@/hooks/use-auth";
import { useUrlState } from "@/hooks/use-url-state";
import { ROLE_LABEL } from "@/lib/auth/roles";
import { formatDate, fromNow } from "@/lib/format";
import type { AdminUser, Role } from "@/types/api";
import { ChangeRoleDialog } from "./user-dialogs";

const KEYS = ["q", "role", "departmentId", "isActive", "sortBy"] as const;

function RowMenu({ user }: { user: AdminUser }) {
  const { remove } = useUserMutations();
  const [confirm, setConfirm] = useState(false);
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon-sm" aria-label={`Actions for ${user.name}`}>
            <MoreHorizontal />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <ChangeRoleDialog
            user={user}
            trigger={
              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                <ShieldCheck /> Change role
              </DropdownMenuItem>
            }
          />
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive" onSelect={() => setConfirm(true)}>
            <Trash2 /> Delete account
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <ConfirmDialog
        open={confirm}
        onOpenChange={setConfirm}
        trigger={<span className="hidden" />}
        title={`Delete ${user.name}?`}
        description="The account is soft-deleted and every session is revoked. Staff with active requests must hand them over first."
        confirmLabel="Delete account"
        destructive
        pending={remove.isPending}
        onConfirm={() => remove.mutate(user.id, { onSuccess: () => setConfirm(false) })}
      />
    </>
  );
}

export function UsersTable() {
  const { values, page, update, setPage, isPending } = useUrlState(KEYS);
  const departments = useDepartments();
  const { data: me } = useMe();
  const { changeStatus } = useUserMutations();
  const query = useUsers({
    page,
    limit: 15,
    q: values.q,
    role: values.role,
    departmentId: values.departmentId,
    isActive: values.isActive,
    sortBy: values.sortBy ?? "createdAt",
    sortOrder: values.sortBy === "name" || values.sortBy === "email" ? "asc" : "desc",
  });

  const columns = useMemo<Column<AdminUser>[]>(
    () => [
      {
        key: "user",
        header: "User",
        className: "min-w-56",
        cell: (u) => (
          <div className="flex items-center gap-3">
            <UserAvatar user={{ name: u.name, avatarUrl: null }} className="size-8" />
            <div className="min-w-0">
              <p className="truncate font-medium">{u.name}</p>
              <p className="truncate text-xs text-muted-foreground">{u.email}</p>
            </div>
          </div>
        ),
      },
      { key: "role", header: "Role", cell: (u) => <RoleBadge role={u.role} /> },
      {
        key: "dept",
        header: "Department",
        cell: (u) => <span className="text-sm">{u.department?.name ?? <span className="text-muted-foreground">—</span>}</span>,
      },
      {
        key: "login",
        header: "Last login",
        cell: (u) => <span className="text-sm text-muted-foreground">{u.lastLoginAt ? fromNow(u.lastLoginAt) : "Never"}</span>,
      },
      {
        key: "joined",
        header: "Joined",
        cell: (u) => <span className="text-sm whitespace-nowrap text-muted-foreground">{formatDate(u.createdAt)}</span>,
      },
      {
        key: "active",
        header: "Active",
        cell: (u) => (
          <Switch
            checked={u.isActive}
            disabled={u.id === me?.id}
            onCheckedChange={(isActive) => changeStatus.mutate({ id: u.id, isActive })}
            aria-label={`${u.isActive ? "Deactivate" : "Activate"} ${u.name}`}
          />
        ),
      },
      {
        key: "menu",
        header: <span className="sr-only">Actions</span>,
        className: "text-right",
        cell: (u) => (u.id === me?.id ? <span className="text-xs text-muted-foreground">You</span> : <RowMenu user={u} />),
      },
    ],
    [me?.id, changeStatus],
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col flex-wrap gap-2 sm:flex-row">
        <SearchInput value={values.q} onChange={(q) => update({ q })} placeholder="Search name or email" minLength={1} />
        <FilterSelect
          label="Role"
          value={values.role}
          onChange={(role) => update({ role })}
          options={(["CITIZEN", "STAFF", "ADMIN"] as Role[]).map((r) => ({ value: r, label: ROLE_LABEL[r] }))}
          allLabel="All roles"
        />
        <FilterSelect
          label="Department"
          allLabel="All departments"
          value={values.departmentId}
          onChange={(departmentId) => update({ departmentId })}
          options={(departments.data ?? []).map((d) => ({ value: d.id, label: d.name }))}
          className="sm:w-52"
        />
        <FilterSelect
          label="Status"
          allLabel="Any status"
          value={values.isActive}
          onChange={(isActive) => update({ isActive })}
          options={[
            { value: "true", label: "Active" },
            { value: "false", label: "Deactivated" },
          ]}
          className="sm:w-36"
        />
        <FilterSelect
          label="Sort"
          allLabel="Newest first"
          value={values.sortBy}
          onChange={(sortBy) => update({ sortBy })}
          options={[
            { value: "name", label: "Name A–Z" },
            { value: "lastLoginAt", label: "Last login" },
          ]}
          className="sm:w-40"
        />
      </div>
      <DataTable
        columns={columns}
        rows={query.data?.items}
        rowKey={(u) => u.id}
        isLoading={query.isPending}
        isFetching={query.isFetching || isPending}
        empty={{ icon: Users, title: "No users found", description: "Try another search or filter." }}
        mobileCard={(u) => (
          <div className="flex items-center gap-3 rounded-xl border bg-card p-4">
            <UserAvatar user={{ name: u.name, avatarUrl: null }} className="size-10" />
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium">{u.name}</p>
              <p className="truncate text-xs text-muted-foreground">{u.email}</p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <RoleBadge role={u.role} />
                {u.department ? <span className="text-xs text-muted-foreground">{u.department.name}</span> : null}
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <Switch
                checked={u.isActive}
                disabled={u.id === me?.id}
                onCheckedChange={(isActive) => changeStatus.mutate({ id: u.id, isActive })}
                aria-label={`${u.isActive ? "Deactivate" : "Activate"} ${u.name}`}
              />
              {u.id !== me?.id ? <RowMenu user={u} /> : null}
            </div>
          </div>
        )}
      />
      <PaginationBar meta={query.data?.meta} onPage={setPage} />
    </div>
  );
}
