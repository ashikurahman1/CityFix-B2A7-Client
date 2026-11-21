import { cn } from "@/lib/utils";
import { PAYMENT_META, PRIORITY_META, ROLE_TONE, STATUS_META, TONE_CLASS } from "@/lib/constants";
import { ROLE_LABEL } from "@/lib/auth/roles";
import type { ComplaintStatus, PaymentStatus, Priority, Role } from "@/types/api";

function Pill({ className, children, title }: { className: string; children: React.ReactNode; title?: string }) {
  return (
    <span
      title={title}
      className={cn(
        "inline-flex h-6 shrink-0 items-center gap-1.5 rounded-full border px-2.5 text-xs font-medium whitespace-nowrap",
        className,
      )}
    >
      {children}
    </span>
  );
}

export function StatusBadge({ status, className }: { status: ComplaintStatus; className?: string }) {
  const meta = STATUS_META[status];
  return (
    <Pill className={cn(TONE_CLASS[meta.tone], className)} title={meta.description}>
      <span className="size-1.5 rounded-full bg-current" aria-hidden="true" />
      {meta.label}
    </Pill>
  );
}

export function PriorityBadge({ priority, className }: { priority: Priority; className?: string }) {
  const meta = PRIORITY_META[priority];
  return <Pill className={cn(TONE_CLASS[meta.tone], className)}>{meta.label}</Pill>;
}

export function PaymentBadge({ status, className }: { status: PaymentStatus; className?: string }) {
  const meta = PAYMENT_META[status];
  return <Pill className={cn(TONE_CLASS[meta.tone], className)}>{meta.label}</Pill>;
}

export function RoleBadge({ role, className }: { role: Role; className?: string }) {
  return <Pill className={cn(TONE_CLASS[ROLE_TONE[role]], className)}>{ROLE_LABEL[role]}</Pill>;
}

export function TypeBadge({ type }: { type: "COMPLAINT" | "SERVICE" }) {
  return (
    <Pill className={type === "SERVICE" ? TONE_CLASS.warning : TONE_CLASS.neutral}>
      {type === "SERVICE" ? "Paid service" : "Complaint"}
    </Pill>
  );
}
