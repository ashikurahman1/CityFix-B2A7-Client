"use client";

import { SearchX } from "lucide-react";
import { useMemo } from "react";
import { EmptyState } from "@/components/shared/empty-state";
import { FilterSelect } from "@/components/shared/filter-select";
import { SearchInput } from "@/components/shared/search-input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useUrlState } from "@/hooks/use-url-state";
import type { Category } from "@/types/api";
import { CategoryCard } from "./category-card";

const KEYS = ["type", "department", "q"] as const;

/** Filterable catalogue. The filters live in the URL: /services?type=SERVICE&department=… */
export function ServiceCatalog({ categories }: { categories: Category[] }) {
  const { values, update, reset, activeCount } = useUrlState(KEYS);

  const departments = useMemo(() => {
    const map = new Map(categories.map((c) => [c.department.id, c.department.name]));
    return [...map].map(([value, label]) => ({ value, label })).sort((a, b) => a.label.localeCompare(b.label));
  }, [categories]);

  const filtered = useMemo(() => {
    const q = values.q?.toLowerCase();
    return categories.filter(
      (c) =>
        (!values.type || c.type === values.type) &&
        (!values.department || c.department.id === values.department) &&
        (!q || c.name.toLowerCase().includes(q) || c.description?.toLowerCase().includes(q)),
    );
  }, [categories, values]);

  return (
    <div>
      <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <Tabs value={values.type ?? "ALL"} onValueChange={(v) => update({ type: v === "ALL" ? undefined : v })}>
          <TabsList>
            <TabsTrigger value="ALL">All</TabsTrigger>
            <TabsTrigger value="COMPLAINT">Free complaints</TabsTrigger>
            <TabsTrigger value="SERVICE">Paid services</TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="flex flex-col gap-2 sm:flex-row">
          <SearchInput value={values.q} onChange={(q) => update({ q })} placeholder="Search services" minLength={1} />
          <FilterSelect
            label="Department"
            allLabel="All departments"
            value={values.department}
            onChange={(department) => update({ department })}
            options={departments}
            className="sm:w-56"
          />
        </div>
      </div>

      <p className="mb-4 text-sm text-muted-foreground" aria-live="polite">
        {filtered.length} of {categories.length} services
      </p>

      {filtered.length === 0 ? (
        <EmptyState
          icon={SearchX}
          title="No services match these filters"
          description="Try another department or clear the search."
          action={
            activeCount > 0 ? (
              <Button variant="outline" onClick={reset}>
                Clear filters
              </Button>
            ) : null
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((c) => (
            <CategoryCard key={c.id} category={c} />
          ))}
        </div>
      )}
    </div>
  );
}
