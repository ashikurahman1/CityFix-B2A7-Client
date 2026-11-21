"use server";

import { updateTag } from "next/cache";
import { cookies } from "next/headers";
import { COOKIES } from "@/lib/config";
import { readAccessToken } from "@/lib/auth/tokens";

/**
 * Server Action called after an admin edits departments or categories, so the cached public
 * pages (home, services, about, contact) show the change on the next request.
 */
export async function revalidateCatalog() {
  const claims = await readAccessToken((await cookies()).get(COOKIES.access)?.value);
  if (claims?.role !== "ADMIN") return { ok: false };
  updateTag("catalog");
  return { ok: true };
}

/** Called after workflow changes that move the public transparency numbers. */
export async function revalidateStats() {
  const claims = await readAccessToken((await cookies()).get(COOKIES.access)?.value);
  if (!claims) return { ok: false };
  updateTag("stats");
  return { ok: true };
}
