"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Star } from "lucide-react";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Field, FieldError, FieldLabel, FieldLegend, FieldSet } from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { feedbackSchema, type FeedbackValues } from "@/lib/validations/complaint";
import type { z } from "zod";

const LABELS = ["", "Very poor", "Poor", "Okay", "Good", "Excellent"];

export function StarRating({ value, onChange, size = "md" }: { value: number; onChange?: (v: number) => void; size?: "sm" | "md" }) {
  const readOnly = !onChange;
  return (
    <div
      role={readOnly ? "img" : "radiogroup"}
      aria-label={readOnly ? `${value} out of 5 stars` : "Rating"}
      className="flex items-center gap-1"
    >
      {[1, 2, 3, 4, 5].map((n) => {
        const icon = (
          <Star
            className={cn(
              size === "sm" ? "size-4" : "size-7",
              n <= value ? "fill-warning text-warning" : "text-muted-foreground/40",
            )}
          />
        );
        return readOnly ? (
          <span key={n}>{icon}</span>
        ) : (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={value === n}
            aria-label={`${n} star${n > 1 ? "s" : ""} – ${LABELS[n]}`}
            onClick={() => onChange(n)}
            className="rounded-md p-0.5 transition-transform hover:scale-110 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          >
            {icon}
          </button>
        );
      })}
    </div>
  );
}

export function FeedbackDialog({
  trigger,
  onSubmit,
}: {
  trigger: React.ReactNode;
  onSubmit: (v: { rating: number; comment?: string }) => Promise<unknown>;
}) {
  const [open, setOpen] = useState(false);
  const form = useForm<FeedbackValues, unknown, z.output<typeof feedbackSchema>>({
    resolver: zodResolver(feedbackSchema),
    defaultValues: { rating: 0, comment: "" },
  });

  const submit = form.handleSubmit(async (v) => {
    try {
      await onSubmit({ rating: v.rating, comment: v.comment });
      setOpen(false);
    } catch {
      /* toast already shown */
    }
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <form onSubmit={submit} noValidate className="grid gap-5">
          <DialogHeader>
            <DialogTitle>How did the city do?</DialogTitle>
            <DialogDescription>Your rating closes the request and helps the department improve.</DialogDescription>
          </DialogHeader>
          <Controller
            control={form.control}
            name="rating"
            render={({ field, fieldState }) => (
              <FieldSet data-invalid={fieldState.invalid}>
                <FieldLegend variant="label">Rating</FieldLegend>
                <div className="flex items-center gap-3">
                  <StarRating value={field.value} onChange={field.onChange} />
                  <span className="text-sm text-muted-foreground">{LABELS[field.value]}</span>
                </div>
                <FieldError errors={[fieldState.error]} />
              </FieldSet>
            )}
          />
          <Field>
            <FieldLabel htmlFor="fb-comment">
              Comment <span className="font-normal text-muted-foreground">(optional)</span>
            </FieldLabel>
            <Textarea id="fb-comment" rows={3} {...form.register("comment")} />
            <FieldError errors={[form.formState.errors.comment]} />
          </Field>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Not now
            </Button>
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? <Spinner /> : null}
              Submit & close request
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
