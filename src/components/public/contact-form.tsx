"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Send } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { emailField } from "@/lib/validations/common";

const schema = z.object({
  departmentEmail: z.string().min(1, "Choose who you want to reach"),
  name: z.string().trim().min(2, "Tell us your name").max(80),
  email: emailField,
  subject: z.string().trim().min(4, "Subject must be at least 4 characters").max(120),
  message: z.string().trim().min(20, "Please write at least 20 characters").max(2000),
});

type Values = z.input<typeof schema>;

/**
 * Composes a message to the chosen department's public mailbox (from GET /departments) and opens
 * it in the visitor's email app. Requests themselves are filed from the dashboard, not here.
 */
export function ContactForm({ departments }: { departments: { name: string; email: string }[] }) {
  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { departmentEmail: "", name: "", email: "", subject: "", message: "" },
    mode: "onTouched",
  });

  const onSubmit = form.handleSubmit((v) => {
    const body = `${v.message}\n\n— ${v.name} (${v.email})`;
    const href = `mailto:${v.departmentEmail}?subject=${encodeURIComponent(v.subject)}&body=${encodeURIComponent(body)}`;
    window.location.assign(href);
    toast.success("Your email app is opening with the message ready to send.");
    form.reset();
  });

  const { errors } = form.formState;

  return (
    <form onSubmit={onSubmit} noValidate className="rounded-2xl border bg-card p-6 sm:p-8">
      <FieldGroup>
        <Controller
          control={form.control}
          name="departmentEmail"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="dept">Department</FieldLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger id="dept" aria-invalid={fieldState.invalid} onBlur={field.onBlur} className="w-full">
                  <SelectValue placeholder="Who should receive this?" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((d) => (
                    <SelectItem key={d.email} value={d.email}>
                      {d.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FieldError errors={[fieldState.error]} />
            </Field>
          )}
        />
        <div className="grid gap-5 sm:grid-cols-2">
          <Field data-invalid={!!errors.name}>
            <FieldLabel htmlFor="c-name">Your name</FieldLabel>
            <Input id="c-name" autoComplete="name" aria-invalid={!!errors.name} {...form.register("name")} />
            <FieldError errors={[errors.name]} />
          </Field>
          <Field data-invalid={!!errors.email}>
            <FieldLabel htmlFor="c-email">Email</FieldLabel>
            <Input
              id="c-email"
              type="email"
              autoComplete="email"
              aria-invalid={!!errors.email}
              {...form.register("email")}
            />
            <FieldError errors={[errors.email]} />
          </Field>
        </div>
        <Field data-invalid={!!errors.subject}>
          <FieldLabel htmlFor="c-subject">Subject</FieldLabel>
          <Input id="c-subject" aria-invalid={!!errors.subject} {...form.register("subject")} />
          <FieldError errors={[errors.subject]} />
        </Field>
        <Field data-invalid={!!errors.message}>
          <FieldLabel htmlFor="c-message">Message</FieldLabel>
          <Textarea id="c-message" rows={6} aria-invalid={!!errors.message} {...form.register("message")} />
          <FieldDescription>
            Reporting a problem? File it from your dashboard instead so it gets a tracking code and SLA.
          </FieldDescription>
          <FieldError errors={[errors.message]} />
        </Field>
        <Button type="submit" size="lg" className="w-full sm:w-fit">
          <Send data-icon="inline-start" /> Compose email
        </Button>
      </FieldGroup>
    </form>
  );
}
