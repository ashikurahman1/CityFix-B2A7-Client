"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { UserPlus } from "lucide-react";
import { useEffect } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { useRegister } from "@/hooks/use-auth";
import { errorMessage } from "@/lib/api/client";
import { applyServerErrors } from "@/lib/form-errors";
import { registerSchema, type RegisterOutput, type RegisterValues } from "@/lib/validations/auth";
import { PasswordInput } from "./password-input";
import { PasswordStrength } from "./password-strength";

const SERVER_FIELDS = ["name", "email", "phone", "address", "password"] as const;

export function RegisterForm() {
  const register = useRegister();
  const { reset: resetRegister } = register;
  // See LoginForm: reset when the hidden route is torn down so a revisit starts idle.
  useEffect(() => () => resetRegister(), [resetRegister]);
  const form = useForm<RegisterValues, unknown, RegisterOutput>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", email: "", phone: "", address: "", password: "", confirmPassword: "", terms: false },
    mode: "onTouched",
  });
  const password = useWatch({ control: form.control, name: "password" });

  const onSubmit = form.handleSubmit((values) => {
    const body = { name: values.name, email: values.email, phone: values.phone, address: values.address, password: values.password };
    register.mutate(body, {
      onError: (err) => applyServerErrors(err, form.setError, SERVER_FIELDS),
    });
  });

  const { errors } = form.formState;
  const busy = register.isPending || register.isSuccess;

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-4">
      {register.isError ? (
        <Alert variant="destructive">
          <AlertDescription>{errorMessage(register.error, "Registration failed")}</AlertDescription>
        </Alert>
      ) : null}
      <div className="rounded-2xl border bg-card p-6 shadow-soft">
        <FieldGroup>
          <Field data-invalid={!!errors.name}>
            <FieldLabel htmlFor="name">Full name</FieldLabel>
            <Input id="name" autoComplete="name" className="h-10" aria-invalid={!!errors.name} {...form.register("name")} />
            <FieldError errors={[errors.name]} />
          </Field>
          <Field data-invalid={!!errors.email}>
            <FieldLabel htmlFor="email">Email</FieldLabel>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              className="h-10"
              aria-invalid={!!errors.email}
              {...form.register("email")}
            />
            <FieldError errors={[errors.email]} />
          </Field>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field data-invalid={!!errors.phone}>
              <FieldLabel htmlFor="phone">
                Phone <span className="font-normal text-muted-foreground">(optional)</span>
              </FieldLabel>
              <Input
                id="phone"
                type="tel"
                autoComplete="tel"
                placeholder="+8801712345678"
                className="h-10"
                aria-invalid={!!errors.phone}
                {...form.register("phone")}
              />
              <FieldError errors={[errors.phone]} />
            </Field>
            <Field data-invalid={!!errors.address}>
              <FieldLabel htmlFor="address">
                Area <span className="font-normal text-muted-foreground">(optional)</span>
              </FieldLabel>
              <Input
                id="address"
                autoComplete="address-level2"
                className="h-10"
                aria-invalid={!!errors.address}
                {...form.register("address")}
              />
              <FieldError errors={[errors.address]} />
            </Field>
          </div>
          <Field data-invalid={!!errors.password}>
            <FieldLabel htmlFor="password">Password</FieldLabel>
            <PasswordInput
              id="password"
              autoComplete="new-password"
              aria-invalid={!!errors.password}
              {...form.register("password")}
            />
            <PasswordStrength value={password ?? ""} />
            <FieldError errors={[errors.password]} />
          </Field>
          <Field data-invalid={!!errors.confirmPassword}>
            <FieldLabel htmlFor="confirmPassword">Confirm password</FieldLabel>
            <PasswordInput
              id="confirmPassword"
              autoComplete="new-password"
              aria-invalid={!!errors.confirmPassword}
              {...form.register("confirmPassword")}
            />
            <FieldError errors={[errors.confirmPassword]} />
          </Field>
          <Controller
            control={form.control}
            name="terms"
            render={({ field, fieldState }) => (
              <Field orientation="horizontal" data-invalid={fieldState.invalid}>
                <Checkbox
                  id="terms"
                  checked={field.value}
                  onCheckedChange={(v) => field.onChange(v === true)}
                  aria-invalid={fieldState.invalid}
                />
                <div className="space-y-1">
                  <FieldLabel htmlFor="terms" className="font-normal">
                    I agree that my reports may be shared with city departments.
                  </FieldLabel>
                  <FieldError errors={[fieldState.error]} />
                </div>
              </Field>
            )}
          />
          <Button type="submit" size="lg" className="h-10 w-full" disabled={busy}>
            {busy ? <Spinner /> : <UserPlus data-icon="inline-start" />}
            Create account
          </Button>
          <FieldDescription className="text-center">
            Public sign-up creates a citizen account. Staff accounts are created by the city admin.
          </FieldDescription>
        </FieldGroup>
      </div>
    </form>
  );
}
