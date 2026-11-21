import { type NextRequest, NextResponse } from "next/server";
import { apiError, postJson, relay } from "@/lib/api/upstream";
import { setAuthCookies } from "@/lib/auth/tokens";
import type { ApiSuccess, AuthPayload } from "@/types/api";

/** Registers a citizen; the API signs them in straight away. */
export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return apiError(400, "Invalid request body");
  }

  try {
    const upstream = await postJson("/auth/register", body, { userAgent: request.headers.get("user-agent") });
    if (!upstream.ok) return relay(upstream);

    const { data, message } = (await upstream.json()) as ApiSuccess<AuthPayload>;
    const res = NextResponse.json({ success: true, message, data: { user: data.user } }, { status: 201 });
    setAuthCookies(res, data);
    return res;
  } catch {
    return apiError(502, "The CityFix API is not reachable. Please try again shortly");
  }
}
