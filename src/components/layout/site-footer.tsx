import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { PUBLIC_NAV } from "./nav-config";

const accountLinks = [
  { href: "/login", label: "Log in" },
  { href: "/register", label: "Create account" },
  { href: "/dashboard/requests/new", label: "Report an issue" },
];

export function SiteFooter() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-[2fr_1fr_1fr] lg:px-8">
        <div className="max-w-sm">
          <Logo />
          <p className="mt-3 text-sm text-muted-foreground">
            A single front door to your city. Report problems, apply for municipal services and follow every request
            until it is fixed.
          </p>
        </div>
        <div>
          <h2 className="font-sans text-sm font-semibold">Explore</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {PUBLIC_NAV.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="text-muted-foreground hover:text-foreground">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="font-sans text-sm font-semibold">Account</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {accountLinks.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="text-muted-foreground hover:text-foreground">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="border-t">
        <p className="mx-auto max-w-7xl px-4 py-5 text-xs text-muted-foreground sm:px-6 lg:px-8">
          CityFix · City Complaint & Service Platform. Payments are processed by Stripe in test mode.
        </p>
      </div>
    </footer>
  );
}
