import { z } from "zod";
import { optionalText } from "./common";

/** Mirrors complaint.validation.ts on the API. */

const coordinate = (min: number, max: number, label: string) =>
  z
    .string()
    .trim()
    .refine((v) => v === "" || (!Number.isNaN(Number(v)) && Number(v) >= min && Number(v) <= max), {
      message: `${label} must be a number between ${min} and ${max}`,
    });

export const priorityField = z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]);

// ── Wizard steps ──
export const categoryStepSchema = z.object({
  categoryId: z.string().min(1, "Choose what you want to report"),
});

export const detailsStepSchema = z.object({
  title: z.string().trim().min(5, "Title must be at least 5 characters").max(150, "Title is too long"),
  description: z
    .string()
    .trim()
    .min(10, "Describe the problem in at least 10 characters")
    .max(2000, "Description is too long"),
  priority: priorityField,
});

const locationBase = z.object({
  address: z.string().trim().min(5, "Address must be at least 5 characters").max(255),
  ward: z.string().trim().max(50, "Ward must be at most 50 characters"),
  latitude: coordinate(-90, 90, "Latitude"),
  longitude: coordinate(-180, 180, "Longitude"),
});

const coordinatesTogether = (v: { latitude: string; longitude: string }) =>
  (v.latitude.trim() === "") === (v.longitude.trim() === "");

export const locationStepSchema = locationBase.refine(coordinatesTogether, {
  path: ["longitude"],
  message: "Provide both latitude and longitude, or neither",
});

export const WIZARD_STEPS = [
  { id: "category", title: "Category", schema: categoryStepSchema },
  { id: "details", title: "Details", schema: detailsStepSchema },
  { id: "location", title: "Location", schema: locationStepSchema },
  { id: "review", title: "Review", schema: null },
] as const;

export const createComplaintSchema = categoryStepSchema
  .extend(detailsStepSchema.shape)
  .extend(locationBase.shape)
  .refine(coordinatesTogether, { path: ["longitude"], message: "Provide both latitude and longitude, or neither" });

export type CreateComplaintValues = z.input<typeof createComplaintSchema>;

// ── Edit (citizen, before assignment) ──
export const editComplaintSchema = z
  .object({
    title: detailsStepSchema.shape.title,
    description: detailsStepSchema.shape.description,
  })
  .extend(locationBase.shape)
  .refine(coordinatesTogether, { path: ["longitude"], message: "Provide both latitude and longitude, or neither" });
export type EditComplaintValues = z.input<typeof editComplaintSchema>;

// ── Workflow dialogs ──
export const requiredReasonSchema = z.object({
  reason: z.string().trim().min(5, "Please give at least 5 characters").max(500, "Keep it under 500 characters"),
});
export const optionalReasonSchema = z.object({ reason: optionalText(500) });

export const resolutionNoteSchema = z.object({
  note: z.string().trim().min(5, "A note of at least 5 characters is required").max(1000),
});

export const feedbackSchema = z.object({
  rating: z.number().int().min(1, "Choose a rating from 1 to 5").max(5),
  comment: optionalText(1000),
});
export type FeedbackValues = z.input<typeof feedbackSchema>;

export const commentSchema = z.object({
  body: z.string().trim().min(1, "Write something first").max(1000, "Comments are limited to 1000 characters"),
  isInternal: z.boolean(),
});
export type CommentValues = z.input<typeof commentSchema>;

export const assignSchema = z.object({
  staffId: z.string().min(1, "Choose a staff member"),
  note: optionalText(500),
});
export type AssignValues = z.input<typeof assignSchema>;
