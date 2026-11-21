"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { revalidateStats } from "@/app/actions/revalidate";
import { api, type QueryParams, uploadWithProgress } from "@/lib/api/client";
import { qk } from "@/lib/query-keys";
import type {
  ApiSuccess,
  Attachment,
  Comment,
  ComplaintDetail,
  ComplaintListItem,
  ComplaintStatus,
  CreateComplaintResult,
  Me,
  Priority,
  TimelineEntry,
} from "@/types/api";

export function useComplaints(params: QueryParams, options: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: qk.complaints.list(params),
    queryFn: ({ signal }) => api.list<ComplaintListItem>("/complaints", params, signal),
    placeholderData: keepPreviousData,
    enabled: options.enabled,
  });
}

export function useComplaint(id: string) {
  return useQuery({
    queryKey: qk.complaints.detail(id),
    queryFn: ({ signal }) => api.get<ComplaintDetail>(`/complaints/${id}`, undefined, signal),
  });
}

export function useTimeline(id: string) {
  return useQuery({
    queryKey: qk.complaints.timeline(id),
    queryFn: ({ signal }) => api.get<TimelineEntry[]>(`/complaints/${id}/timeline`, undefined, signal),
  });
}

export function useComments(id: string) {
  return useQuery({
    queryKey: qk.complaints.comments(id),
    queryFn: ({ signal }) => api.get<Comment[]>(`/complaints/${id}/comments`, undefined, signal),
  });
}

export interface CreateComplaintBody {
  categoryId: string;
  title: string;
  description: string;
  priority: Priority;
  address: string;
  ward?: string;
  latitude?: number;
  longitude?: number;
}

export function useCreateComplaint() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateComplaintBody) => api.post<CreateComplaintResult>("/complaints", body),
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: qk.complaints.all });
      void client.invalidateQueries({ queryKey: qk.me });
      void revalidateStats().catch(() => undefined);
    },
  });
}

type Action =
  | { kind: "claim" }
  | { kind: "assign"; staffId: string; note?: string }
  | { kind: "status"; status: Extract<ComplaintStatus, "IN_PROGRESS" | "RESOLVED" | "REJECTED" | "CLOSED">; note?: string }
  | { kind: "cancel"; reason?: string }
  | { kind: "reopen"; reason: string }
  | { kind: "feedback"; rating: number; comment?: string }
  | { kind: "update"; body: Record<string, unknown> }
  | { kind: "delete" };

const SUCCESS: Record<Action["kind"], string> = {
  claim: "You now own this request",
  assign: "Request assigned",
  status: "Status updated",
  cancel: "Request cancelled",
  reopen: "Request reopened",
  feedback: "Thanks for your feedback — request closed",
  update: "Request updated",
  delete: "Request deleted",
};

function run(id: string, action: Action): Promise<ApiSuccess<ComplaintDetail | null>> {
  const base = `/complaints/${id}`;
  switch (action.kind) {
    case "claim":
      return api.post<ComplaintDetail>(`${base}/claim`);
    case "assign":
      return api.post<ComplaintDetail>(`${base}/assign`, { staffId: action.staffId, note: action.note });
    case "status":
      return api.patch<ComplaintDetail>(`${base}/status`, { status: action.status, note: action.note });
    case "cancel":
      return api.post<ComplaintDetail>(`${base}/cancel`, { reason: action.reason });
    case "reopen":
      return api.post<ComplaintDetail>(`${base}/reopen`, { reason: action.reason });
    case "feedback":
      return api.post<ComplaintDetail>(`${base}/feedback`, { rating: action.rating, comment: action.comment });
    case "update":
      return api.patch<ComplaintDetail>(base, action.body);
    case "delete":
      return api.delete<null>(base);
  }
}

/** Every workflow transition on one complaint. The detail cache is replaced with the API's answer. */
export function useComplaintAction(id: string) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (action: Action) => run(id, action),
    onSuccess: (res, action) => {
      toast.success(SUCCESS[action.kind]);
      if (action.kind !== "delete" && res.data) {
        client.setQueryData(qk.complaints.detail(id), res.data as ComplaintDetail);
        if ((res.data as ComplaintDetail).refundHint) toast.info("This request was paid: refund it from Payments.");
      }
      void client.invalidateQueries({ queryKey: qk.complaints.timeline(id) });
      void client.invalidateQueries({ queryKey: ["complaints", "list"] });
      void client.invalidateQueries({ queryKey: qk.me });
      void client.invalidateQueries({ queryKey: qk.admin.stats });
      void revalidateStats().catch(() => undefined);
    },
  });
}

/** Optimistic comment: it shows up instantly and rolls back if the API rejects it. */
export function useAddComment(id: string) {
  const client = useQueryClient();
  const key = qk.complaints.comments(id);

  return useMutation({
    mutationFn: (body: { body: string; isInternal: boolean }) => api.post<Comment>(`/complaints/${id}/comments`, body),
    onMutate: async (body) => {
      await client.cancelQueries({ queryKey: key });
      const previous = client.getQueryData<Comment[]>(key);
      const me = client.getQueryData<Me | null>(qk.me);
      const optimistic: Comment = {
        id: `optimistic-${Date.now()}`,
        body: body.body,
        isInternal: body.isInternal,
        createdAt: new Date().toISOString(),
        author: { id: me?.id ?? "me", name: me?.name ?? "You", role: me?.role ?? "CITIZEN" },
      };
      client.setQueryData<Comment[]>(key, (old) => [...(old ?? []), optimistic]);
      return { previous };
    },
    onError: (_err, _body, ctx) => {
      if (ctx?.previous) client.setQueryData(key, ctx.previous);
    },
    onSettled: () => client.invalidateQueries({ queryKey: key }),
  });
}

export function useUploadAttachments(id: string) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ files, onProgress }: { files: File[]; onProgress: (p: number) => void }) => {
      const form = new FormData();
      for (const f of files) form.append("files", f);
      return uploadWithProgress<Attachment[]>(`/complaints/${id}/attachments`, form, onProgress);
    },
    onSuccess: (res) => {
      toast.success(`${res.data.length} file${res.data.length === 1 ? "" : "s"} uploaded`);
      void client.invalidateQueries({ queryKey: qk.complaints.detail(id) });
    },
  });
}
