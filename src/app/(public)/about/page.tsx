import { Building2, Eye, Gauge, Mail, Scale } from "lucide-react";
import type { Metadata } from "next";
import { Suspense } from "react";
import { PageHero } from "@/components/public/page-hero";
import { Skeleton } from "@/components/ui/skeleton";
import { getDepartments } from "@/lib/api/server";

export const metadata: Metadata = {
  title: "About CityFix",
  description:
    "Why CityFix exists, how requests are routed to departments, and the principles behind SLA tracking and transparency.",
  alternates: { canonical: "/about" },
  openGraph: { title: "About CityFix", url: "/about" },
};

const principles = [
  {
    icon: Gauge,
    title: "Every request has a deadline",
    body: "An SLA is computed from the category and priority the moment a request is filed, and overdue work is surfaced to administrators.",
  },
  {
    icon: Eye,
    title: "Transparent by default",
    body: "Anyone can follow a request with its tracking code, and aggregate performance numbers are published on the home page.",
  },
  {
    icon: Scale,
    title: "Fair and accountable",
    body: "Status changes, assignments, payments and refunds are written to an audit log in the same transaction as the change itself.",
  },
];

async function Departments() {
  const departments = await getDepartments();
  if (departments.length === 0) return <p className="text-muted-foreground">Department list unavailable right now.</p>;
  return (
    <ul className="grid gap-4 sm:grid-cols-2">
      {departments.map((d) => (
        <li key={d.id} className="rounded-2xl border bg-card p-5">
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-xl bg-primary/12 text-primary">
              <Building2 className="size-5" aria-hidden="true" />
            </span>
            <div>
              <h3 className="font-sans font-semibold">{d.name}</h3>
              <p className="text-xs text-muted-foreground">{d._count?.categories ?? 0} request categories</p>
            </div>
          </div>
          {d.description ? <p className="mt-3 text-sm text-muted-foreground">{d.description}</p> : null}
          {d.contactEmail ? (
            <a
              href={`mailto:${d.contactEmail}`}
              className="mt-3 inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
            >
              <Mail className="size-4" aria-hidden="true" /> {d.contactEmail}
            </a>
          ) : null}
        </li>
      ))}
    </ul>
  );
}

export default function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="About"
        title="A single front door to city services"
        description="Citizens shouldn't need to know which office handles a broken drain. CityFix takes the report, routes it, and keeps everyone honest about the deadline."
      />
      <section className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-4 md:grid-cols-3">
          {principles.map(({ icon: Icon, title, body }) => (
            <div key={title} className="rounded-2xl border bg-card p-6">
              <Icon className="size-6 text-primary" aria-hidden="true" />
              <h2 className="mt-3 font-sans text-lg font-semibold">{title}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{body}</p>
            </div>
          ))}
        </div>
      </section>
      <section className="border-t bg-muted/30">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1fr_2fr] lg:px-8">
          <div>
            <h2 className="text-2xl font-semibold sm:text-3xl">The departments behind it</h2>
            <p className="mt-2 text-muted-foreground">
              Each category belongs to exactly one department. Staff only see their own department&apos;s queue, and
              can hold up to 10 active requests at a time so work stays evenly spread.
            </p>
          </div>
          <Suspense
            fallback={
              <div className="grid gap-4 sm:grid-cols-2">
                {Array.from({ length: 4 }, (_, i) => (
                  <Skeleton key={i} className="h-36 rounded-2xl" />
                ))}
              </div>
            }
          >
            <Departments />
          </Suspense>
        </div>
      </section>
    </>
  );
}
