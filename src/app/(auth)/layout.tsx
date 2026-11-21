import { CheckCircle2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { ThemeToggle } from "@/components/shared/theme-toggle";

const points = [
  "Every request is routed to the right department automatically",
  "SLA deadlines keep work moving and overdue items visible",
  "Pay municipal service fees securely with Stripe",
];

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-[1.05fr_1fr]">
      <aside className="relative hidden flex-col justify-between overflow-hidden bg-primary p-10 text-primary-foreground lg:flex">
        <Logo className="text-primary-foreground [&_span_span]:text-warning" />
        <div className="relative z-10 max-w-md">
          <h2 className="text-4xl leading-tight font-semibold">Report it once. Watch it get fixed.</h2>
          <ul className="mt-8 space-y-4">
            {points.map((p) => (
              <li key={p} className="flex gap-3 text-primary-foreground/90">
                <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-warning" aria-hidden="true" />
                {p}
              </li>
            ))}
          </ul>
        </div>
        <Image
          src="/illustrations/city.svg"
          alt=""
          width={640}
          height={480}
          className="pointer-events-none absolute -right-24 -bottom-16 w-[560px] rotate-[-4deg] opacity-25"
        />
        <p className="relative z-10 text-sm text-primary-foreground/70">CityFix · City Complaint & Service Platform</p>
      </aside>
      <div className="flex flex-col">
        <header className="flex items-center justify-between p-4 sm:p-6">
          <div className="lg:invisible">
            <Logo />
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Link href="/" className="text-muted-foreground hover:text-foreground">
              Back to site
            </Link>
            <ThemeToggle />
          </div>
        </header>
        <main id="main" className="flex flex-1 items-start justify-center px-4 pt-4 pb-16 sm:items-center sm:px-6">
          <div className="w-full max-w-md">{children}</div>
        </main>
      </div>
    </div>
  );
}
