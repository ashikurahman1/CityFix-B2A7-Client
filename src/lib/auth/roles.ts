import type { Role } from "@/types/api";

/** Landing page of each role after login. */
export const ROLE_HOME: Record<Role, string> = {
  CITIZEN: "/dashboard",
  STAFF: "/staff",
  ADMIN: "/admin",
};

export const ROLE_LABEL: Record<Role, string> = {
  CITIZEN: "Citizen",
  STAFF: "Department Staff",
  ADMIN: "City Admin",
};

/** Route prefixes and the single role allowed in each. Enforced by src/proxy.ts. */
export const PROTECTED_PREFIXES: { prefix: string; role: Role }[] = [
  { prefix: "/dashboard", role: "CITIZEN" },
  { prefix: "/staff", role: "STAFF" },
  { prefix: "/admin", role: "ADMIN" },
];

export function requiredRoleFor(pathname: string): Role | null {
  const match = PROTECTED_PREFIXES.find(
    ({ prefix }) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
  return match?.role ?? null;
}

export const isRole = (value: unknown): value is Role =>
  value === "CITIZEN" || value === "STAFF" || value === "ADMIN";

/** Only same-origin relative paths are allowed as post-login redirects (no open redirects). */
export function safeRedirect(target: string | null | undefined, role: Role): string {
  if (!target || !target.startsWith("/") || target.startsWith("//")) return ROLE_HOME[role];
  const needed = requiredRoleFor(target);
  return needed && needed !== role ? ROLE_HOME[role] : target;
}
