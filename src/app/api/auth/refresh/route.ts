import { type NextRequest, NextResponse } from "next/server";
import { apiError } from "@/lib/api/upstream";
import { COOKIES } from "@/lib/config";
import { clearAuthCookies, refreshTokens, setAuthCookies } from "@/lib/auth/tokens";

/**
 * Rotates the session. The browser calls this through a single-flight promise
 * (src/lib/api/client.ts), because the API treats a replayed refresh token as theft.
 */
export async function POST(request: NextRequest) {
  const refreshToken = request.cookies.get(COOKIES.refresh)?.value;
  if (!refreshToken) return apiError(401, "Your session has ended. Please log in again");

  const tokens = await refreshTokens(refreshToken, request.headers.get("user-agent"));
  if (!tokens) {
    const res = apiError(401, "Your session has ended. Please log in again");
    clearAuthCookies(res);
    return res;
  }

  const res = NextResponse.json({ success: true, message: "Session refreshed", data: { user: tokens.user } });
  setAuthCookies(res, tokens);
  return res;
}
