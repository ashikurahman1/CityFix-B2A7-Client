import "server-only";
import { API_URL } from "@/lib/config";
import type { ApiSuccess, Payment } from "@/types/api";

export type SessionOutcome = { ok: true; payment: Payment; message: string } | { ok: false; status: number; message: string };

/**
 * Stripe redirected the browser here with ?session_id=. The API re-fetches the session from
 * Stripe (it never trusts the query string) and settles the payment idempotently.
 * Never cached: every call must reflect Stripe's current state.
 */
export async function settleCheckoutSession(kind: "success" | "cancel", sessionId: string): Promise<SessionOutcome> {
  try {
    const res = await fetch(`${API_URL}/payments/${kind}?session_id=${encodeURIComponent(sessionId)}`, {
      cache: "no-store",
    });
    const body = (await res.json()) as ApiSuccess<Payment> | { success: false; message: string };
    if (!res.ok || body.success === false) {
      return { ok: false, status: res.status, message: body.message };
    }
    return { ok: true, payment: body.data, message: body.message };
  } catch {
    return { ok: false, status: 502, message: "We couldn't reach the payment service to confirm this checkout." };
  }
}
