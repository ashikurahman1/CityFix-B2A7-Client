"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Clock,
  Coins,
  CreditCard,
  LocateFixed,
  RotateCcw,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Controller, type FieldPath, useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { EmptyState } from "@/components/shared/empty-state";
import { TypeBadge } from "@/components/shared/status-badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel, FieldLegend, FieldSet } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { useCategories } from "@/hooks/queries/use-catalog";
import { useCreateComplaint } from "@/hooks/queries/use-complaints";
import { useStartCheckout } from "@/hooks/queries/use-payments";
import { ALL_PRIORITIES, PRIORITY_META } from "@/lib/constants";
import { applyServerErrors } from "@/lib/form-errors";
import { formatHours, formatMoney } from "@/lib/format";
import { cn } from "@/lib/utils";
import { createComplaintSchema, type CreateComplaintValues, WIZARD_STEPS } from "@/lib/validations/complaint";
import { useIsClient } from "@/hooks/use-is-client";
import { useRequestDraft } from "@/stores/request-draft";
import type { Category, CreateComplaintResult, Priority } from "@/types/api";

const STEP_FIELDS: FieldPath<CreateComplaintValues>[][] = [
  ["categoryId"],
  ["title", "description", "priority"],
  ["address", "ward", "latitude", "longitude"],
  [],
];

const ALL_FIELDS = STEP_FIELDS.flat();

function Stepper({ step, onJump }: { step: number; onJump: (i: number) => void }) {
  return (
    <ol className="flex items-center gap-2" aria-label="Progress">
      {WIZARD_STEPS.map((s, i) => {
        const done = i < step;
        const current = i === step;
        return (
          <li key={s.id} className="flex flex-1 items-center gap-2">
            <button
              type="button"
              disabled={!done}
              onClick={() => onJump(i)}
              aria-current={current ? "step" : undefined}
              className={cn(
                "flex items-center gap-2 rounded-full text-sm font-medium",
                done ? "cursor-pointer text-foreground" : current ? "text-foreground" : "text-muted-foreground",
              )}
            >
              <span
                className={cn(
                  "flex size-7 shrink-0 items-center justify-center rounded-full border-2 text-xs",
                  done && "border-primary bg-primary text-primary-foreground",
                  current && "border-primary text-primary",
                )}
              >
                {done ? <Check className="size-3.5" /> : i + 1}
              </span>
              <span className="hidden sm:inline">{s.title}</span>
            </button>
            {i < WIZARD_STEPS.length - 1 ? (
              <span className={cn("h-0.5 flex-1 rounded-full bg-border", done && "bg-primary")} aria-hidden="true" />
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}

function CategoryPicker({
  categories,
  value,
  onChange,
  invalid,
}: {
  categories: Category[];
  value: string;
  onChange: (id: string) => void;
  invalid: boolean;
}) {
  const groups = [
    { type: "COMPLAINT" as const, title: "Report a problem", hint: "Free · routed immediately" },
    { type: "SERVICE" as const, title: "Apply for a service", hint: "Fixed fee · paid via Stripe" },
  ];
  return (
    <div className="space-y-6">
      {groups.map((g) => {
        const items = categories.filter((c) => c.type === g.type);
        if (items.length === 0) return null;
        return (
          <fieldset key={g.type}>
            <legend className="mb-3 flex items-baseline gap-2">
              <span className="font-semibold">{g.title}</span>
              <span className="text-xs text-muted-foreground">{g.hint}</span>
            </legend>
            <div role="radiogroup" className="grid gap-3 sm:grid-cols-2" aria-invalid={invalid}>
              {items.map((c) => {
                const selected = value === c.id;
                const fee = Number(c.serviceFee);
                return (
                  <button
                    key={c.id}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    onClick={() => onChange(c.id)}
                    className={cn(
                      "flex flex-col rounded-xl border bg-card p-4 text-left transition-colors hover:border-primary/50 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
                      selected && "border-primary bg-primary/5 ring-1 ring-primary",
                    )}
                  >
                    <span className="flex items-start justify-between gap-2">
                      <span className="font-medium">{c.name}</span>
                      <span
                        className={cn(
                          "flex size-5 shrink-0 items-center justify-center rounded-full border",
                          selected && "border-primary bg-primary text-primary-foreground",
                        )}
                        aria-hidden="true"
                      >
                        {selected ? <Check className="size-3" /> : null}
                      </span>
                    </span>
                    <span className="mt-0.5 text-xs text-muted-foreground">{c.department.name}</span>
                    <span className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <Clock className="size-3.5" /> {formatHours(c.slaHours)}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Coins className="size-3.5" /> {fee > 0 ? formatMoney(fee) : "Free"}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          </fieldset>
        );
      })}
    </div>
  );
}

function SuccessView({ result, onAnother }: { result: CreateComplaintResult; onAnother: () => void }) {
  const checkout = useStartCheckout();
  const needsPayment = result.status === "PENDING_PAYMENT";

  return (
    <Card className="mx-auto max-w-xl">
      <CardContent className="p-8 text-center">
        <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-success/12 text-success">
          <CheckCircle2 className="size-7" />
        </div>
        <h2 className="mt-4 text-2xl font-semibold">{needsPayment ? "Almost there!" : "Request filed"}</h2>
        <p className="mt-2 text-muted-foreground">
          {needsPayment
            ? `Pay the ${formatMoney(result.feeAmount)} service fee to send it to ${result.department.name}.`
            : `It has been routed to ${result.department.name}.`}
        </p>
        <div className="mx-auto mt-5 w-fit rounded-xl border bg-muted/50 px-5 py-3">
          <p className="text-xs text-muted-foreground">Tracking code</p>
          <p className="font-mono text-lg font-semibold">{result.trackingCode}</p>
        </div>
        <div className="mt-6 flex flex-col justify-center gap-2 sm:flex-row">
          {needsPayment ? (
            <Button size="lg" onClick={() => checkout.mutate(result.id)} disabled={checkout.isPending || checkout.isSuccess}>
              {checkout.isPending || checkout.isSuccess ? <Spinner /> : <CreditCard data-icon="inline-start" />}
              Pay {formatMoney(result.feeAmount)} with Stripe
            </Button>
          ) : null}
          <Button size="lg" variant={needsPayment ? "outline" : "default"} asChild>
            <Link href={`/dashboard/requests/${result.id}`}>View request</Link>
          </Button>
          <Button size="lg" variant="ghost" onClick={onAnother}>
            File another
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

/** Four-step wizard. Each step validates its own fields; the draft survives refreshes. */
export function RequestWizard() {
  const { draft, step, patch, setStep, reset: resetDraft } = useRequestDraft();
  // The draft lives in sessionStorage, so the form only renders on the client (no hydration mismatch).
  const hydrated = useIsClient();
  const [result, setResult] = useState<CreateComplaintResult | null>(null);
  const [locating, setLocating] = useState(false);
  const categories = useCategories();
  const create = useCreateComplaint();

  const form = useForm<CreateComplaintValues>({
    resolver: zodResolver(createComplaintSchema),
    defaultValues: draft,
    mode: "onTouched",
  });

  const values = useWatch({ control: form.control });
  useEffect(() => {
    if (hydrated) patch(values as Partial<CreateComplaintValues>);
  }, [values, hydrated, patch]);

  const category = useMemo(
    () => categories.data?.find((c) => c.id === values.categoryId),
    [categories.data, values.categoryId],
  );

  const next = async () => {
    const ok = await form.trigger(STEP_FIELDS[step], { shouldFocus: true });
    if (ok) setStep(Math.min(step + 1, WIZARD_STEPS.length - 1));
  };
  const back = () => setStep(Math.max(step - 1, 0));

  const submit = form.handleSubmit((v) => {
    create.mutate(
      {
        categoryId: v.categoryId,
        title: v.title.trim(),
        description: v.description.trim(),
        priority: v.priority as Priority,
        address: v.address.trim(),
        ward: v.ward.trim() || undefined,
        latitude: v.latitude.trim() ? Number(v.latitude) : undefined,
        longitude: v.longitude.trim() ? Number(v.longitude) : undefined,
      },
      {
        onSuccess: ({ data }) => {
          setResult(data);
          resetDraft();
          form.reset(useRequestDraft.getState().draft);
        },
        onError: (err) => {
          if (applyServerErrors(err, form.setError, ALL_FIELDS)) {
            const firstBad = STEP_FIELDS.findIndex((fields) => fields.some((f) => form.getFieldState(f).invalid));
            if (firstBad >= 0) setStep(firstBad);
          }
        },
      },
    );
  });

  const locate = () => {
    if (!navigator.geolocation) {
      toast.error("Your browser cannot share its location");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        form.setValue("latitude", pos.coords.latitude.toFixed(6), { shouldValidate: true, shouldDirty: true });
        form.setValue("longitude", pos.coords.longitude.toFixed(6), { shouldValidate: true, shouldDirty: true });
        setLocating(false);
        toast.success("Location added");
      },
      () => {
        setLocating(false);
        toast.error("Location permission was denied");
      },
      { enableHighAccuracy: true, timeout: 10_000 },
    );
  };

  if (result) {
    return (
      <SuccessView
        result={result}
        onAnother={() => {
          setResult(null);
          create.reset();
        }}
      />
    );
  }

  if (!hydrated || categories.isPending) {
    return <Skeleton className="h-[520px] w-full max-w-3xl rounded-2xl" />;
  }

  if (categories.isError || !categories.data?.length) {
    return (
      <EmptyState
        title="Categories are unavailable"
        description="We couldn't load what can be reported right now. Please try again shortly."
        action={<Button onClick={() => void categories.refetch()}>Retry</Button>}
      />
    );
  }

  const { errors } = form.formState;
  const fee = Number(category?.serviceFee ?? 0);
  const isLast = step === WIZARD_STEPS.length - 1;

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (isLast) void submit();
        else void next();
      }}
      noValidate
      className="max-w-3xl space-y-6"
    >
      <Stepper step={step} onJump={setStep} />

      <Card>
        <CardContent className="p-5 sm:p-7">
          {step === 0 ? (
            <Controller
              control={form.control}
              name="categoryId"
              render={({ field, fieldState }) => (
                <div className="space-y-3">
                  <CategoryPicker
                    categories={categories.data}
                    value={field.value}
                    onChange={field.onChange}
                    invalid={fieldState.invalid}
                  />
                  <FieldError errors={[fieldState.error]} />
                </div>
              )}
            />
          ) : null}

          {step === 1 ? (
            <FieldGroup>
              <Field data-invalid={!!errors.title}>
                <FieldLabel htmlFor="w-title">Title</FieldLabel>
                <Input
                  id="w-title"
                  placeholder={category?.type === "SERVICE" ? "e.g. Trade licence for a grocery shop" : "e.g. Deep pothole outside house 12"}
                  aria-invalid={!!errors.title}
                  {...form.register("title")}
                />
                <FieldError errors={[errors.title]} />
              </Field>
              <Field data-invalid={!!errors.description}>
                <FieldLabel htmlFor="w-desc">Description</FieldLabel>
                <Textarea
                  id="w-desc"
                  rows={5}
                  placeholder="What is the problem, since when, and how is it affecting people?"
                  aria-invalid={!!errors.description}
                  {...form.register("description")}
                />
                <FieldDescription>{(values.description ?? "").length} / 2000 characters</FieldDescription>
                <FieldError errors={[errors.description]} />
              </Field>
              <Controller
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FieldSet>
                    <FieldLegend variant="label">How urgent is it?</FieldLegend>
                    <div role="radiogroup" className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                      {ALL_PRIORITIES.map((p) => {
                        const selected = field.value === p;
                        const hours = category ? Math.max(1, Math.round(category.slaHours * PRIORITY_META[p].factor)) : null;
                        return (
                          <button
                            key={p}
                            type="button"
                            role="radio"
                            aria-checked={selected}
                            onClick={() => field.onChange(p)}
                            className={cn(
                              "rounded-xl border p-3 text-left transition-colors hover:border-primary/50",
                              selected && "border-primary bg-primary/5 ring-1 ring-primary",
                            )}
                          >
                            <span className="block text-sm font-medium">{PRIORITY_META[p].label}</span>
                            <span className="block text-xs text-muted-foreground">
                              {hours ? `SLA ${formatHours(hours)}` : `×${PRIORITY_META[p].factor}`}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                    <FieldDescription>Urgent is for hazards to people, like an open manhole.</FieldDescription>
                  </FieldSet>
                )}
              />
            </FieldGroup>
          ) : null}

          {step === 2 ? (
            <FieldGroup>
              <Field data-invalid={!!errors.address}>
                <FieldLabel htmlFor="w-address">Address or landmark</FieldLabel>
                <Input
                  id="w-address"
                  autoComplete="street-address"
                  placeholder="House 12, Road 5, Dhanmondi"
                  aria-invalid={!!errors.address}
                  {...form.register("address")}
                />
                <FieldError errors={[errors.address]} />
              </Field>
              <Field data-invalid={!!errors.ward}>
                <FieldLabel htmlFor="w-ward">
                  Ward <span className="font-normal text-muted-foreground">(optional)</span>
                </FieldLabel>
                <Input id="w-ward" placeholder="e.g. 15" aria-invalid={!!errors.ward} {...form.register("ward")} />
                <FieldError errors={[errors.ward]} />
              </Field>
              <FieldSet>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <FieldLegend variant="label">
                    Exact location <span className="font-normal text-muted-foreground">(optional)</span>
                  </FieldLegend>
                  <Button type="button" variant="outline" size="sm" onClick={locate} disabled={locating}>
                    {locating ? <Spinner /> : <LocateFixed data-icon="inline-start" />}
                    Use my location
                  </Button>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field data-invalid={!!errors.latitude}>
                    <FieldLabel htmlFor="w-lat">Latitude</FieldLabel>
                    <Input id="w-lat" inputMode="decimal" placeholder="23.8103" aria-invalid={!!errors.latitude} {...form.register("latitude")} />
                    <FieldError errors={[errors.latitude]} />
                  </Field>
                  <Field data-invalid={!!errors.longitude}>
                    <FieldLabel htmlFor="w-lng">Longitude</FieldLabel>
                    <Input id="w-lng" inputMode="decimal" placeholder="90.4125" aria-invalid={!!errors.longitude} {...form.register("longitude")} />
                    <FieldError errors={[errors.longitude]} />
                  </Field>
                </div>
              </FieldSet>
            </FieldGroup>
          ) : null}

          {step === 3 && category ? (
            <div className="space-y-5">
              <div>
                <h2 className="text-lg font-semibold">Check your request</h2>
                <p className="text-sm text-muted-foreground">You can add photos from the request page after filing.</p>
              </div>
              <dl className="grid gap-4 rounded-xl border p-4 text-sm sm:grid-cols-2">
                <div>
                  <dt className="text-muted-foreground">Category</dt>
                  <dd className="mt-0.5 flex flex-wrap items-center gap-2 font-medium">
                    {category.name} <TypeBadge type={category.type} />
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Department</dt>
                  <dd className="mt-0.5 font-medium">{category.department.name}</dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-muted-foreground">Title</dt>
                  <dd className="mt-0.5 font-medium">{values.title}</dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-muted-foreground">Description</dt>
                  <dd className="mt-0.5 whitespace-pre-wrap">{values.description}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Priority</dt>
                  <dd className="mt-0.5 font-medium">
                    {PRIORITY_META[(values.priority ?? "MEDIUM") as Priority].label} · SLA{" "}
                    {formatHours(Math.max(1, Math.round(category.slaHours * PRIORITY_META[(values.priority ?? "MEDIUM") as Priority].factor)))}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Location</dt>
                  <dd className="mt-0.5 font-medium">
                    {values.address}
                    {values.ward ? `, ward ${values.ward}` : ""}
                  </dd>
                </div>
              </dl>
              {fee > 0 ? (
                <Alert className="border-warning/40 bg-warning/10">
                  <CreditCard className="size-4" />
                  <AlertTitle>Service fee: {formatMoney(fee)}</AlertTitle>
                  <AlertDescription>
                    After filing you will pay securely on Stripe. The SLA clock starts once payment is confirmed.
                  </AlertDescription>
                </Alert>
              ) : null}
            </div>
          ) : null}
        </CardContent>
      </Card>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2">
          {step > 0 ? (
            <Button type="button" variant="outline" onClick={back}>
              <ArrowLeft data-icon="inline-start" /> Back
            </Button>
          ) : null}
          <Button
            type="button"
            variant="ghost"
            onClick={() => {
              resetDraft();
              form.reset(useRequestDraft.getState().draft);
            }}
          >
            <RotateCcw data-icon="inline-start" /> Start over
          </Button>
        </div>
        <Button type="submit" size="lg" disabled={create.isPending}>
          {create.isPending ? <Spinner /> : null}
          {isLast ? (fee > 0 ? "File & continue to payment" : "Submit request") : "Continue"}
          {!isLast ? <ArrowRight data-icon="inline-end" /> : null}
        </Button>
      </div>
    </form>
  );
}
