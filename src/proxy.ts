import { type NextRequest, NextResponse } from "next/server";
import { COOKIES } from "@/lib/config";
import { ROLE_HOME, requiredRoleFor } from "@/lib/auth/roles";
import { clearAuthCookies, readAccessToken, refreshTokens, setAuthCookies } from "@/lib/auth/tokens";

/**
 * Route-level authorization (Next.js 16 "proxy", formerly middleware).
 *
 *  - /dashboard/** → CITIZEN, /staff/** → STAFF, /admin/** → ADMIN
 *  - an expired access token is silently rotated with the refresh token
 *  - signed-in users visiting /login or /register go straight to their dashboard
 *
 * The API enforces the same rules again, so this layer is about UX and not leaking UI.
 */
export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const neededRole = requiredRoleFor(pathname);

  let claims = await readAccessToken(request.cookies.get(COOKIES.access)?.value);
  let rotated: Awaited<ReturnType<typeof refreshTokens>> = null;

  if (!claims && neededRole) {
    const refreshToken = request.cookies.get(COOKIES.refresh)?.value;
    if (refreshToken) {
      rotated = await refreshTokens(refreshToken, request.headers.get("user-agent"));
      if (rotated) {
        claims = await readAccessToken(rotated.accessToken);
        // Make the fresh tokens visible to route handlers / server components in this request.
        request.cookies.set(COOKIES.access, rotated.accessToken);
        request.cookies.set(COOKIES.refresh, rotated.refreshToken);
      }
    }
  }

  // Auth pages: bounce signed-in users to their home. Link prefetches are let through so the
  // router doesn't cache a redirect for /login that would still apply after logging out.
  if (!neededRole) {
    const isPrefetch = request.headers.has("next-router-prefetch") || request.headers.get("purpose") === "prefetch";
    if (claims && !isPrefetch) return NextResponse.redirect(new URL(ROLE_HOME[claims.role], request.url));
    return NextResponse.next();
  }

  if (!claims) {
    const login = new URL("/login", request.url);
    login.searchParams.set("next", `${pathname}${search}`);
    const res = NextResponse.redirect(login);
    clearAuthCookies(res);
    return res;
  }

  if (claims.role !== neededRole) {
    const res = NextResponse.redirect(new URL(ROLE_HOME[claims.role], request.url));
    if (rotated) setAuthCookies(res, rotated);
    return res;
  }

  const res = NextResponse.next({ request: { headers: request.headers } });
  if (rotated) setAuthCookies(res, rotated);
  return res;
}

export const config = {
  matcher: ["/dashboard/:path*", "/staff/:path*", "/admin/:path*", "/login", "/register"],
};
