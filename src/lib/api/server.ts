import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { API_URL } from "@/lib/config";
import type { ApiSuccess, Category, Department, PublicStats, TrackResult } from "@/types/api";

/**
 * Server-side reads of PUBLIC API data, used by Server Components. Cached with `use cache` so the
 * marketing pages prerender into the static shell; admin mutations call updateTag("catalog").
 */

async function getJson<T>(path: string): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, { headers: { Accept: "application/json" } });
  if (!res.ok) throw new Error(`CityFix API ${path} answered ${res.status}`);
  const body = (await res.json()) as ApiSuccess<T>;
  return body.data;
}

export async function getCategories(): Promise<Category[]> {
  "use cache";
  cacheLife("minutes");
  cacheTag("catalog");
  return getJson<Category[]>("/categories").catch(() => []);
}

export async function getDepartments(): Promise<Department[]> {
  "use cache";
  cacheLife("minutes");
  cacheTag("catalog");
  return getJson<Department[]>("/departments").catch(() => []);
}

export async function getPublicStats(): Promise<PublicStats | null> {
  "use cache";
  cacheLife("minutes");
  cacheTag("stats");
  return getJson<PublicStats>("/stats/public").catch(() => null);
}

export type TrackOutcome = { ok: true; data: TrackResult } | { ok: false; status: number; message: string };

/** Anonymous tracking by code. Short-lived cache: statuses change during the day. */
export async function trackRequest(code: string): Promise<TrackOutcome> {
  "use cache";
  cacheLife("seconds");
  try {
    const res = await fetch(`${API_URL}/complaints/track/${encodeURIComponent(code)}`);
    const body = (await res.json()) as ApiSuccess<TrackResult> | { success: false; message: string };
    if (!res.ok || body.success === false) {
      return { ok: false, status: res.status, message: body.success === false ? body.message : "Not found" };
    }
    return { ok: true, data: body.data };
  } catch {
    return { ok: false, status: 502, message: "The tracking service is not reachable right now" };
  }
}
