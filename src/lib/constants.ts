import type { ComplaintStatus, PaymentStatus, Priority, Role } from "@/types/api";

type Tone = "neutral" | "info" | "primary" | "warning" | "success" | "danger" | "muted";

export const TONE_CLASS: Record<Tone, string> = {
  neutral: "bg-secondary text-secondary-foreground border-border",
  info: "bg-info/12 text-info border-info/25",
  primary: "bg-primary/12 text-primary border-primary/25",
  warning: "bg-warning/15 text-[color-mix(in_oklch,var(--warning)_70%,var(--foreground))] border-warning/30",
  success: "bg-success/12 text-success border-success/25",
  danger: "bg-destructive/10 text-destructive border-destructive/25",
  muted: "bg-muted text-muted-foreground border-border",
};

export const STATUS_META: Record<ComplaintStatus, { label: string; tone: Tone; description: string }> = {
  PENDING_PAYMENT: { label: "Awaiting payment", tone: "warning", description: "Service fee must be paid first" },
  SUBMITTED: { label: "Submitted", tone: "info", description: "Routed to the department queue" },
  ASSIGNED: { label: "Assigned", tone: "primary", description: "A staff member owns the request" },
  IN_PROGRESS: { label: "In progress", tone: "primary", description: "Work is under way" },
  RESOLVED: { label: "Resolved", tone: "success", description: "Waiting for citizen feedback" },
  CLOSED: { label: "Closed", tone: "muted", description: "Completed and rated" },
  REOPENED: { label: "Reopened", tone: "warning", description: "Citizen reported it is not fixed" },
  REJECTED: { label: "Rejected", tone: "danger", description: "Declined by the city" },
  CANCELLED: { label: "Cancelled", tone: "muted", description: "Withdrawn by the citizen" },
};

export const ALL_STATUSES = Object.keys(STATUS_META) as ComplaintStatus[];

export const PRIORITY_META: Record<Priority, { label: string; tone: Tone; factor: number }> = {
  LOW: { label: "Low", tone: "muted", factor: 1.5 },
  MEDIUM: { label: "Medium", tone: "info", factor: 1 },
  HIGH: { label: "High", tone: "warning", factor: 0.5 },
  URGENT: { label: "Urgent", tone: "danger", factor: 0.25 },
};

export const ALL_PRIORITIES: Priority[] = ["LOW", "MEDIUM", "HIGH", "URGENT"];

export const PAYMENT_META: Record<PaymentStatus, { label: string; tone: Tone }> = {
  PENDING: { label: "Pending", tone: "warning" },
  PAID: { label: "Paid", tone: "success" },
  FAILED: { label: "Failed", tone: "danger" },
  CANCELLED: { label: "Cancelled", tone: "muted" },
  EXPIRED: { label: "Expired", tone: "muted" },
  REFUNDED: { label: "Refunded", tone: "info" },
};

export const ALL_PAYMENT_STATUSES = Object.keys(PAYMENT_META) as PaymentStatus[];

export const ROLE_TONE: Record<Role, Tone> = { CITIZEN: "info", STAFF: "primary", ADMIN: "warning" };

/** Statuses where the SLA clock is running. */
export const OPEN_STATUSES: ComplaintStatus[] = ["SUBMITTED", "ASSIGNED", "IN_PROGRESS", "REOPENED"];

/** Status transitions mirrored from the API (complaint.service.ts). */
export const STAFF_TRANSITIONS: Partial<Record<ComplaintStatus, ComplaintStatus[]>> = {
  ASSIGNED: ["IN_PROGRESS"],
  REOPENED: ["IN_PROGRESS"],
  IN_PROGRESS: ["RESOLVED"],
};

export const ADMIN_TRANSITIONS: Partial<Record<ComplaintStatus, ComplaintStatus[]>> = {
  SUBMITTED: ["REJECTED"],
  ASSIGNED: ["IN_PROGRESS", "REJECTED"],
  REOPENED: ["IN_PROGRESS", "REJECTED"],
  IN_PROGRESS: ["RESOLVED"],
  RESOLVED: ["CLOSED"],
};

export const REOPEN_WINDOW_DAYS = 7;
export const MAX_ATTACHMENTS = 5;
export const MAX_FILE_BYTES = 5 * 1024 * 1024;
export const ALLOWED_FILE_TYPES = ["image/jpeg", "image/png", "image/webp", "application/pdf"];

/** Demo accounts seeded by the API (prisma/seed.ts). */
export const DEMO_ACCOUNTS: { role: Role; label: string; email: string; password: string; blurb: string }[] = [
  {
    role: "ADMIN",
    label: "City Admin",
    email: "admin@cityfix.com",
    password: "Admin@12345",
    blurb: "Analytics, assignment, users, refunds",
  },
  {
    role: "CITIZEN",
    label: "Citizen",
    email: "citizen@cityfix.com",
    password: "Demo@12345",
    blurb: "File complaints, pay fees, give feedback",
  },
  {
    role: "STAFF",
    label: "Department Staff",
    email: "staff.roads@cityfix.com",
    password: "Demo@12345",
    blurb: "Roads queue: claim and resolve work",
  },
];
