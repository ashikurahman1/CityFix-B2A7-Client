import { CheckCircle2, Clock, XCircle } from "lucide-react";
import type { Metadata } from "next";
import { Suspense } from "react";
import { PaymentResult } from "@/components/payments/payment-result";
import { Skeleton } from "@/components/ui/skeleton";
import { settleCheckoutSession } from "@/lib/api/payments-server";

export const metadata: Metadata = {
  title: "Payment successful",
  description: "Confirmation of your CityFix service fee payment.",
  robots: { index: false },
};

async function Verify({ searchParams }: { searchParams: PageProps<"/payment/success">["searchParams"] }) {
  const sessionId = (await searchParams).session_id;
  if (typeof sessionId !== "string" || sessionId.length < 10) {
    return (
      <PaymentResult
        icon={XCircle}
        tone="danger"
        title="Missing checkout reference"
        description="This page is opened by Stripe after a payment. We couldn't find a checkout session in the link."
        primary={{ href: "/dashboard/payments", label: "Go to my payments" }}
      />
    );
  }

  const outcome = await settleCheckoutSession("success", sessionId);
  if (!outcome.ok) {
    return (
      <PaymentResult
        icon={XCircle}
        tone="danger"
        title="We couldn't confirm this payment"
        description={`${outcome.message}. If you were charged, the payment is reconciled automatically by Stripe's webhook.`}
        primary={{ href: "/dashboard/payments", label: "Check my payments" }}
        secondary={{ href: "/dashboard", label: "Dashboard" }}
      />
    );
  }

  const { payment } = outcome;
  const paid = payment.status === "PAID";
  return (
    <PaymentResult
      icon={paid ? CheckCircle2 : Clock}
      tone={paid ? "success" : "warning"}
      title={paid ? "Payment successful" : "Payment is processing"}
      description={
        paid
          ? "Thank you! Your request has been sent to the department and its SLA clock has started."
          : `Stripe reports the payment as ${payment.status.toLowerCase()}. This page updates once it settles.`
      }
      payment={payment}
      primary={{ href: `/dashboard/requests/${payment.complaint.id}`, label: "View request" }}
      secondary={{ href: "/dashboard/payments", label: "Payment history" }}
    />
  );
}

export default function PaymentSuccessPage(props: PageProps<"/payment/success">) {
  return (
    <section className="bg-grid flex flex-1 items-center px-4 py-16">
      <Suspense fallback={<Skeleton className="mx-auto h-[460px] w-full max-w-lg rounded-3xl" />}>
        <Verify searchParams={props.searchParams} />
      </Suspense>
    </section>
  );
}
