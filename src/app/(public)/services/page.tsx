import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { PageHero } from "@/components/public/page-hero";
import { ServiceCatalog } from "@/components/public/service-catalog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getCategories } from "@/lib/api/server";

export const metadata: Metadata = {
  title: "Services & fees",
  description:
    "Every complaint category and municipal service CityFix handles, with the responsible department, SLA deadline and service fee.",
  alternates: { canonical: "/services" },
  openGraph: { title: "CityFix services & fees", url: "/services" },
};

async function Catalog() {
  const categories = await getCategories();
  return <ServiceCatalog categories={categories} />;
}

function CatalogSkeleton() {
  return (
    <div>
      <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:justify-between">
        <Skeleton className="h-9 w-80" />
        <Skeleton className="h-9 w-full max-w-md" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }, (_, i) => (
          <Skeleton key={i} className="h-44 rounded-2xl" />
        ))}
      </div>
    </div>
  );
}

export default function ServicesPage() {
  return (
    <>
      <PageHero
        eyebrow="Services"
        title="Everything the city can fix for you"
        description="Complaints are always free to file. Municipal services carry a fixed fee that you pay online before the request is routed."
      />
      <section className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <Suspense fallback={<CatalogSkeleton />}>
          <Catalog />
        </Suspense>
        <div className="mt-12 flex flex-col items-start justify-between gap-4 rounded-2xl border bg-muted/30 p-6 sm:flex-row sm:items-center">
          <div>
            <h2 className="font-sans text-lg font-semibold">How SLA deadlines work</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Each category has a base SLA. Priority adjusts it: Urgent ×0.25, High ×0.5, Medium ×1, Low ×1.5. For
              paid services the clock starts once payment is confirmed.
            </p>
          </div>
          <Button asChild>
            <Link href="/dashboard/requests/new">Start a request</Link>
          </Button>
        </div>
      </section>
    </>
  );
}
