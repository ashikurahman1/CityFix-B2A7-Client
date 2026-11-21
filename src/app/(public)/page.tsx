import {
  ArrowRight,
  BadgeCheck,
  BellRing,
  Building2,
  CheckCircle2,
  ClipboardCheck,
  Clock,
  CreditCard,
  MapPin,
  ShieldCheck,
  Sparkles,
  Wrench,
} from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { CategoryCard } from "@/components/public/category-card";
import { DepartmentShowcase, FaqTeaser, FeatureBento } from "@/components/public/home-sections";
import { PublicStats, PublicStatsSkeleton } from "@/components/public/public-stats";
import { TrackForm } from "@/components/public/track-form";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getCategories } from "@/lib/api/server";
import { cn } from "@/lib/utils";

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
    tone: "bg-primary text-primary-foreground",
  },
  {
    icon: Building2,
    title: "Routed automatically",
    body: "The category decides the department and the SLA deadline. Urgent issues get a tighter clock.",
    tone: "bg-info text-white",
  },
  {
    icon: Wrench,
    title: "Staff take ownership",
    body: "Department staff claim the job, post updates and resolve it with a note you can read.",
    tone: "bg-warning text-foreground",
  },
  {
    icon: ClipboardCheck,
    title: "You close the loop",
    body: "Rate the fix to close it, or reopen within 7 days if the problem came back.",
    tone: "bg-success text-white",
  },
];

const roles = [
  {
    icon: BellRing,
    title: "Citizens",
    tag: "Report & follow",
    points: ["File complaints in under a minute", "Pay service fees online with Stripe", "Track progress with a public code"],
    accent: "from-primary/20 to-primary/0",
    iconTone: "bg-primary/15 text-primary",
  },
  {
    icon: Wrench,
    title: "Department staff",
    tag: "Claim & resolve",
    points: ["A focused queue for your department", "Claim, update and resolve work", "Internal notes stay internal"],
    accent: "from-warning/25 to-warning/0",
    iconTone: "bg-warning/20 text-[color-mix(in_oklch,var(--warning)_65%,var(--foreground))]",
  },
  {
    icon: ShieldCheck,
    title: "City administrators",
    tag: "Oversee & audit",
    points: ["Live SLA and workload analytics", "Assign, reject and refund", "Full audit trail of every change"],
    accent: "from-info/20 to-info/0",
    iconTone: "bg-info/15 text-info",
  },
];

async function PopularServices() {
  const categories = await getCategories();
  if (categories.length === 0) {
    return <p className="text-muted-foreground">The service catalogue is temporarily unavailable.</p>;
  }
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {categories.slice(0, 6).map((c) => (
        <CategoryCard key={c.id} category={c} />
      ))}
    </div>
  );
}

function FloatingCard({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div
      className={cn(
        "absolute z-10 hidden items-center gap-3 rounded-2xl border bg-card/95 px-4 py-3 shadow-soft backdrop-blur sm:flex",
        className,
      )}
      aria-hidden="true"
    >
      {children}
    </div>
  );
}

function SectionHeading({ id, eyebrow, title, description }: { id?: string; eyebrow: string; title: string; description?: string }) {
  return (
    <div className="max-w-2xl">
      <p className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
        <Sparkles className="size-4" aria-hidden="true" /> {eyebrow}
      </p>
      <h2 id={id} className="mt-2 text-3xl font-semibold text-balance sm:text-4xl">{title}</h2>
      {description ? <p className="mt-3 text-lg text-muted-foreground">{description}</p> : null}
    </div>
  );
}

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-mesh relative overflow-hidden border-b">
        <div className="bg-grid pointer-events-none absolute inset-0 opacity-60 [mask-image:linear-gradient(to_bottom,black,transparent)]" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-4 py-16 sm:px-6 md:py-24 lg:grid-cols-[1.05fr_1fr] lg:px-8">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-card/80 px-3 py-1.5 text-xs font-semibold text-primary shadow-sm backdrop-blur">
              <span className="relative flex size-2">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-success opacity-70" />
                <span className="relative inline-flex size-2 rounded-full bg-success" />
              </span>
              Live for 4 city departments
            </p>
            <h1 className="mt-6 text-5xl leading-[1.02] font-bold text-balance sm:text-6xl lg:text-7xl">
              Your city, <span className="bg-gradient-to-r from-primary via-[oklch(0.6_0.13_160)] to-warning bg-clip-text text-transparent">fixed faster.</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg text-pretty text-muted-foreground sm:text-xl">
              Report a pothole, a dark street light or a missed garbage pickup, or apply for a municipal service.
              CityFix sends it to the right team and holds them to a deadline.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" className="h-12 px-7 text-base shadow-lg shadow-primary/25">
                <Link href="/dashboard/requests/new">
                  Report an issue
                  <ArrowRight data-icon="inline-end" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-12 bg-card/80 px-7 text-base backdrop-blur">
                <Link href="/services">Browse services</Link>
              </Button>
            </div>
            <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
              {["Free to report", "SLA on every request", "Secure Stripe payments"].map((t) => (
                <li key={t} className="inline-flex items-center gap-1.5">
                  <CheckCircle2 className="size-4 text-success" aria-hidden="true" /> {t}
                </li>
              ))}
            </ul>
            <div className="mt-10 max-w-lg rounded-2xl border bg-card/90 p-4 shadow-soft backdrop-blur">
              <p className="mb-3 text-sm font-semibold">Already reported something? Track it without logging in.</p>
              <TrackForm />
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-xl">
            <div className="absolute -inset-6 -z-10 rounded-[2.5rem] bg-gradient-to-br from-primary/25 via-transparent to-warning/25 blur-2xl" />
            <div className="overflow-hidden rounded-[2rem] border bg-card p-3 shadow-2xl shadow-primary/15">
              <Image
                src="/illustrations/city.svg"
                alt="Illustrated city block where a pothole and a street light are being repaired"
                width={640}
                height={480}
                priority
                className="h-auto w-full rounded-[1.5rem]"
              />
            </div>
            <FloatingCard className="animate-float -top-6 -left-8">
              <span className="flex size-10 items-center justify-center rounded-xl bg-success/15 text-success">
                <BadgeCheck className="size-5" />
              </span>
              <div>
                <p className="text-sm font-semibold">Pothole fixed</p>
                <p className="text-xs text-muted-foreground">Resolved in 18 h · Roads</p>
              </div>
            </FloatingCard>
            <FloatingCard className="animate-float-delayed top-1/2 -right-8">
              <span className="flex size-10 items-center justify-center rounded-xl bg-warning/20 text-[color-mix(in_oklch,var(--warning)_65%,var(--foreground))]">
                <Clock className="size-5" />
              </span>
              <div>
                <p className="text-sm font-semibold">SLA on track</p>
                <p className="text-xs text-muted-foreground">Street light · 22 h left</p>
              </div>
            </FloatingCard>
            <FloatingCard className="animate-float -bottom-6 left-10">
              <span className="flex size-10 items-center justify-center rounded-xl bg-info/15 text-info">
                <CreditCard className="size-5" />
              </span>
              <div>
                <p className="text-sm font-semibold">Fee paid via Stripe</p>
                <p className="text-xs text-muted-foreground">Trade licence · routed</p>
              </div>
            </FloatingCard>
          </div>
        </div>
      </section>

      {/* Stats band */}
      <section aria-labelledby="stats-title" className="bg-brand relative overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="mb-8 flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
            <div>
              <p className="text-sm font-semibold text-warning">Transparency</p>
              <h2 id="stats-title" className="mt-1 text-3xl font-semibold text-white sm:text-4xl">
                Open by default
              </h2>
            </div>
            <p className="max-w-md text-white/75">Live, anonymous numbers straight from the CityFix API.</p>
          </div>
          <Suspense fallback={<PublicStatsSkeleton />}>
            <PublicStats />
          </Suspense>
        </div>
      </section>

      {/* How it works */}
      <section aria-labelledby="how-title" className="mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <SectionHeading id="how-title" eyebrow="How it works" title="From report to resolution in four steps" />
        <ol className="relative mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <span
            className="absolute top-7 right-[12%] left-[12%] hidden h-0.5 bg-gradient-to-r from-primary via-warning to-success lg:block"
            aria-hidden="true"
          />
          {steps.map(({ icon: Icon, title, body, tone }, i) => (
            <li key={title} className="relative">
              <span
                className={cn(
                  "relative z-10 flex size-14 items-center justify-center rounded-2xl shadow-lg ring-4 ring-background",
                  tone,
                )}
              >
                <Icon className="size-6" aria-hidden="true" />
              </span>
              <p className="mt-5 font-mono text-xs font-semibold text-muted-foreground">STEP 0{i + 1}</p>
              <h3 className="mt-1 font-sans text-lg font-semibold">{title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{body}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Features */}
      <section aria-labelledby="features-title" className="mx-auto w-full max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="mb-10">
          <SectionHeading
            id="features-title"
            eyebrow="Why CityFix"
            title="Built for follow-through, not just filing"
            description="Most complaint boxes stop at submit. CityFix keeps a deadline, an owner and a paper trail on every request."
          />
        </div>
        <FeatureBento />
      </section>

      {/* Services */}
      <section aria-labelledby="services-title" className="border-y bg-muted/40">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="mb-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <SectionHeading
              id="services-title"
              eyebrow="Services"
              title="What you can report"
              description="Complaints are free. Paid services show their fee up front."
            />
            <Button asChild variant="outline" className="bg-card">
              <Link href="/services">
                All services <ArrowRight data-icon="inline-end" />
              </Link>
            </Button>
          </div>
          <Suspense
            fallback={
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }, (_, i) => (
                  <Skeleton key={i} className="h-48 rounded-2xl" />
                ))}
              </div>
            }
          >
            <PopularServices />
          </Suspense>
        </div>
      </section>

      {/* Roles */}
      <section aria-labelledby="roles-title" className="mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <SectionHeading id="roles-title" eyebrow="Built for everyone" title="One platform, three workspaces" />
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {roles.map(({ icon: Icon, title, tag, points, accent, iconTone }) => (
            <div key={title} className="relative overflow-hidden rounded-3xl border bg-card p-7 shadow-soft">
              <div className={cn("absolute inset-x-0 top-0 h-32 bg-gradient-to-b", accent)} aria-hidden="true" />
              <div className="relative">
                <span className={cn("flex size-12 items-center justify-center rounded-2xl", iconTone)}>
                  <Icon className="size-6" aria-hidden="true" />
                </span>
                <p className="mt-5 text-xs font-semibold tracking-wider text-muted-foreground uppercase">{tag}</p>
                <h3 className="mt-1 font-sans text-xl font-semibold">{title}</h3>
                <ul className="mt-4 space-y-2.5 text-sm">
                  {points.map((p) => (
                    <li key={p} className="flex gap-2.5">
                      <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success" aria-hidden="true" />
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Departments */}
      <section aria-labelledby="dept-title" className="border-y bg-muted/40">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="mb-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <SectionHeading
              id="dept-title"
              eyebrow="Departments"
              title="The teams behind every fix"
              description="Requests are routed by category straight to the department that owns it."
            />
            <Button asChild variant="outline" className="bg-card">
              <Link href="/about">
                About CityFix <ArrowRight data-icon="inline-end" />
              </Link>
            </Button>
          </div>
          <Suspense
            fallback={
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {Array.from({ length: 4 }, (_, i) => (
                  <Skeleton key={i} className="h-56 rounded-3xl" />
                ))}
              </div>
            }
          >
            <DepartmentShowcase />
          </Suspense>
        </div>
      </section>

      {/* FAQ */}
      <section aria-label="Frequently asked questions" className="mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <FaqTeaser />
      </section>
    </>
  );
}
