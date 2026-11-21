"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo, useTransition } from "react";

/**
 * Filters, sorting, search and pagination live in the URL (?page=2&status=RESOLVED) so every
 * view can be bookmarked and shared. Changing a filter resets the page to 1.
 */
export function useUrlState<K extends string>(keys: readonly K[], defaults: Partial<Record<K, string>> = {}) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const keyList = keys.join("|");
  const values = useMemo(() => {
    const out = {} as Record<K, string | undefined>;
    for (const key of keys) out[key] = searchParams.get(key) ?? defaults[key];
    return out;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, keyList]);

  const page = Math.max(1, Number(searchParams.get("page") ?? 1) || 1);

  const update = useCallback(
    (patch: Partial<Record<K | "page", string | number | null | undefined>>) => {
      const next = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(patch)) {
        if (value === undefined || value === null || value === "" || value === defaults[key as K]) next.delete(key);
        else next.set(key, String(value));
      }
      if (!("page" in patch)) next.delete("page");
      if (next.get("page") === "1") next.delete("page");
      const qs = next.toString();
      startTransition(() => router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false }));
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [searchParams, pathname, router],
  );

  const reset = useCallback(() => {
    startTransition(() => router.replace(pathname, { scroll: false }));
  }, [pathname, router]);

  const activeCount = keys.filter((k) => searchParams.get(k)).length;

  const setPage = useCallback(
    (p: number) => update({ page: p } as Partial<Record<K | "page", string | number>>),
    [update],
  );

  return { values, page, update, setPage, reset, isPending, activeCount };
}
