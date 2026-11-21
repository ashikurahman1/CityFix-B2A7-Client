import { CheckCircle2, CircleSlash, XCircle } from "lucide-react";
import type { Metadata } from "next";
import { Suspense } from "react";
import { PaymentResult } from "@/components/payments/payment-result";
import { Skeleton } from "@/components/ui/skeleton";
import { settleCheckoutSession } from "@/lib/api/payments-server";

export const metadata: Metadata = {
  title: "Payment cancelled",
  description: "Your CityFix checkout was not completed.",
  robots: { index: false },
};

async function Cancel({ searchParams }: { searchParams: PageProps<"/payment/cancel">["searchParams"] }) {
  const sessionId = (await searchParams).session_id;
  if (typeof sessionId !== "string" || sessionId.length < 10) {
    return (
      <PaymentResult
        icon={CircleSlash}
        tone="warning"
        title="Checkout not completed"
        description="No payment was taken. You can start the checkout again from your request."
        primary={{ href: "/dashboard/requests?status=PENDING_PAYMENT", label: "Requests awaiting payment" }}
      />
    );
  }

  const outcome = await settleCheckoutSession("cancel", sessionId);
  if (!outcome.ok) {
    return (
      <PaymentResult
        icon={XCircle}
        tone="danger"
        title="Checkout status unknown"
        description={`${outcome.message}. No further action is needed if you did not pay.`}
        primary={{ href: "/dashboard/payments", label: "Check my payments" }}
      />
    );
  }

  const { payment } = outcome;
  // Paid in another tab before backing out: the API honours the payment.
  if (payment.status === "PAID") {
    return (
      <PaymentResult
        icon={CheckCircle2}
        tone="success"
        title="This payment already went through"
        description="Stripe confirmed the payment, so your request has been submitted."
        payment={payment}
        primary={{ href: `/dashboard/requests/${payment.complaint.id}`, label: "View request" }}
      />
    );
  }

  return (
    <PaymentResult
      icon={CircleSlash}
      tone="warning"
      title="Payment cancelled"
      description="No money was taken. Your request is saved and stays in “Awaiting payment” until you pay."
      payment={payment}
      primary={{ href: `/dashboard/requests/${payment.complaint.id}`, label: "Try paying again" }}
      secondary={{ href: "/dashboard", label: "Back to dashboard" }}
    />
  );
}

export default function PaymentCancelPage(props: PageProps<"/payment/cancel">) {
  return (
    <section className="bg-grid flex flex-1 items-center px-4 py-16">
      <Suspense fallback={<Skeleton className="mx-auto h-[460px] w-full max-w-lg rounded-3xl" />}>
        <Cancel searchParams={props.searchParams} />
      </Suspense>
    </section>
  );
}
