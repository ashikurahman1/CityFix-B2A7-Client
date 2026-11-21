import { z } from "zod";
import { emailField, optionalText, passwordField, phoneField } from "./common";

export const loginSchema = z.object({
  email: emailField,
  password: z.string().min(1, "Password is required"),
});
export type LoginValues = z.input<typeof loginSchema>;

export const registerSchema = z
  .object({
    name: z.string().trim().min(2, "Name must be at least 2 characters").max(80, "Name is too long"),
    email: emailField,
    phone: z.union([z.literal(""), phoneField]).transform((v) => (v === "" ? undefined : v)),
    address: optionalText(255),
    password: passwordField,
    confirmPassword: z.string(),
    terms: z.boolean().refine((v) => v, "Please accept the terms to continue"),
  })
  .refine((v) => v.password === v.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });
export type RegisterValues = z.input<typeof registerSchema>;
export type RegisterOutput = z.output<typeof registerSchema>;

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Enter your current password"),
    newPassword: passwordField,
    confirmPassword: z.string(),
  })
  .refine((v) => v.newPassword === v.confirmPassword, { path: ["confirmPassword"], message: "Passwords do not match" })
  .refine((v) => v.currentPassword !== v.newPassword, {
    path: ["newPassword"],
    message: "New password must be different from the current password",
  });
export type ChangePasswordValues = z.input<typeof changePasswordSchema>;
