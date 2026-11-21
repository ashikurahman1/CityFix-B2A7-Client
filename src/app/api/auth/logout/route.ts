import { type NextRequest, NextResponse } from "next/server";
import { postJson } from "@/lib/api/upstream";
import { COOKIES } from "@/lib/config";
import { clearAuthCookies } from "@/lib/auth/tokens";

/** Revokes the refresh token on the API (best effort) and always clears the cookies. */
export async function POST(request: NextRequest) {
  const accessToken = request.cookies.get(COOKIES.access)?.value;
  const refreshToken = request.cookies.get(COOKIES.refresh)?.value;

  if (accessToken && refreshToken) {
    await postJson("/auth/logout", { refreshToken }, { token: accessToken }).catch(() => undefined);
  }

  const res = NextResponse.json({ success: true, message: "Logged out successfully", data: null });
  clearAuthCookies(res);
  return res;
}
