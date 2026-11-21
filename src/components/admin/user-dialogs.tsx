"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { UserPlus } from "lucide-react";
import { useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { PasswordInput } from "@/components/auth/password-input";
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
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { useUserMutations } from "@/hooks/queries/use-admin";
import { useDepartments } from "@/hooks/queries/use-catalog";
import { ROLE_LABEL } from "@/lib/auth/roles";
import { applyServerErrors } from "@/lib/form-errors";
import { emailField, passwordField } from "@/lib/validations/common";
import type { AdminUser, Role } from "@/types/api";

const ROLES: Role[] = ["STAFF", "ADMIN", "CITIZEN"];
const staffNeedsDept = (v: { role: Role; departmentId: string }) => v.role !== "STAFF" || v.departmentId !== "";
const deptError = { path: ["departmentId"], message: "Staff must belong to a department" };

const createSchema = z
  .object({
    name: z.string().trim().min(2, "Name must be at least 2 characters").max(80),
    email: emailField,
    password: passwordField,
    role: z.enum(["CITIZEN", "STAFF", "ADMIN"]),
    departmentId: z.string(),
    phone: z.string().trim().max(20, "Phone is too long"),
  })
  .refine(staffNeedsDept, deptError);
type CreateValues = z.input<typeof createSchema>;

function DepartmentSelect({
  value,
  onChange,
  invalid,
  id,
}: {
  value: string;
  onChange: (v: string) => void;
  invalid: boolean;
  id: string;
}) {
  const departments = useDepartments();
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger id={id} className="w-full" aria-invalid={invalid}>
        <SelectValue placeholder={departments.isPending ? "Loading…" : "Choose a department"} />
      </SelectTrigger>
      <SelectContent>
        {(departments.data ?? []).map((d) => (
          <SelectItem key={d.id} value={d.id}>
            {d.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export function CreateUserDialog() {
  const [open, setOpen] = useState(false);
  const { create } = useUserMutations();
  const form = useForm<CreateValues>({
    resolver: zodResolver(createSchema),
    defaultValues: { name: "", email: "", password: "", role: "STAFF", departmentId: "", phone: "" },
    mode: "onTouched",
  });
  const role = useWatch({ control: form.control, name: "role" });

  const submit = form.handleSubmit((v) =>
    create.mutate(
      {
        name: v.name.trim(),
        email: v.email,
        password: v.password,
        role: v.role,
        departmentId: v.role === "STAFF" ? v.departmentId : undefined,
        phone: v.phone.trim() || undefined,
      },
      {
        onSuccess: () => {
          setOpen(false);
          form.reset();
        },
        onError: (err) => {
          if (!applyServerErrors(err, form.setError, ["name", "email", "password", "departmentId", "phone"])) {
            form.setError("root", { message: err.message });
          }
        },
      },
    ),
  );

  const { errors } = form.formState;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <UserPlus data-icon="inline-start" /> New account
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <form onSubmit={submit} noValidate className="grid gap-5">
          <DialogHeader>
            <DialogTitle>Create an account</DialogTitle>
            <DialogDescription>Staff and admin accounts can only be created here. Share the password securely.</DialogDescription>
          </DialogHeader>
          <FieldGroup>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field data-invalid={!!errors.name}>
                <FieldLabel htmlFor="u-name">Full name</FieldLabel>
                <Input id="u-name" placeholder="e.g. Rahim Uddin" aria-invalid={!!errors.name} {...form.register("name")} />
                <FieldError errors={[errors.name]} />
              </Field>
              <Field data-invalid={!!errors.email}>
                <FieldLabel htmlFor="u-email">Email</FieldLabel>
                <Input id="u-email" type="email" placeholder="name@cityfix.com" aria-invalid={!!errors.email} {...form.register("email")} />
                <FieldError errors={[errors.email]} />
              </Field>
            </div>
            <Field data-invalid={!!errors.password}>
              <FieldLabel htmlFor="u-password">Temporary password</FieldLabel>
              <PasswordInput id="u-password" autoComplete="new-password" placeholder="At least 8 characters" aria-invalid={!!errors.password} {...form.register("password")} />
              <FieldDescription>At least 8 characters with a letter and a number.</FieldDescription>
              <FieldError errors={[errors.password]} />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Controller
                control={form.control}
                name="role"
                render={({ field }) => (
                  <Field>
                    <FieldLabel htmlFor="u-role">Role</FieldLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger id="u-role" className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ROLES.map((r) => (
                          <SelectItem key={r} value={r}>
                            {ROLE_LABEL[r]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                )}
              />
              <Field data-invalid={!!errors.phone}>
                <FieldLabel htmlFor="u-phone">
                  Phone <span className="font-normal text-muted-foreground">(optional)</span>
                </FieldLabel>
                <Input id="u-phone" type="tel" placeholder="+8801712345678" aria-invalid={!!errors.phone} {...form.register("phone")} />
                <FieldError errors={[errors.phone]} />
              </Field>
            </div>
            {role === "STAFF" ? (
              <Controller
                control={form.control}
                name="departmentId"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="u-dept">Department</FieldLabel>
                    <DepartmentSelect id="u-dept" value={field.value} onChange={field.onChange} invalid={fieldState.invalid} />
                    <FieldError errors={[fieldState.error]} />
                  </Field>
                )}
              />
            ) : null}
            {errors.root ? <p className="text-sm text-destructive">{errors.root.message}</p> : null}
          </FieldGroup>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={create.isPending}>
              {create.isPending ? <Spinner /> : null}
              Create account
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

const roleSchema = z.object({ role: z.enum(["CITIZEN", "STAFF", "ADMIN"]), departmentId: z.string() }).refine(staffNeedsDept, deptError);
type RoleValues = z.input<typeof roleSchema>;

export function ChangeRoleDialog({ user, trigger }: { user: AdminUser; trigger: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const { changeRole } = useUserMutations();
  const form = useForm<RoleValues>({
    resolver: zodResolver(roleSchema),
    defaultValues: { role: user.role, departmentId: user.department?.id ?? "" },
  });
  const role = useWatch({ control: form.control, name: "role" });

  const submit = form.handleSubmit((v) =>
    changeRole.mutate(
      { id: user.id, role: v.role, departmentId: v.role === "STAFF" ? v.departmentId : undefined },
      { onSuccess: () => setOpen(false) },
    ),
  );

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (o) form.reset({ role: user.role, departmentId: user.department?.id ?? "" });
      }}
    >
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <form onSubmit={submit} noValidate className="grid gap-5">
          <DialogHeader>
            <DialogTitle>Change role of {user.name}</DialogTitle>
            <DialogDescription>
              The user is signed out everywhere and must log in again. Staff with active requests must hand them over first.
            </DialogDescription>
          </DialogHeader>
          <FieldGroup>
            <Controller
              control={form.control}
              name="role"
              render={({ field }) => (
                <Field>
                  <FieldLabel htmlFor="r-role">Role</FieldLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="r-role" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ROLES.map((r) => (
                        <SelectItem key={r} value={r}>
                          {ROLE_LABEL[r]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              )}
            />
            {role === "STAFF" ? (
              <Controller
                control={form.control}
                name="departmentId"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="r-dept">Department</FieldLabel>
                    <DepartmentSelect id="r-dept" value={field.value} onChange={field.onChange} invalid={fieldState.invalid} />
                    <FieldError errors={[fieldState.error]} />
                  </Field>
                )}
              />
            ) : null}
          </FieldGroup>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={changeRole.isPending}>
              {changeRole.isPending ? <Spinner /> : null}
              Save role
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
