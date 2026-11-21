"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { revalidateCatalog } from "@/app/actions/revalidate";
import { api } from "@/lib/api/client";
import { qk } from "@/lib/query-keys";
import type { Category, Department, RequestType } from "@/types/api";

export function useCategories(params: { type?: RequestType; departmentId?: string } = {}) {
  return useQuery({
    queryKey: qk.categories(params),
    queryFn: ({ signal }) => api.get<Category[]>("/categories", params, signal),
    staleTime: 5 * 60_000,
  });
}

export function useDepartments() {
  return useQuery({
    queryKey: qk.departments,
    queryFn: ({ signal }) => api.get<Department[]>("/departments", undefined, signal),
    staleTime: 5 * 60_000,
  });
}

export interface DepartmentInput {
  name: string;
  description?: string;
  contactEmail?: string;
  contactPhone?: string;
}

export interface CategoryInput {
  name: string;
  description?: string;
  type: RequestType;
  departmentId: string;
  slaHours: number;
  serviceFee: number;
  isActive: boolean;
}

/** Admin CRUD for departments and categories. Also busts the cached public pages. */
export function useCatalogMutations() {
  const client = useQueryClient();
  const settle = async (message: string) => {
    toast.success(message);
    await Promise.all([
      client.invalidateQueries({ queryKey: ["departments"] }),
      client.invalidateQueries({ queryKey: ["categories"] }),
      revalidateCatalog().catch(() => undefined),
    ]);
  };

  return {
    createDepartment: useMutation({
      mutationFn: (input: DepartmentInput) => api.post<Department>("/departments", input),
      onSuccess: () => settle("Department created"),
    }),
    updateDepartment: useMutation({
      mutationFn: ({ id, ...input }: DepartmentInput & { id: string }) =>
        api.patch<Department>(`/departments/${id}`, input),
      onSuccess: () => settle("Department updated"),
    }),
    deleteDepartment: useMutation({
      mutationFn: (id: string) => api.delete<null>(`/departments/${id}`),
      onSuccess: () => settle("Department removed"),
    }),
    createCategory: useMutation({
      mutationFn: (input: CategoryInput) => api.post<Category>("/categories", input),
      onSuccess: () => settle("Category created"),
    }),
    updateCategory: useMutation({
      mutationFn: ({ id, ...input }: Partial<CategoryInput> & { id: string }) =>
        api.patch<Category>(`/categories/${id}`, input),
      onSuccess: () => settle("Category updated"),
    }),
    deleteCategory: useMutation({
      mutationFn: (id: string) => api.delete<null>(`/categories/${id}`),
      onSuccess: () => settle("Category removed"),
    }),
  };
}
