"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Lock, MessageSquare, Send } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { RoleBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { UserAvatar } from "@/components/layout/user-menu";
import { useAddComment, useComments } from "@/hooks/queries/use-complaints";
import { fromNow } from "@/lib/format";
import { cn } from "@/lib/utils";
import { commentSchema, type CommentValues } from "@/lib/validations/complaint";
import type { Role } from "@/types/api";

export function CommentsPanel({ complaintId, role, locked }: { complaintId: string; role: Role; locked: boolean }) {
  const comments = useComments(complaintId);
  const add = useAddComment(complaintId);
  const canInternal = role !== "CITIZEN";

  const form = useForm<CommentValues>({
    resolver: zodResolver(commentSchema),
    defaultValues: { body: "", isInternal: false },
  });

  const submit = form.handleSubmit((v) => {
    add.mutate({ body: v.body.trim(), isInternal: canInternal && v.isInternal });
    form.reset({ body: "", isInternal: v.isInternal });
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-sans text-base">
          <MessageSquare className="size-4" aria-hidden="true" /> Conversation
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {comments.isPending ? (
          <div className="space-y-3">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-4/5" />
          </div>
        ) : comments.data && comments.data.length > 0 ? (
          <ul className="space-y-4" aria-live="polite">
            {comments.data.map((c) => (
              <li key={c.id} className={cn("flex gap-3", c.id.startsWith("optimistic-") && "opacity-60")}>
                <UserAvatar user={{ name: c.author.name, avatarUrl: null }} className="size-8" />
                <div
                  className={cn(
                    "min-w-0 flex-1 rounded-xl border px-3.5 py-2.5",
                    c.isInternal ? "border-warning/40 bg-warning/8" : "bg-muted/40",
                  )}
                >
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <span className="text-sm font-medium">{c.author.name}</span>
                    <RoleBadge role={c.author.role} className="h-5 px-2 text-[11px]" />
                    {c.isInternal ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[color-mix(in_oklch,var(--warning)_70%,var(--foreground))]">
                        <Lock className="size-3" /> Internal note
                      </span>
                    ) : null}
                    <span className="ms-auto text-xs text-muted-foreground">
                      {c.id.startsWith("optimistic-") ? "Sending…" : fromNow(c.createdAt)}
                    </span>
                  </div>
                  <p className="mt-1 text-sm break-words whitespace-pre-wrap">{c.body}</p>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">No messages yet. Questions and updates appear here.</p>
        )}

        {!locked ? (
          <form onSubmit={submit} noValidate className="space-y-3 border-t pt-4">
            <Field data-invalid={!!form.formState.errors.body}>
              <FieldLabel htmlFor={`comment-${complaintId}`} className="sr-only">
                Write a message
              </FieldLabel>
              <Textarea
                id={`comment-${complaintId}`}
                rows={3}
                placeholder={canInternal ? "Reply to the citizen or add an internal note…" : "Ask a question or add details…"}
                aria-invalid={!!form.formState.errors.body}
                {...form.register("body")}
              />
              <FieldError errors={[form.formState.errors.body]} />
            </Field>
            <div className="flex flex-wrap items-center justify-between gap-3">
              {canInternal ? (
                <Controller
                  control={form.control}
                  name="isInternal"
                  render={({ field }) => (
                    <label className="flex items-center gap-2 text-sm">
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                      Internal note (hidden from citizen)
                    </label>
                  )}
                />
              ) : (
                <span />
              )}
              <Button type="submit" size="sm" disabled={add.isPending}>
                <Send data-icon="inline-start" /> Send
              </Button>
            </div>
          </form>
        ) : null}
      </CardContent>
    </Card>
  );
}
