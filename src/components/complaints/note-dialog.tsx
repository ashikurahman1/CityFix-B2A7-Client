"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
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
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";

const schemas = {
  required: z.object({ text: z.string().trim().min(5, "Please give at least 5 characters").max(1000) }),
  optional: z.object({ text: z.string().trim().max(500, "Keep it under 500 characters") }),
};

interface NoteDialogProps {
  trigger: React.ReactNode;
  title: string;
  description: React.ReactNode;
  label: string;
  placeholder?: string;
  hint?: string;
  confirmLabel: string;
  required?: boolean;
  destructive?: boolean;
  onConfirm: (text: string | undefined) => Promise<unknown>;
}

/** Dialog collecting a reason or resolution note before a workflow transition. */
export function NoteDialog({
  trigger,
  title,
  description,
  label,
  placeholder,
  hint,
  confirmLabel,
  required = true,
  destructive,
  onConfirm,
}: NoteDialogProps) {
  const [open, setOpen] = useState(false);
  const form = useForm<{ text: string }>({
    resolver: zodResolver(required ? schemas.required : schemas.optional),
    defaultValues: { text: "" },
  });

  const submit = form.handleSubmit(async ({ text }) => {
    try {
      await onConfirm(text.trim() === "" ? undefined : text.trim());
      setOpen(false);
      form.reset();
    } catch {
      /* the mutation cache shows the toast; keep the dialog open */
    }
  });

  const error = form.formState.errors.text;

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (!o) form.reset();
      }}
    >
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <form onSubmit={submit} noValidate className="grid gap-5">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </DialogHeader>
          <Field data-invalid={!!error}>
            <FieldLabel htmlFor="note-text">
              {label}
              {!required ? <span className="font-normal text-muted-foreground">(optional)</span> : null}
            </FieldLabel>
            <Textarea id="note-text" rows={4} placeholder={placeholder} aria-invalid={!!error} {...form.register("text")} />
            {hint ? <FieldDescription>{hint}</FieldDescription> : null}
            <FieldError errors={[error]} />
          </Field>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Back
            </Button>
            <Button type="submit" variant={destructive ? "destructive" : "default"} disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? <Spinner /> : null}
              {confirmLabel}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
