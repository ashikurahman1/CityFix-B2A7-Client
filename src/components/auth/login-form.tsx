"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { LogIn, Rocket, ShieldCheck, User, Wrench } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { useLogin } from "@/hooks/use-auth";
import { errorMessage } from "@/lib/api/client";
import { DEMO_ACCOUNTS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { loginSchema, type LoginValues } from "@/lib/validations/auth";
import type { Role } from "@/types/api";
import { PasswordInput } from "./password-input";

const DEMO_ICON: Record<Role, typeof User> = { ADMIN: ShieldCheck, CITIZEN: User, STAFF: Wrench };

export function LoginForm() {
  const next = useSearchParams().get("next");
  const login = useLogin(next);
  const { reset: resetLogin } = login;
  // Next 16 keeps visited routes alive in a hidden <Activity>; clear the finished login when this
  // page is hidden so coming back (e.g. after logout) shows an idle form, not a stuck spinner.
  useEffect(() => () => resetLogin(), [resetLogin]);
  const [demoRole, setDemoRole] = useState<Role | null>(null);

  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
    mode: "onTouched",
  });

  const onSubmit = form.handleSubmit((values) => {
    setDemoRole(null);
    login.mutate({ email: values.email, password: values.password });
  });

  const demoLogin = (role: Role) => {
    const account = DEMO_ACCOUNTS.find((a) => a.role === role);
    if (!account) return;
    setDemoRole(role);
    form.reset({ email: account.email, password: account.password });
    login.mutate({ email: account.email, password: account.password });
  };

  const { errors } = form.formState;
  const busy = login.isPending || login.isSuccess;

  return (
    <div className="space-y-6">
      {login.isError ? (
        <Alert variant="destructive" role="alert">
          <AlertDescription>{errorMessage(login.error, "Login failed")}</AlertDescription>
        </Alert>
      ) : null}

      <form onSubmit={onSubmit} noValidate className="rounded-2xl border bg-card p-6 shadow-soft">
        <FieldGroup>
          <Field data-invalid={!!errors.email}>
            <FieldLabel htmlFor="email">Email</FieldLabel>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              className="h-10"
              aria-invalid={!!errors.email}
              {...form.register("email")}
            />
            <FieldError errors={[errors.email]} />
          </Field>
          <Field data-invalid={!!errors.password}>
            <FieldLabel htmlFor="password">Password</FieldLabel>
            <PasswordInput
              id="password"
              autoComplete="current-password"
              aria-invalid={!!errors.password}
              {...form.register("password")}
            />
            <FieldError errors={[errors.password]} />
          </Field>
          <Button type="submit" size="lg" className="h-10 w-full" disabled={busy}>
            {busy && !demoRole ? <Spinner /> : <LogIn data-icon="inline-start" />}
            Log in
          </Button>
        </FieldGroup>
      </form>

      <div className="flex items-center gap-3 text-xs font-medium tracking-wider text-muted-foreground uppercase" role="separator">
        <span className="h-px flex-1 bg-border" />
        or
        <span className="h-px flex-1 bg-border" />
      </div>

      <section aria-labelledby="demo-title">
        <h2 id="demo-title" className="flex items-center justify-center gap-2 font-sans text-sm font-semibold">
          <Rocket className="size-4 text-primary" aria-hidden="true" /> Quick demo login
        </h2>
        <p className="mt-1 text-center text-xs text-muted-foreground">One click signs you in as a seeded demo account.</p>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {DEMO_ACCOUNTS.map((account, i) => {
            const Icon = DEMO_ICON[account.role];
            const pending = busy && demoRole === account.role;
            return (
              <div
                key={account.role}
                className={cn(
                  "flex flex-col rounded-xl border bg-card p-4 shadow-soft transition-colors hover:border-primary/40",
                  i === DEMO_ACCOUNTS.length - 1 && "sm:col-span-2 sm:mx-auto sm:w-1/2",
                )}
              >
                <div className="flex items-center gap-2.5">
                  <span className="flex size-9 items-center justify-center rounded-lg bg-primary/12 text-primary">
                    <Icon className="size-4.5" aria-hidden="true" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold">{account.label}</p>
                    <p className="truncate text-xs text-muted-foreground">{account.blurb}</p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  className="mt-3 w-full"
                  disabled={busy}
                  onClick={() => demoLogin(account.role)}
                  aria-label={`Demo login as ${account.label}`}
                >
                  {pending ? <Spinner /> : null}
                  Demo Login
                </Button>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
