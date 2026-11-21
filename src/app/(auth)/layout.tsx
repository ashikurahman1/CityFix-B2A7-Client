import { BadgeCheck, CheckCircle2, Clock } from "lucide-react";
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
    <div className="grid min-h-screen lg:grid-cols-[1fr_1fr]">
      <aside className="bg-brand sticky top-0 hidden h-screen flex-col justify-between overflow-hidden p-10 text-white lg:flex xl:p-14">
        <div className="absolute -top-32 -right-32 size-96 rounded-full border-[56px] border-white/5" aria-hidden="true" />
        <div className="absolute -bottom-40 -left-24 size-[28rem] rounded-full border-[64px] border-white/5" aria-hidden="true" />

        <Logo inverted className="relative" />

        <div className="relative max-w-md">
          <h2 className="text-4xl leading-tight font-semibold text-white xl:text-5xl">
            Report it once.
            <br />
            <span className="text-warning">Watch it get fixed.</span>
          </h2>
          <ul className="mt-8 space-y-4">
            {points.map((p) => (
              <li key={p} className="flex gap-3 text-white/85">
                <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-warning" aria-hidden="true" />
                {p}
              </li>
            ))}
          </ul>

          <div className="mt-10 space-y-3" aria-hidden="true">
            <div className="animate-float flex w-fit items-center gap-3 rounded-2xl bg-white/10 px-4 py-3 ring-1 ring-white/15 backdrop-blur">
              <span className="flex size-9 items-center justify-center rounded-xl bg-success/25">
                <BadgeCheck className="size-5 text-white" />
              </span>
              <div>
                <p className="text-sm font-semibold">Broken street light resolved</p>
                <p className="text-xs text-white/70">Roads & Infrastructure · within SLA</p>
              </div>
            </div>
            <div className="animate-float-delayed ms-10 flex w-fit items-center gap-3 rounded-2xl bg-white/10 px-4 py-3 ring-1 ring-white/15 backdrop-blur">
              <span className="flex size-9 items-center justify-center rounded-xl bg-warning/30">
                <Clock className="size-5 text-white" />
              </span>
              <div>
                <p className="text-sm font-semibold">Missed garbage pickup</p>
                <p className="text-xs text-white/70">Waste Management · 6 h left</p>
              </div>
            </div>
          </div>
        </div>

        <p className="relative text-sm text-white/60">CityFix · City Complaint & Service Platform</p>
      </aside>

      <div className="bg-mesh flex flex-col">
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
