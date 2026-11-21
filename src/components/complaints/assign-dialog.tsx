"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { UserCheck } from "lucide-react";
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
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { useStaffOptions } from "@/hooks/queries/use-admin";
import { assignSchema, type AssignValues } from "@/lib/validations/complaint";
import type { z } from "zod";

interface AssignDialogProps {
  departmentId: string;
  departmentName: string;
  currentStaffId: string | null;
  onAssign: (v: { staffId: string; note?: string }) => Promise<unknown>;
}

export function AssignDialog({ departmentId, departmentName, currentStaffId, onAssign }: AssignDialogProps) {
  const [open, setOpen] = useState(false);
  const staff = useStaffOptions(open ? departmentId : undefined);
  const form = useForm<AssignValues, unknown, z.output<typeof assignSchema>>({
    resolver: zodResolver(assignSchema),
    defaultValues: { staffId: currentStaffId ?? "", note: "" },
  });

  const submit = form.handleSubmit(async (v) => {
    try {
      await onAssign({ staffId: v.staffId, note: v.note });
      setOpen(false);
    } catch {
      /* toast shown by the mutation cache */
    }
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <UserCheck data-icon="inline-start" />
          {currentStaffId ? "Re-assign" : "Assign"}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={submit} noValidate className="grid gap-5">
          <DialogHeader>
            <DialogTitle>{currentStaffId ? "Re-assign request" : "Assign request"}</DialogTitle>
            <DialogDescription>
              Only active staff of <strong>{departmentName}</strong> can take this request. Each person can hold up to
              10 active requests.
            </DialogDescription>
          </DialogHeader>
          <Controller
            control={form.control}
            name="staffId"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="assign-staff">Staff member</FieldLabel>
                {staff.isPending ? (
                  <Skeleton className="h-9 w-full" />
                ) : staff.data && staff.data.length > 0 ? (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="assign-staff" className="w-full" aria-invalid={fieldState.invalid}>
                      <SelectValue placeholder="Choose a staff member" />
                    </SelectTrigger>
                    <SelectContent>
                      {staff.data.map((s) => (
                        <SelectItem key={s.id} value={s.id} disabled={s.id === currentStaffId}>
                          {s.name}
                          {s.id === currentStaffId ? " (current)" : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <FieldDescription>No active staff in this department. Create one under Users & staff.</FieldDescription>
                )}
                <FieldError errors={[fieldState.error]} />
              </Field>
            )}
          />
          <Field>
            <FieldLabel htmlFor="assign-note">
              Note <span className="font-normal text-muted-foreground">(optional)</span>
            </FieldLabel>
            <Textarea id="assign-note" rows={3} placeholder="Context for the assignee" {...form.register("note")} />
            <FieldError errors={[form.formState.errors.note]} />
          </Field>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? <Spinner /> : null}
              Assign
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
