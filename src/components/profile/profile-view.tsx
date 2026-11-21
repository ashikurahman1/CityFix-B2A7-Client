"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Building2, CalendarDays, KeyRound, Mail, Save, ShieldCheck, Gauge } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { PasswordInput } from "@/components/auth/password-input";
import { PasswordStrength } from "@/components/auth/password-strength";
import { UserAvatar } from "@/components/layout/user-menu";
import { PageSkeleton } from "@/components/shared/page-skeleton";
import { RoleBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Spinner } from "@/components/ui/spinner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMe } from "@/hooks/use-auth";
import { api, authRequest } from "@/lib/api/client";
import { applyServerErrors } from "@/lib/form-errors";
import { formatDate, formatDateTime } from "@/lib/format";
import { qk } from "@/lib/query-keys";
import { passwordField, phoneField } from "@/lib/validations/common";
import type { Me, User } from "@/types/api";

const profileSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(80),
  phone: z.union([z.literal(""), phoneField]),
  address: z.string().trim().max(255, "Keep the address under 255 characters"),
  avatarUrl: z.union([z.literal(""), z.url("Enter a full image URL starting with https://")]),
});
type ProfileValues = z.input<typeof profileSchema>;

const MAX_ACTIVE = 10;

function ProfileForm({ me }: { me: Me }) {
  const client = useQueryClient();
  const form = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: me.name, phone: me.phone ?? "", address: me.address ?? "", avatarUrl: me.avatarUrl ?? "" },
    mode: "onTouched",
  });

  const save = useMutation({
    mutationFn: (v: ProfileValues) =>
      api.patch<User>("/users/me", {
        name: v.name.trim(),
        phone: v.phone.trim() || null,
        address: v.address.trim() || null,
        avatarUrl: v.avatarUrl.trim() || null,
      }),
    meta: { silent: true },
    onSuccess: ({ data }) => {
      client.setQueryData<Me | null>(qk.me, (old) => (old ? { ...old, ...data } : old));
      form.reset({ name: data.name, phone: data.phone ?? "", address: data.address ?? "", avatarUrl: data.avatarUrl ?? "" });
      toast.success("Profile saved");
    },
    onError: (err) => {
      if (!applyServerErrors(err, form.setError, ["name", "phone", "address", "avatarUrl"])) toast.error(err.message);
    },
  });

  const { errors, isDirty } = form.formState;

  return (
    <form onSubmit={form.handleSubmit((v) => save.mutate(v))} noValidate>
      <Card>
        <CardHeader>
          <CardTitle className="font-sans text-base">Personal details</CardTitle>
          <CardDescription>Shown to department staff on requests you file.</CardDescription>
        </CardHeader>
        <CardContent>
          <FieldGroup>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field data-invalid={!!errors.name}>
                <FieldLabel htmlFor="p-name">Full name</FieldLabel>
                <Input id="p-name" autoComplete="name" placeholder="Your full name" aria-invalid={!!errors.name} {...form.register("name")} />
                <FieldError errors={[errors.name]} />
              </Field>
              <Field>
                <FieldLabel htmlFor="p-email">Email</FieldLabel>
                <Input id="p-email" value={me.email} disabled readOnly />
                <FieldDescription>Email can&apos;t be changed.</FieldDescription>
              </Field>
              <Field data-invalid={!!errors.phone}>
                <FieldLabel htmlFor="p-phone">Phone</FieldLabel>
                <Input id="p-phone" type="tel" autoComplete="tel" placeholder="+8801712345678" aria-invalid={!!errors.phone} {...form.register("phone")} />
                <FieldError errors={[errors.phone]} />
              </Field>
              <Field data-invalid={!!errors.address}>
                <FieldLabel htmlFor="p-address">Address</FieldLabel>
                <Input id="p-address" autoComplete="street-address" placeholder="House, road, area" aria-invalid={!!errors.address} {...form.register("address")} />
                <FieldError errors={[errors.address]} />
              </Field>
            </div>
            <Field data-invalid={!!errors.avatarUrl}>
              <FieldLabel htmlFor="p-avatar">Avatar image URL</FieldLabel>
              <Input id="p-avatar" type="url" placeholder="https://…" aria-invalid={!!errors.avatarUrl} {...form.register("avatarUrl")} />
              <FieldError errors={[errors.avatarUrl]} />
            </Field>
            <div className="flex justify-end">
              <Button type="submit" disabled={!isDirty || save.isPending}>
                {save.isPending ? <Spinner /> : <Save data-icon="inline-start" />}
                Save changes
              </Button>
            </div>
          </FieldGroup>
        </CardContent>
      </Card>
    </form>
  );
}

function PasswordForm({ me }: { me: Me }) {
  const router = useRouter();
  const client = useQueryClient();
  const schema = z
    .object({
      currentPassword: me.hasPassword ? z.string().min(1, "Enter your current password") : z.string(),
      newPassword: passwordField,
      confirmPassword: z.string(),
    })
    .refine((v) => v.newPassword === v.confirmPassword, { path: ["confirmPassword"], message: "Passwords do not match" })
    .refine((v) => v.currentPassword !== v.newPassword, {
      path: ["newPassword"],
      message: "New password must be different from the current password",
    });
  type Values = z.input<typeof schema>;

  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" },
    mode: "onTouched",
  });

  const change = useMutation({
    mutationFn: (v: Values) =>
      api.patch<null>("/auth/change-password", {
        currentPassword: me.hasPassword ? v.currentPassword : undefined,
        newPassword: v.newPassword,
      }),
    meta: { silent: true },
    // The API revokes every session after a password change, so sign out cleanly.
    onSuccess: async () => {
      toast.success("Password changed. Please log in with your new password.");
      await authRequest("logout").catch(() => undefined);
      client.clear();
      router.replace("/login");
    },
    onError: (err) => {
      if (err.message === "Current password is incorrect") {
        form.setError("currentPassword", { message: err.message }, { shouldFocus: true });
      } else if (!applyServerErrors(err, form.setError, ["currentPassword", "newPassword"])) {
        toast.error(err.message);
      }
    },
  });

  const { errors } = form.formState;
  const newPassword = useWatch({ control: form.control, name: "newPassword" });

  return (
    <form onSubmit={form.handleSubmit((v) => change.mutate(v))} noValidate>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-sans text-base">
            <KeyRound className="size-4" /> {me.hasPassword ? "Change password" : "Set a password"}
          </CardTitle>
          <CardDescription>All other devices are signed out after the change.</CardDescription>
        </CardHeader>
        <CardContent>
          <FieldGroup className="max-w-md">
            {me.hasPassword ? (
              <Field data-invalid={!!errors.currentPassword}>
                <FieldLabel htmlFor="pw-current">Current password</FieldLabel>
                <PasswordInput id="pw-current" autoComplete="current-password" aria-invalid={!!errors.currentPassword} {...form.register("currentPassword")} />
                <FieldError errors={[errors.currentPassword]} />
              </Field>
            ) : null}
            <Field data-invalid={!!errors.newPassword}>
              <FieldLabel htmlFor="pw-new">New password</FieldLabel>
              <PasswordInput id="pw-new" autoComplete="new-password" aria-invalid={!!errors.newPassword} {...form.register("newPassword")} />
              <PasswordStrength value={newPassword ?? ""} />
              <FieldError errors={[errors.newPassword]} />
            </Field>
            <Field data-invalid={!!errors.confirmPassword}>
              <FieldLabel htmlFor="pw-confirm">Confirm new password</FieldLabel>
              <PasswordInput id="pw-confirm" autoComplete="new-password" aria-invalid={!!errors.confirmPassword} {...form.register("confirmPassword")} />
              <FieldError errors={[errors.confirmPassword]} />
            </Field>
            <Button type="submit" className="w-fit" disabled={change.isPending}>
              {change.isPending ? <Spinner /> : <ShieldCheck data-icon="inline-start" />}
              Update password
            </Button>
          </FieldGroup>
        </CardContent>
      </Card>
    </form>
  );
}

function Availability({ me }: { me: Me }) {
  const active = me.stats.activeAssignments;
  const pct = Math.min(100, Math.round((active / MAX_ACTIVE) * 100));
  const status = active >= MAX_ACTIVE ? "At capacity" : active >= 7 ? "Busy" : "Available";

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-sans text-base">
          <Gauge className="size-4" /> Availability & workload
        </CardTitle>
        <CardDescription>
          The city caps each staff member at {MAX_ACTIVE} active requests. When you reach the cap, admins can&apos;t
          assign you more and you can&apos;t claim from the queue.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-end justify-between">
          <div>
            <p className="font-heading text-3xl font-semibold tabular-nums">
              {active}
              <span className="text-lg text-muted-foreground"> / {MAX_ACTIVE}</span>
            </p>
            <p className="text-sm text-muted-foreground">active assignments</p>
          </div>
          <span
            className={
              active >= MAX_ACTIVE
                ? "rounded-full bg-destructive/10 px-3 py-1 text-sm font-medium text-destructive"
                : active >= 7
                  ? "rounded-full bg-warning/15 px-3 py-1 text-sm font-medium"
                  : "rounded-full bg-success/12 px-3 py-1 text-sm font-medium text-success"
            }
          >
            {status}
          </span>
        </div>
        <Progress value={pct} aria-label="Workload" />
        {me.department ? (
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <Building2 className="size-4" /> You take work from <strong className="text-foreground">{me.department.name}</strong>
          </p>
        ) : (
          <p className="text-sm text-destructive">You are not attached to a department. Ask an admin to set one.</p>
        )}
      </CardContent>
    </Card>
  );
}

export function ProfileView() {
  const { data: me, isPending } = useMe();
  if (isPending || !me) return <PageSkeleton variant="form" />;

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="flex flex-col gap-5 p-6 sm:flex-row sm:items-center">
          <UserAvatar user={me} className="size-16 text-lg" />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-semibold">{me.name}</h1>
              <RoleBadge role={me.role} />
            </div>
            <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <Mail className="size-4" /> {me.email}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CalendarDays className="size-4" /> Member since {formatDate(me.createdAt, "MMM yyyy")}
              </span>
              {me.lastLoginAt ? <span>Last login {formatDateTime(me.lastLoginAt)}</span> : null}
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue={me.role === "STAFF" ? "availability" : "profile"}>
        <TabsList>
          {me.role === "STAFF" ? <TabsTrigger value="availability">Availability</TabsTrigger> : null}
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>
        {me.role === "STAFF" ? (
          <TabsContent value="availability" className="mt-4">
            <Availability me={me} />
          </TabsContent>
        ) : null}
        <TabsContent value="profile" className="mt-4">
          <ProfileForm me={me} />
        </TabsContent>
        <TabsContent value="security" className="mt-4">
          <PasswordForm me={me} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
