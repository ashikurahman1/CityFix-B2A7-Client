import { ArrowRight, Building2, CreditCard, Lock, Mail, MapPin, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { getDepartments } from "@/lib/api/server";
import { PUBLIC_NAV } from "./nav-config";

const accountLinks = [
  { href: "/login", label: "Log in" },
  { href: "/register", label: "Create account" },
  { href: "/dashboard/requests/new", label: "Report an issue" },
  { href: "/track", label: "Track a request" },
];

const badges = [
  { icon: CreditCard, label: "Payments by Stripe" },
  { icon: Lock, label: "httpOnly sessions" },
  { icon: ShieldCheck, label: "Full audit trail" },
];

/** Department desks straight from GET /departments (cached with `use cache`). */
async function DepartmentLinks() {
  const departments = await getDepartments();
  if (departments.length === 0) return <p className="text-sm text-white/60">Directory unavailable.</p>;
  return (
    <ul className="space-y-3">
      {departments.slice(0, 5).map((d) => (
        <li key={d.id}>
          <p className="flex items-center gap-2 text-sm font-medium text-white">
            <Building2 className="size-3.5 text-warning" aria-hidden="true" /> {d.name}
          </p>
          {d.contactEmail ? (
            <a
              href={`mailto:${d.contactEmail}`}
              className="ms-5.5 inline-flex items-center gap-1.5 text-xs text-white/60 hover:text-white"
            >
              <Mail className="size-3" aria-hidden="true" /> {d.contactEmail}
            </a>
          ) : null}
        </li>
      ))}
    </ul>
  );
}

function FooterHeading({ children }: { children: React.ReactNode }) {
  return <h2 className="font-sans text-xs font-semibold tracking-[0.14em] text-white/50 uppercase">{children}</h2>;
}

export function SiteFooter() {
  return (
    <footer className="bg-brand relative mt-auto overflow-hidden text-white">
      <div className="absolute -top-40 -right-40 size-[30rem] rounded-full border-[70px] border-white/[0.04]" aria-hidden="true" />
      <div className="absolute -bottom-48 -left-32 size-[26rem] rounded-full border-[60px] border-white/[0.04]" aria-hidden="true" />

      {/* CTA strip */}
      <div className="relative border-b border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 px-4 py-10 sm:px-6 md:flex-row md:items-center lg:px-8">
          <div>
            <p className="text-sm font-semibold text-warning">Something broken near you?</p>
            <p className="mt-1 font-heading text-2xl font-semibold sm:text-3xl">It takes less than a minute to report it.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button asChild size="lg" className="h-11 bg-white px-6 text-primary hover:bg-white/90">
              <Link href="/dashboard/requests/new">
                Report an issue <ArrowRight data-icon="inline-end" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="ghost"
              className="h-11 px-6 text-white ring-1 ring-white/25 hover:bg-white/10 hover:text-white"
            >
              <Link href="/track">Track a request</Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Columns */}
      <div className="relative mx-auto grid max-w-7xl gap-12 px-4 py-14 sm:px-6 md:grid-cols-2 lg:grid-cols-[1.4fr_0.8fr_0.8fr_1.3fr] lg:px-8">
        <div className="max-w-sm">
          <Logo inverted />
          <p className="mt-4 text-sm leading-relaxed text-white/70">
            A single front door to your city. Report problems, apply for municipal services and follow every request
            against its SLA until it is fixed.
          </p>
          <p className="mt-4 flex items-center gap-2 text-sm text-white/70">
            <MapPin className="size-4 text-warning" aria-hidden="true" /> Serving 4 city departments
          </p>
          <ul className="mt-6 flex flex-wrap gap-2">
            {badges.map(({ icon: Icon, label }) => (
              <li
                key={label}
                className="inline-flex items-center gap-1.5 rounded-full bg-white/8 px-3 py-1.5 text-xs text-white/80 ring-1 ring-white/12"
              >
                <Icon className="size-3.5 text-warning" aria-hidden="true" /> {label}
              </li>
            ))}
          </ul>
        </div>

        <nav aria-label="Explore">
          <FooterHeading>Explore</FooterHeading>
          <ul className="mt-4 space-y-2.5 text-sm">
            <li>
              <Link href="/" className="text-white/75 transition-colors hover:text-white">
                Home
              </Link>
            </li>
            {PUBLIC_NAV.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="text-white/75 transition-colors hover:text-white">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Account">
          <FooterHeading>Account</FooterHeading>
          <ul className="mt-4 space-y-2.5 text-sm">
            {accountLinks.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="text-white/75 transition-colors hover:text-white">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <FooterHeading>Department desks</FooterHeading>
          <div className="mt-4">
            <Suspense fallback={<div className="h-40 animate-pulse rounded-xl bg-white/5" />}>
              <DepartmentLinks />
            </Suspense>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="relative border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-6 text-xs text-white/55 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <p>CityFix · City Complaint & Service Platform</p>
          <p>Stripe runs in test mode · use card 4242 4242 4242 4242</p>
        </div>
      </div>
    </footer>
  );
}
