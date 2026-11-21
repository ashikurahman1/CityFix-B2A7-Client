"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Pencil } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
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
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { applyServerErrors } from "@/lib/form-errors";
import { editComplaintSchema, type EditComplaintValues } from "@/lib/validations/complaint";
import type { ComplaintDetail } from "@/types/api";

const FIELDS = ["title", "description", "address", "ward", "latitude", "longitude"] as const;

export function EditComplaintDialog({
  complaint,
  onSave,
}: {
  complaint: ComplaintDetail;
  onSave: (body: Record<string, unknown>) => Promise<unknown>;
}) {
  const [open, setOpen] = useState(false);
  const defaults: EditComplaintValues = {
    title: complaint.title,
    description: complaint.description,
    address: complaint.address,
    ward: complaint.ward ?? "",
    latitude: complaint.latitude?.toString() ?? "",
    longitude: complaint.longitude?.toString() ?? "",
  };
  const form = useForm<EditComplaintValues>({ resolver: zodResolver(editComplaintSchema), defaultValues: defaults });

  const submit = form.handleSubmit(async (v) => {
    // Only send what changed; the API rejects empty updates.
    const body: Record<string, unknown> = {};
    if (v.title.trim() !== complaint.title) body.title = v.title.trim();
    if (v.description.trim() !== complaint.description) body.description = v.description.trim();
    if (v.address.trim() !== complaint.address) body.address = v.address.trim();
    if (v.ward.trim() && v.ward.trim() !== (complaint.ward ?? "")) body.ward = v.ward.trim();
    if (v.latitude.trim() && v.longitude.trim()) {
      const lat = Number(v.latitude);
      const lng = Number(v.longitude);
      if (lat !== complaint.latitude || lng !== complaint.longitude) {
        body.latitude = lat;
        body.longitude = lng;
      }
    }
    if (Object.keys(body).length === 0) {
      setOpen(false);
      return;
    }
    try {
      await onSave(body);
      setOpen(false);
    } catch (err) {
      applyServerErrors(err, form.setError, FIELDS);
    }
  });

  const { errors } = form.formState;

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (o) form.reset(defaults);
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline">
          <Pencil data-icon="inline-start" /> Edit
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <form onSubmit={submit} noValidate className="grid gap-5">
          <DialogHeader>
            <DialogTitle>Edit request</DialogTitle>
            <DialogDescription>You can edit the details until a staff member is assigned.</DialogDescription>
          </DialogHeader>
          <FieldGroup className="max-h-[60vh] overflow-y-auto pe-1">
            <Field data-invalid={!!errors.title}>
              <FieldLabel htmlFor="e-title">Title</FieldLabel>
              <Input id="e-title" aria-invalid={!!errors.title} {...form.register("title")} />
              <FieldError errors={[errors.title]} />
            </Field>
            <Field data-invalid={!!errors.description}>
              <FieldLabel htmlFor="e-desc">Description</FieldLabel>
              <Textarea id="e-desc" rows={4} aria-invalid={!!errors.description} {...form.register("description")} />
              <FieldError errors={[errors.description]} />
            </Field>
            <Field data-invalid={!!errors.address}>
              <FieldLabel htmlFor="e-address">Address</FieldLabel>
              <Input id="e-address" aria-invalid={!!errors.address} {...form.register("address")} />
              <FieldError errors={[errors.address]} />
            </Field>
            <div className="grid gap-4 sm:grid-cols-3">
              <Field data-invalid={!!errors.ward}>
                <FieldLabel htmlFor="e-ward">Ward</FieldLabel>
                <Input id="e-ward" aria-invalid={!!errors.ward} {...form.register("ward")} />
                <FieldError errors={[errors.ward]} />
              </Field>
              <Field data-invalid={!!errors.latitude}>
                <FieldLabel htmlFor="e-lat">Latitude</FieldLabel>
                <Input id="e-lat" inputMode="decimal" aria-invalid={!!errors.latitude} {...form.register("latitude")} />
                <FieldError errors={[errors.latitude]} />
              </Field>
              <Field data-invalid={!!errors.longitude}>
                <FieldLabel htmlFor="e-lng">Longitude</FieldLabel>
                <Input id="e-lng" inputMode="decimal" aria-invalid={!!errors.longitude} {...form.register("longitude")} />
                <FieldError errors={[errors.longitude]} />
              </Field>
            </div>
          </FieldGroup>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? <Spinner /> : null}
              Save changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
