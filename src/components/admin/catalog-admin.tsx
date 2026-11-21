"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Building2, Mail, Pencil, Phone, Plus, Tags, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { type Column, DataTable } from "@/components/shared/data-table";
import { EmptyState } from "@/components/shared/empty-state";
import { FilterSelect } from "@/components/shared/filter-select";
import { TypeBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useCatalogMutations, useCategories, useDepartments } from "@/hooks/queries/use-catalog";
import { useUrlState } from "@/hooks/use-url-state";
import { applyServerErrors } from "@/lib/form-errors";
import { formatHours, formatMoney } from "@/lib/format";
import type { Category, Department } from "@/types/api";

// ───────────────────────── Departments ─────────────────────────

const deptSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(100),
  description: z.string().trim().max(500),
  contactEmail: z.union([z.literal(""), z.email("Enter a valid email")]),
  contactPhone: z.string().trim().max(20, "Phone is too long"),
});
type DeptValues = z.input<typeof deptSchema>;

function DepartmentDialog({ department, trigger }: { department?: Department; trigger: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const { createDepartment, updateDepartment } = useCatalogMutations();
  const mutation = department ? updateDepartment : createDepartment;
  const defaults: DeptValues = {
    name: department?.name ?? "",
    description: department?.description ?? "",
    contactEmail: department?.contactEmail ?? "",
    contactPhone: department?.contactPhone ?? "",
  };
  const form = useForm<DeptValues>({ resolver: zodResolver(deptSchema), defaultValues: defaults });

  const submit = form.handleSubmit(async (v) => {
    const body = {
      name: v.name.trim(),
      description: v.description.trim() || undefined,
      contactEmail: v.contactEmail || undefined,
      contactPhone: v.contactPhone.trim() || undefined,
    };
    try {
      if (department) await updateDepartment.mutateAsync({ id: department.id, ...body });
      else await createDepartment.mutateAsync(body);
      setOpen(false);
    } catch (err) {
      applyServerErrors(err, form.setError, ["name", "description", "contactEmail", "contactPhone"]);
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
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <form onSubmit={submit} noValidate className="grid gap-5">
          <DialogHeader>
            <DialogTitle>{department ? `Edit ${department.name}` : "New department"}</DialogTitle>
            <DialogDescription>Departments own categories and employ staff.</DialogDescription>
          </DialogHeader>
          <FieldGroup>
            <Field data-invalid={!!errors.name}>
              <FieldLabel htmlFor="d-name">Name</FieldLabel>
              <Input id="d-name" aria-invalid={!!errors.name} {...form.register("name")} />
              <FieldError errors={[errors.name]} />
            </Field>
            <Field data-invalid={!!errors.description}>
              <FieldLabel htmlFor="d-desc">Description</FieldLabel>
              <Textarea id="d-desc" rows={3} {...form.register("description")} />
              <FieldError errors={[errors.description]} />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field data-invalid={!!errors.contactEmail}>
                <FieldLabel htmlFor="d-email">Contact email</FieldLabel>
                <Input id="d-email" type="email" aria-invalid={!!errors.contactEmail} {...form.register("contactEmail")} />
                <FieldError errors={[errors.contactEmail]} />
              </Field>
              <Field data-invalid={!!errors.contactPhone}>
                <FieldLabel htmlFor="d-phone">Contact phone</FieldLabel>
                <Input id="d-phone" type="tel" aria-invalid={!!errors.contactPhone} {...form.register("contactPhone")} />
                <FieldError errors={[errors.contactPhone]} />
              </Field>
            </div>
          </FieldGroup>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? <Spinner /> : null}
              {department ? "Save" : "Create department"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function DepartmentsAdmin() {
  const departments = useDepartments();
  const { deleteDepartment } = useCatalogMutations();

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <DepartmentDialog
          trigger={
            <Button>
              <Plus data-icon="inline-start" /> New department
            </Button>
          }
        />
      </div>
      {departments.isPending ? (
        <div className="grid gap-4 md:grid-cols-2">
          {Array.from({ length: 4 }, (_, i) => (
            <Skeleton key={i} className="h-40 rounded-xl" />
          ))}
        </div>
      ) : !departments.data?.length ? (
        <EmptyState icon={Building2} title="No departments yet" description="Create the first department to start routing requests." />
      ) : (
        <ul className="grid gap-4 md:grid-cols-2">
          {departments.data.map((d) => (
            <li key={d.id}>
              <Card className="h-full">
                <CardContent className="flex h-full flex-col gap-3 p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="flex size-10 items-center justify-center rounded-xl bg-primary/12 text-primary">
                        <Building2 className="size-5" aria-hidden="true" />
                      </span>
                      <div>
                        <h3 className="font-sans font-semibold">{d.name}</h3>
                        <p className="text-xs text-muted-foreground">{d._count?.categories ?? 0} categories</p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <DepartmentDialog
                        department={d}
                        trigger={
                          <Button variant="ghost" size="icon-sm" aria-label={`Edit ${d.name}`}>
                            <Pencil />
                          </Button>
                        }
                      />
                      <ConfirmDialog
                        trigger={
                          <Button variant="ghost" size="icon-sm" aria-label={`Delete ${d.name}`} className="text-destructive">
                            <Trash2 />
                          </Button>
                        }
                        title={`Delete ${d.name}?`}
                        description="Only possible when the department has no categories and no open requests. Its staff are detached."
                        confirmLabel="Delete department"
                        destructive
                        pending={deleteDepartment.isPending}
                        onConfirm={() => deleteDepartment.mutate(d.id)}
                      />
                    </div>
                  </div>
                  {d.description ? <p className="flex-1 text-sm text-muted-foreground">{d.description}</p> : <div className="flex-1" />}
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                    {d.contactEmail ? (
                      <span className="inline-flex items-center gap-1.5">
                        <Mail className="size-4" /> {d.contactEmail}
                      </span>
                    ) : null}
                    {d.contactPhone ? (
                      <span className="inline-flex items-center gap-1.5">
                        <Phone className="size-4" /> {d.contactPhone}
                      </span>
                    ) : null}
                  </div>
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ───────────────────────── Categories ─────────────────────────

const categorySchema = z
  .object({
    name: z.string().trim().min(2, "Name must be at least 2 characters").max(100),
    description: z.string().trim().max(500),
    type: z.enum(["COMPLAINT", "SERVICE"]),
    departmentId: z.string().min(1, "Choose the owning department"),
    slaHours: z.coerce.number<string>().int("Whole hours only").min(1, "At least 1 hour").max(720, "At most 720 hours (30 days)"),
    serviceFee: z.coerce.number<string>().min(0, "Fee cannot be negative").max(1_000_000),
    isActive: z.boolean(),
  })
  .refine((v) => !(v.type === "COMPLAINT" && v.serviceFee > 0), {
    path: ["serviceFee"],
    message: "Only SERVICE categories can have a fee",
  });
type CategoryValues = z.input<typeof categorySchema>;
type CategoryOutput = z.output<typeof categorySchema>;

function CategoryDialog({ category, trigger }: { category?: Category; trigger: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const departments = useDepartments();
  const { createCategory, updateCategory } = useCatalogMutations();
  const mutation = category ? updateCategory : createCategory;
  const defaults: CategoryValues = {
    name: category?.name ?? "",
    description: category?.description ?? "",
    type: category?.type ?? "COMPLAINT",
    departmentId: category?.department.id ?? "",
    slaHours: String(category?.slaHours ?? 72),
    serviceFee: String(Number(category?.serviceFee ?? 0)),
    isActive: category?.isActive ?? true,
  };
  const form = useForm<CategoryValues, unknown, CategoryOutput>({ resolver: zodResolver(categorySchema), defaultValues: defaults });
  const type = useWatch({ control: form.control, name: "type" });

  const submit = form.handleSubmit(async (v) => {
    const body = { ...v, name: v.name.trim(), description: v.description.trim() || undefined };
    try {
      if (category) await updateCategory.mutateAsync({ id: category.id, ...body });
      else await createCategory.mutateAsync(body);
      setOpen(false);
    } catch (err) {
      applyServerErrors(err, form.setError, ["name", "description", "type", "departmentId", "slaHours", "serviceFee"]);
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
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <form onSubmit={submit} noValidate className="grid gap-5">
          <DialogHeader>
            <DialogTitle>{category ? `Edit ${category.name}` : "New category"}</DialogTitle>
            <DialogDescription>The category decides the department, the SLA and whether a fee is charged.</DialogDescription>
          </DialogHeader>
          <FieldGroup className="max-h-[60vh] overflow-y-auto pe-1">
            <Field data-invalid={!!errors.name}>
              <FieldLabel htmlFor="c-name">Name</FieldLabel>
              <Input id="c-name" aria-invalid={!!errors.name} {...form.register("name")} />
              <FieldError errors={[errors.name]} />
            </Field>
            <Field>
              <FieldLabel htmlFor="c-desc">Description</FieldLabel>
              <Textarea id="c-desc" rows={2} {...form.register("description")} />
              <FieldError errors={[errors.description]} />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Controller
                control={form.control}
                name="type"
                render={({ field }) => (
                  <Field>
                    <FieldLabel htmlFor="c-type">Type</FieldLabel>
                    <Select
                      value={field.value}
                      onValueChange={(v) => {
                        field.onChange(v);
                        if (v === "COMPLAINT") form.setValue("serviceFee", "0", { shouldValidate: true });
                      }}
                    >
                      <SelectTrigger id="c-type" className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="COMPLAINT">Complaint (free)</SelectItem>
                        <SelectItem value="SERVICE">Service (paid)</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                )}
              />
              <Controller
                control={form.control}
                name="departmentId"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="c-dept">Department</FieldLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger id="c-dept" className="w-full" aria-invalid={fieldState.invalid}>
                        <SelectValue placeholder="Choose…" />
                      </SelectTrigger>
                      <SelectContent>
                        {(departments.data ?? []).map((d) => (
                          <SelectItem key={d.id} value={d.id}>
                            {d.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FieldError errors={[fieldState.error]} />
                  </Field>
                )}
              />
              <Field data-invalid={!!errors.slaHours}>
                <FieldLabel htmlFor="c-sla">Base SLA (hours)</FieldLabel>
                <Input id="c-sla" type="number" min={1} max={720} inputMode="numeric" aria-invalid={!!errors.slaHours} {...form.register("slaHours")} />
                <FieldDescription>Scaled by priority when a request is filed.</FieldDescription>
                <FieldError errors={[errors.slaHours]} />
              </Field>
              <Field data-invalid={!!errors.serviceFee}>
                <FieldLabel htmlFor="c-fee">Service fee (BDT)</FieldLabel>
                <Input
                  id="c-fee"
                  type="number"
                  min={0}
                  step="0.01"
                  inputMode="decimal"
                  disabled={type === "COMPLAINT"}
                  aria-invalid={!!errors.serviceFee}
                  {...form.register("serviceFee")}
                />
                <FieldError errors={[errors.serviceFee]} />
              </Field>
            </div>
            <Controller
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <Field orientation="horizontal">
                  <Switch id="c-active" checked={field.value} onCheckedChange={field.onChange} />
                  <FieldLabel htmlFor="c-active" className="font-normal">
                    Citizens can file new requests in this category
                  </FieldLabel>
                </Field>
              )}
            />
          </FieldGroup>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? <Spinner /> : null}
              {category ? "Save" : "Create category"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

const CAT_KEYS = ["type", "departmentId"] as const;

export function CategoriesAdmin() {
  const { values, update } = useUrlState(CAT_KEYS);
  const categories = useCategories();
  const departments = useDepartments();
  const { deleteCategory } = useCatalogMutations();

  const rows = useMemo(
    () =>
      (categories.data ?? []).filter(
        (c) => (!values.type || c.type === values.type) && (!values.departmentId || c.department.id === values.departmentId),
      ),
    [categories.data, values.type, values.departmentId],
  );

  const columns: Column<Category>[] = [
    {
      key: "name",
      header: "Category",
      className: "min-w-52",
      cell: (c) => (
        <div>
          <p className="font-medium">{c.name}</p>
          {c.description ? <p className="line-clamp-1 text-xs text-muted-foreground">{c.description}</p> : null}
        </div>
      ),
    },
    { key: "type", header: "Type", cell: (c) => <TypeBadge type={c.type} /> },
    { key: "dept", header: "Department", cell: (c) => <span className="text-sm">{c.department.name}</span> },
    { key: "sla", header: "Base SLA", cell: (c) => <span className="text-sm tabular-nums">{formatHours(c.slaHours)}</span> },
    {
      key: "fee",
      header: "Fee",
      cell: (c) => <span className="text-sm tabular-nums">{Number(c.serviceFee) > 0 ? formatMoney(c.serviceFee) : "Free"}</span>,
    },
    {
      key: "actions",
      header: <span className="sr-only">Actions</span>,
      className: "text-right",
      cell: (c) => (
        <div className="flex justify-end gap-1">
          <CategoryDialog
            category={c}
            trigger={
              <Button variant="ghost" size="icon-sm" aria-label={`Edit ${c.name}`}>
                <Pencil />
              </Button>
            }
          />
          <ConfirmDialog
            trigger={
              <Button variant="ghost" size="icon-sm" aria-label={`Delete ${c.name}`} className="text-destructive">
                <Trash2 />
              </Button>
            }
            title={`Delete ${c.name}?`}
            description="Existing requests keep their category; citizens can no longer pick it."
            confirmLabel="Delete category"
            destructive
            pending={deleteCategory.isPending}
            onConfirm={() => deleteCategory.mutate(c.id)}
          />
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col justify-between gap-2 sm:flex-row">
        <div className="flex flex-col gap-2 sm:flex-row">
          <FilterSelect
            label="Type"
            allLabel="All types"
            value={values.type}
            onChange={(type) => update({ type })}
            options={[
              { value: "COMPLAINT", label: "Complaints" },
              { value: "SERVICE", label: "Paid services" },
            ]}
          />
          <FilterSelect
            label="Department"
            allLabel="All departments"
            value={values.departmentId}
            onChange={(departmentId) => update({ departmentId })}
            options={(departments.data ?? []).map((d) => ({ value: d.id, label: d.name }))}
            className="sm:w-56"
          />
        </div>
        <CategoryDialog
          trigger={
            <Button>
              <Plus data-icon="inline-start" /> New category
            </Button>
          }
        />
      </div>
      <DataTable
        columns={columns}
        rows={categories.data ? rows : undefined}
        rowKey={(c) => c.id}
        isLoading={categories.isPending}
        empty={{ icon: Tags, title: "No categories match", description: "Create one or change the filters." }}
        mobileCard={(c) => (
          <div className="rounded-xl border bg-card p-4">
            <div className="flex items-start justify-between gap-2">
              <p className="font-medium">{c.name}</p>
              <TypeBadge type={c.type} />
            </div>
            <p className="text-xs text-muted-foreground">{c.department.name}</p>
            <div className="mt-3 flex items-center justify-between text-sm">
              <span>
                {formatHours(c.slaHours)} · {Number(c.serviceFee) > 0 ? formatMoney(c.serviceFee) : "Free"}
              </span>
              <CategoryDialog
                category={c}
                trigger={
                  <Button variant="outline" size="sm">
                    <Pencil data-icon="inline-start" /> Edit
                  </Button>
                }
              />
            </div>
          </div>
        )}
      />
      <p className="text-xs text-muted-foreground">Deactivated categories are hidden from this list and from citizens.</p>
    </div>
  );
}
