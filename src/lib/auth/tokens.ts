import { decodeJwt, jwtVerify } from "jose";
import type { NextResponse } from "next/server";
import { API_URL, COOKIES, REFRESH_MAX_AGE } from "@/lib/config";
import { isRole } from "@/lib/auth/roles";
import type { ApiSuccess, AuthPayload, Role } from "@/types/api";

/**
 * Token helpers shared by proxy.ts and the route handlers. Runs on the server only:
 * no `server-only` import because proxy.ts must be able to bundle it too.
 */

export interface SessionClaims {
  userId: string;
  role: Role;
  exp: number;
}

const accessSecret = process.env.JWT_ACCESS_SECRET
  ? new TextEncoder().encode(process.env.JWT_ACCESS_SECRET)
  : null;

/**
 * Reads the role from the access token. When JWT_ACCESS_SECRET is configured the signature is
 * verified, so a forged cookie cannot unlock another role's UI. Without it the token is only
 * decoded (the API still rejects anything it did not sign).
 */
export async function readAccessToken(token: string | undefined): Promise<SessionClaims | null> {
  if (!token) return null;
  try {
    const payload = accessSecret ? (await jwtVerify(token, accessSecret)).payload : decodeJwt(token);
    const { sub, role, exp, type } = payload as { sub?: string; role?: unknown; exp?: number; type?: string };
    if (!sub || !isRole(role) || !exp || type !== "access") return null;
    if (exp * 1000 <= Date.now()) return null;
    return { userId: sub, role, exp };
  } catch {
    return null;
  }
}

/** Seconds until the token expires, minus a safety margin so we refresh a little early. */
function accessMaxAge(token: string): number {
  try {
    const { exp } = decodeJwt(token);
    if (!exp) return 60 * 14;
    return Math.max(30, exp - Math.floor(Date.now() / 1000) - 30);
  } catch {
    return 60 * 14;
  }
}

const baseCookie = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
};

export function setAuthCookies(res: NextResponse, tokens: Pick<AuthPayload, "accessToken" | "refreshToken">) {
  res.cookies.set(COOKIES.access, tokens.accessToken, { ...baseCookie, maxAge: accessMaxAge(tokens.accessToken) });
  res.cookies.set(COOKIES.refresh, tokens.refreshToken, { ...baseCookie, maxAge: REFRESH_MAX_AGE });
}

export function clearAuthCookies(res: NextResponse) {
  res.cookies.set(COOKIES.access, "", { ...baseCookie, maxAge: 0 });
  res.cookies.set(COOKIES.refresh, "", { ...baseCookie, maxAge: 0 });
}

/** Rotates the refresh token with the API. Returns null when the session is gone. */
export async function refreshTokens(refreshToken: string, userAgent?: string | null): Promise<AuthPayload | null> {
  try {
    const res = await fetch(`${API_URL}/auth/refresh-token`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...(userAgent ? { "User-Agent": userAgent } : {}) },
      body: JSON.stringify({ refreshToken }),
      cache: "no-store",
    });
    if (!res.ok) return null;
    const body = (await res.json()) as ApiSuccess<AuthPayload>;
    return body.data;
  } catch {
    return null;
  }
}
