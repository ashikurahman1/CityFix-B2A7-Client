import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { PaymentBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { formatDateTime, formatMoney } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Payment } from "@/types/api";

interface PaymentResultProps {
  icon: LucideIcon;
  tone: "success" | "warning" | "danger";
  title: string;
  description: string;
  payment?: Payment;
  primary: { href: string; label: string };
  secondary?: { href: string; label: string };
}

const toneClass = {
  success: "bg-success/12 text-success",
  warning: "bg-warning/15 text-[color-mix(in_oklch,var(--warning)_70%,var(--foreground))]",
  danger: "bg-destructive/10 text-destructive",
};

/** Server-rendered receipt card for the Stripe success / cancel redirects. */
export function PaymentResult({ icon: Icon, tone, title, description, payment, primary, secondary }: PaymentResultProps) {
  return (
    <div className="mx-auto w-full max-w-lg rounded-3xl border bg-card p-8 text-center shadow-sm">
      <div className={cn("mx-auto flex size-16 items-center justify-center rounded-2xl", toneClass[tone])}>
        <Icon className="size-8" aria-hidden="true" />
      </div>
      <h1 className="mt-5 text-2xl font-semibold sm:text-3xl">{title}</h1>
      <p className="mt-2 text-muted-foreground">{description}</p>

      {payment ? (
        <dl className="mt-6 grid gap-3 rounded-2xl bg-muted/50 p-5 text-left text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">Request</dt>
            <dd className="text-right font-medium">{payment.complaint.title}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">Tracking code</dt>
            <dd className="font-mono">{payment.complaint.trackingCode}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">Amount</dt>
            <dd className="font-semibold">{formatMoney(payment.amount, payment.currency)}</dd>
          </div>
          <div className="flex items-center justify-between gap-4">
            <dt className="text-muted-foreground">Status</dt>
            <dd>
              <PaymentBadge status={payment.status} />
            </dd>
          </div>
          {payment.paidAt ? (
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Paid at</dt>
              <dd>{formatDateTime(payment.paidAt)}</dd>
            </div>
          ) : null}
        </dl>
      ) : null}

      <div className="mt-7 flex flex-col justify-center gap-2 sm:flex-row">
        <Button asChild size="lg">
          <Link href={primary.href}>{primary.label}</Link>
        </Button>
        {secondary ? (
          <Button asChild size="lg" variant="outline">
            <Link href={secondary.href}>{secondary.label}</Link>
          </Button>
        ) : null}
      </div>
    </div>
  );
}
