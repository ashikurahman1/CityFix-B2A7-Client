import "server-only";
import { NextResponse } from "next/server";
import { API_URL } from "@/lib/config";

/** Forwards the API's JSON body and status unchanged. */
export async function relay(res: Response): Promise<NextResponse> {
  const text = await res.text();
  return new NextResponse(text || null, {
    status: res.status,
    headers: { "Content-Type": res.headers.get("content-type") ?? "application/json" },
  });
}

export function apiError(status: number, message: string, extra: Record<string, unknown> = {}) {
  return NextResponse.json({ success: false, message, ...extra }, { status });
}

/** POST JSON to the API from a route handler. Network failures become a 502. */
export async function postJson(path: string, body: unknown, init: { token?: string; userAgent?: string | null } = {}) {
  return fetch(`${API_URL}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(init.token ? { Authorization: `Bearer ${init.token}` } : {}),
      ...(init.userAgent ? { "User-Agent": init.userAgent } : {}),
    },
    body: JSON.stringify(body),
    cache: "no-store",
  });
}
