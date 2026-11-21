import type { FieldValues, Path, UseFormSetError } from "react-hook-form";
import { ApiError } from "@/lib/api/client";

/**
 * Maps the API's `errors: [{ path, message }]` onto form fields so server-side validation
 * (e.g. "Email is already in use") shows next to the right input. Returns true when at least
 * one field error was applied.
 */
export function applyServerErrors<T extends FieldValues>(
  err: unknown,
  setError: UseFormSetError<T>,
  fields: readonly Path<T>[],
): boolean {
  if (!(err instanceof ApiError)) return false;
  let applied = false;
  for (const e of err.errors) {
    if (e.path && (fields as readonly string[]).includes(e.path)) {
      setError(e.path as Path<T>, { type: "server", message: e.message }, { shouldFocus: !applied });
      applied = true;
    }
  }
  return applied;
}
