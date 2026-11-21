import { ArrowRight, BellRing, Building2, ClipboardCheck, CreditCard, MapPin, ShieldCheck, Wrench } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { CategoryCard } from "@/components/public/category-card";
import { PublicStats, PublicStatsSkeleton } from "@/components/public/public-stats";
import { TrackForm } from "@/components/public/track-form";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getCategories } from "@/lib/api/server";

export const metadata: Metadata = {
  title: { absolute: "CityFix — Report city problems, track every fix" },
  description:
    "Report potholes, broken street lights and missed garbage pickups, or apply for paid municipal services. CityFix routes every request to the right department and tracks it against an SLA.",
  alternates: { canonical: "/" },
};

const steps = [
  {
    icon: MapPin,
    title: "Report it",
    body: "Pick a category, describe the problem, add the address and photos. Paid services are settled securely with Stripe.",
  },
  {
    icon: Building2,
    title: "Routed automatically",
    body: "The category decides the department and the SLA deadline. Urgent issues get a tighter clock.",
  },
  {
    icon: Wrench,
    title: "Staff take ownership",
    body: "Department staff claim the job, post updates and resolve it with a note you can read.",
  },
  {
    icon: ClipboardCheck,
    title: "You close the loop",
    body: "Rate the fix to close it, or reopen within 7 days if the problem came back.",
  },
];

const roles = [
  {
    icon: BellRing,
    title: "Citizens",
    points: ["File complaints in under a minute", "Pay service fees online", "Follow progress with a tracking code"],
  },
  {
    icon: Wrench,
    title: "Department staff",
    points: ["A focused queue for your department", "Claim, update and resolve work", "Internal notes stay internal"],
  },
  {
    icon: ShieldCheck,
    title: "City administrators",
    points: ["Live SLA and workload analytics", "Assign, reject and refund", "Full audit trail of every change"],
  },
];

async function PopularServices() {
  const categories = await getCategories();
  if (categories.length === 0) {
    return <p className="text-muted-foreground">The service catalogue is temporarily unavailable.</p>;
  }
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {categories.slice(0, 6).map((c) => (
        <CategoryCard key={c.id} category={c} />
      ))}
    </div>
  );
}

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-grid relative overflow-hidden border-b">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-14 sm:px-6 md:py-20 lg:grid-cols-2 lg:px-8">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
              <span className="size-2 rounded-full bg-success" aria-hidden="true" />
              Live for 4 city departments
            </p>
            <h1 className="mt-5 text-4xl leading-[1.05] font-semibold text-balance sm:text-5xl lg:text-6xl">
              Your city, fixed <span className="text-primary">faster</span>.
            </h1>
            <p className="mt-5 max-w-xl text-lg text-pretty text-muted-foreground">
              Report a pothole, a dark street light or a missed garbage pickup, or apply for a municipal service.
              CityFix sends it to the right team and holds them to a deadline.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" className="h-11 px-6">
                <Link href="/dashboard/requests/new">
                  Report an issue
                  <ArrowRight data-icon="inline-end" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-11 bg-card px-6">
                <Link href="/services">Browse services</Link>
              </Button>
            </div>
            <div className="mt-10 max-w-lg rounded-2xl border bg-card p-4 shadow-sm">
              <p className="mb-3 text-sm font-medium">Already reported something? Track it without logging in.</p>
              <TrackForm />
            </div>
          </div>
          <div className="relative mx-auto w-full max-w-xl">
            <Image
              src="/illustrations/city.svg"
              alt="Illustrated city block where a pothole and a street light are being repaired"
              width={640}
              height={480}
              priority
              className="h-auto w-full drop-shadow-xl"
            />
          </div>
        </div>
      </section>

      {/* Stats */}
      <section aria-labelledby="stats-title" className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
          <div>
            <h2 id="stats-title" className="text-2xl font-semibold sm:text-3xl">
              Open by default
            </h2>
            <p className="mt-1 text-muted-foreground">Live, anonymous numbers straight from the CityFix API.</p>
          </div>
        </div>
        <Suspense fallback={<PublicStatsSkeleton />}>
          <PublicStats />
        </Suspense>
      </section>

      {/* How it works */}
      <section aria-labelledby="how-title" className="border-y bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <h2 id="how-title" className="text-2xl font-semibold sm:text-3xl">
            How a request moves through the city
          </h2>
          <ol className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map(({ icon: Icon, title, body }, i) => (
              <li key={title} className="relative rounded-2xl border bg-card p-6">
                <span className="absolute top-5 right-5 font-mono text-sm text-muted-foreground">0{i + 1}</span>
                <span className="flex size-11 items-center justify-center rounded-xl bg-primary/12 text-primary">
                  <Icon className="size-5" aria-hidden="true" />
                </span>
                <h3 className="mt-4 font-sans text-base font-semibold">{title}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground">{body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Services */}
      <section aria-labelledby="services-title" className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <h2 id="services-title" className="text-2xl font-semibold sm:text-3xl">
              What you can report
            </h2>
            <p className="mt-1 text-muted-foreground">Complaints are free. Paid services show their fee up front.</p>
          </div>
          <Button asChild variant="outline">
            <Link href="/services">
              All services <ArrowRight data-icon="inline-end" />
            </Link>
          </Button>
        </div>
        <Suspense
          fallback={
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }, (_, i) => (
                <Skeleton key={i} className="h-44 rounded-2xl" />
              ))}
            </div>
          }
        >
          <PopularServices />
        </Suspense>
      </section>

      {/* Roles */}
      <section aria-labelledby="roles-title" className="border-t bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <h2 id="roles-title" className="text-2xl font-semibold sm:text-3xl">
            One platform, three workspaces
          </h2>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {roles.map(({ icon: Icon, title, points }) => (
              <div key={title} className="rounded-2xl border bg-card p-6">
                <Icon className="size-6 text-primary" aria-hidden="true" />
                <h3 className="mt-3 font-sans text-lg font-semibold">{title}</h3>
                <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                  {points.map((p) => (
                    <li key={p} className="flex gap-2">
                      <span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" aria-hidden="true" />
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex flex-col items-start justify-between gap-6 rounded-3xl bg-primary p-8 text-primary-foreground sm:p-12 md:flex-row md:items-center">
          <div>
            <h2 className="text-2xl font-semibold sm:text-3xl">Spotted something broken?</h2>
            <p className="mt-2 max-w-xl opacity-85">
              Create a free account and file your first request. Paying for a service takes one Stripe checkout.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button asChild size="lg" variant="secondary" className="h-11">
              <Link href="/register">Create account</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="ghost"
              className="h-11 text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
            >
              <Link href="/login">
                <CreditCard data-icon="inline-start" /> Try a demo account
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
