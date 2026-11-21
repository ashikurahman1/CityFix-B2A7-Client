import { z } from "zod";

/** Field rules mirrored from the API's Zod schemas so the browser rejects what the server would. */

export const emailField = z.string().trim().toLowerCase().pipe(z.email("Enter a valid email address"));

export const passwordField = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(72, "Password must be at most 72 characters")
  .regex(/[A-Za-z]/, "Password must contain a letter")
  .regex(/[0-9]/, "Password must contain a number");

export const phoneField = z
  .string()
  .trim()
  .regex(/^\+?[0-9]{7,15}$/, "Use 7–15 digits, optionally starting with +");

/** Tracking codes look like CF-261116-ABC123. */
export const trackingCodeField = z
  .string()
  .trim()
  .toUpperCase()
  .regex(/^CF-\d{6}-[A-Z0-9]{6}$/, "Tracking codes look like CF-261116-ABC123");

/** Empty input → undefined, so optional fields are left out of the request body. */
export const optionalText = (max: number, message?: string) =>
  z
    .string()
    .trim()
    .max(max, message ?? `Must be at most ${max} characters`)
    .transform((v) => (v === "" ? undefined : v));

export const trackSchema = z.object({ code: trackingCodeField });
export type TrackInput = z.input<typeof trackSchema>;
