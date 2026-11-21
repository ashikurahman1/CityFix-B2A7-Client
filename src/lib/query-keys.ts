import type { QueryParams } from "@/lib/api/client";

/** Central TanStack Query key factory: invalidation by prefix stays consistent everywhere. */
export const qk = {
  me: ["me"] as const,
  categories: (params?: QueryParams) => ["categories", params ?? {}] as const,
  departments: ["departments"] as const,
  department: (id: string) => ["departments", id] as const,
  complaints: {
    all: ["complaints"] as const,
    list: (params: QueryParams) => ["complaints", "list", params] as const,
    detail: (id: string) => ["complaints", "detail", id] as const,
    timeline: (id: string) => ["complaints", "timeline", id] as const,
    comments: (id: string) => ["complaints", "comments", id] as const,
  },
  payments: {
    all: ["payments"] as const,
    list: (params: QueryParams) => ["payments", "list", params] as const,
  },
  admin: {
    stats: ["admin", "stats"] as const,
    users: (params: QueryParams) => ["admin", "users", params] as const,
    staff: (departmentId?: string) => ["admin", "staff", departmentId ?? "all"] as const,
    audit: (params: QueryParams) => ["admin", "audit", params] as const,
  },
};
