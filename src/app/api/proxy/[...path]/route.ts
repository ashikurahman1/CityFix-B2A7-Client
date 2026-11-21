import type { NextRequest } from "next/server";
import { apiError, relay } from "@/lib/api/upstream";
import { API_URL, COOKIES } from "@/lib/config";

/**
 * Backend-for-frontend: the browser calls /api/proxy/<api path>, this handler attaches the
 * access token from the httpOnly cookie and forwards the request to the CityFix API.
 *
 * When the access token has expired but a refresh token exists it answers 401 TOKEN_EXPIRED,
 * and the client refreshes once (single flight) and retries.
 */
async function forward(request: NextRequest, ctx: RouteContext<"/api/proxy/[...path]">) {
  const { path } = await ctx.params;
  if (path.some((segment) => segment === ".." || segment === "." || segment.includes("\\"))) {
    return apiError(400, "Invalid API path");
  }

  const accessToken = request.cookies.get(COOKIES.access)?.value;
  const hasRefresh = Boolean(request.cookies.get(COOKIES.refresh)?.value);

  if (!accessToken && hasRefresh) {
    return apiError(401, "Access token expired", { code: "TOKEN_EXPIRED" });
  }
  // Anonymous profile lookups are common (public navbar): answer locally instead of hitting the API.
  if (!accessToken && path.join("/") === "users/me") {
    return apiError(401, "Not signed in", { code: "NO_SESSION" });
  }

  const target = `${API_URL}/${path.map(encodeURIComponent).join("/")}${request.nextUrl.search}`;
  const headers = new Headers();
  const contentType = request.headers.get("content-type");
  if (contentType) headers.set("Content-Type", contentType);
  if (accessToken) headers.set("Authorization", `Bearer ${accessToken}`);
  const userAgent = request.headers.get("user-agent");
  if (userAgent) headers.set("User-Agent", userAgent);

  const hasBody = request.method !== "GET" && request.method !== "HEAD";

  try {
    const upstream = await fetch(target, {
      method: request.method,
      headers,
      // Multipart uploads are streamed straight through to the API (Multer → Cloudinary).
      body: hasBody ? request.body : undefined,
      // @ts-expect-error -- `duplex` is required by undici for streamed bodies but missing from lib.dom
      duplex: hasBody ? "half" : undefined,
      cache: "no-store",
    });

    // Only JWT failures mean "refresh and retry"; other 401s (e.g. a wrong current password) pass through.
    if (upstream.status === 401 && accessToken && hasRefresh) {
      const body = (await upstream.clone().json().catch(() => null)) as { message?: string } | null;
      if (body?.message === "Token has expired" || body?.message === "Invalid token") {
        return apiError(401, "Access token expired", { code: "TOKEN_EXPIRED" });
      }
    }
    return relay(upstream);
  } catch {
    return apiError(502, "The CityFix API is not reachable. Please try again shortly");
  }
}

export const GET = forward;
export const POST = forward;
export const PATCH = forward;
export const PUT = forward;
export const DELETE = forward;
