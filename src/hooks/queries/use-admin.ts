"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api, type QueryParams } from "@/lib/api/client";
import { qk } from "@/lib/query-keys";
import type { AdminUser, AuditLog, DashboardStats, Paginated, Role } from "@/types/api";

export function useDashboardStats() {
  return useQuery({
    queryKey: qk.admin.stats,
    queryFn: ({ signal }) => api.get<DashboardStats>("/admin/dashboard-stats", undefined, signal),
    staleTime: 60_000,
  });
}

export function useUsers(params: QueryParams) {
  return useQuery({
    queryKey: qk.admin.users(params),
    queryFn: ({ signal }) => api.list<AdminUser>("/admin/users", params, signal),
    placeholderData: keepPreviousData,
  });
}

/** Active staff of a department, used by the assignment dialog. */
export function useStaffOptions(departmentId: string | undefined) {
  return useQuery({
    queryKey: qk.admin.staff(departmentId),
    queryFn: ({ signal }) =>
      api.list<AdminUser>("/admin/users", { role: "STAFF", departmentId, isActive: "true", limit: 100 }, signal),
    enabled: Boolean(departmentId),
    select: (res) => res.items,
  });
}

export function useAuditLogs(params: QueryParams) {
  return useQuery({
    queryKey: qk.admin.audit(params),
    queryFn: ({ signal }) => api.list<AuditLog>("/admin/audit-logs", params, signal),
    placeholderData: keepPreviousData,
  });
}

export interface CreateUserInput {
  name: string;
  email: string;
  password: string;
  role: Role;
  departmentId?: string;
  phone?: string;
}

export function useUserMutations() {
  const client = useQueryClient();
  const invalidate = () => {
    void client.invalidateQueries({ queryKey: ["admin", "users"] });
    void client.invalidateQueries({ queryKey: ["admin", "staff"] });
    void client.invalidateQueries({ queryKey: qk.admin.stats });
  };

  return {
    create: useMutation({
      mutationFn: (input: CreateUserInput) => api.post<AdminUser>("/admin/users", input),
      meta: { silent: true },
      onSuccess: () => {
        toast.success("Account created");
        invalidate();
      },
    }),
    changeRole: useMutation({
      mutationFn: ({ id, role, departmentId }: { id: string; role: Role; departmentId?: string }) =>
        api.patch<AdminUser>(`/admin/users/${id}/role`, { role, departmentId }),
      onSuccess: () => {
        toast.success("Role updated. The user must sign in again.");
        invalidate();
      },
    }),
    /** Optimistic toggle: the switch flips immediately and reverts if the API refuses. */
    changeStatus: useMutation({
      mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
        api.patch<AdminUser>(`/admin/users/${id}/status`, { isActive }),
      onMutate: async ({ id, isActive }) => {
        await client.cancelQueries({ queryKey: ["admin", "users"] });
        const snapshots = client.getQueriesData<Paginated<AdminUser>>({ queryKey: ["admin", "users"] });
        for (const [key, data] of snapshots) {
          if (!data) continue;
          client.setQueryData<Paginated<AdminUser>>(key, {
            ...data,
            items: data.items.map((u) => (u.id === id ? { ...u, isActive } : u)),
          });
        }
        return { snapshots };
      },
      onError: (_e, _v, ctx) => {
        for (const [key, data] of ctx?.snapshots ?? []) client.setQueryData(key, data);
      },
      onSuccess: ({ data }) => toast.success(`${data.name} ${data.isActive ? "activated" : "deactivated"}`),
      onSettled: invalidate,
    }),
    remove: useMutation({
      mutationFn: (id: string) => api.delete<null>(`/admin/users/${id}`),
      onSuccess: () => {
        toast.success("User deleted");
        invalidate();
      },
    }),
  };
}
