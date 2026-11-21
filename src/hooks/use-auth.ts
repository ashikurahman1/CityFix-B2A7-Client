"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { api, ApiError, authRequest } from "@/lib/api/client";
import { ROLE_HOME, safeRedirect } from "@/lib/auth/roles";
import { qk } from "@/lib/query-keys";
import type { Me, User } from "@/types/api";

/** Current user, or null when signed out. Shared by navbar, sidebars and guards. */
export function useMe() {
  return useQuery({
    queryKey: qk.me,
    queryFn: async ({ signal }) => {
      try {
        return await api.get<Me>("/users/me", undefined, signal);
      } catch (err) {
        if (err instanceof ApiError && err.status === 401) return null;
        throw err;
      }
    },
    staleTime: 60_000,
    meta: { silent: true },
  });
}

export interface LoginInput {
  email: string;
  password: string;
}

/** Logs in, primes the cache and navigates to the role's dashboard (or `next`). */
export function useLogin(next?: string | null) {
  const client = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (input: LoginInput) => authRequest<{ user: User }>("login", input),
    meta: { silent: true },
    onSuccess: ({ data }) => {
      client.clear();
      toast.success(`Welcome back, ${data.user.name.split(" ")[0]}!`);
      router.replace(safeRedirect(next, data.user.role));
    },
  });
}

export function useRegister() {
  const client = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (input: Record<string, unknown>) => authRequest<{ user: User }>("register", input),
    meta: { silent: true },
    onSuccess: ({ data }) => {
      client.clear();
      toast.success("Account created. Welcome to CityFix!");
      router.replace(ROLE_HOME[data.user.role]);
    },
  });
}

export function useLogout() {
  const client = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: () => authRequest<null>("logout"),
    onSettled: () => {
      client.clear();
      client.setQueryData(qk.me, null);
      toast.success("You have been signed out");
      router.replace("/login");
    },
  });
}
