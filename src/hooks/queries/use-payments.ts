"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api, type QueryParams } from "@/lib/api/client";
import { qk } from "@/lib/query-keys";
import type { Payment } from "@/types/api";

export function usePayments(params: QueryParams) {
  return useQuery({
    queryKey: qk.payments.list(params),
    queryFn: ({ signal }) => api.list<Payment>("/payments", params, signal),
    placeholderData: keepPreviousData,
  });
}

/** Creates (or re-opens) a Stripe Checkout Session and sends the browser to Stripe. */
export function useStartCheckout() {
  return useMutation({
    mutationFn: (complaintId: string) => api.post<Payment>("/payments/initiate", { complaintId }),
    onSuccess: ({ data }) => {
      if (!data.checkoutUrl) {
        toast.error("Stripe did not return a checkout page. Please try again.");
        return;
      }
      toast.loading("Redirecting to secure Stripe checkout…");
      window.location.assign(data.checkoutUrl);
    },
  });
}

/** Re-syncs a payment with Stripe (useful if a webhook was missed). */
export function useVerifyPayment() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (paymentId: string) => api.post<Payment>(`/payments/${paymentId}/verify`),
    onSuccess: ({ data }) => {
      toast.success(`Payment status: ${data.status.toLowerCase()}`);
      void client.invalidateQueries({ queryKey: qk.payments.all });
      void client.invalidateQueries({ queryKey: qk.complaints.all });
    },
  });
}

export function useRefundPayment() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => api.post<Payment>(`/payments/${id}/refund`, { reason }),
    onSuccess: () => {
      toast.success("Refund issued through Stripe");
      void client.invalidateQueries({ queryKey: qk.payments.all });
      void client.invalidateQueries({ queryKey: qk.complaints.all });
      void client.invalidateQueries({ queryKey: qk.admin.stats });
    },
  });
}
