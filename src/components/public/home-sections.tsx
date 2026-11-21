import {
  ArrowRight,
  BellRing,
  Building2,
  Camera,
  CreditCard,
  Droplets,
  Eye,
  FileBadge,
  Gauge,
  RotateCcw,
  ScrollText,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { getDepartments } from "@/lib/api/server";
import { cn } from "@/lib/utils";

// ───────────────────────── Feature bento ─────────────────────────

const timeline = [
  { label: "Submitted", time: "09:12", done: true },
  { label: "Assigned to Roads", time: "09:40", done: true },
  { label: "In progress", time: "11:05", done: true },
  { label: "Resolved", time: "SLA 72 h", done: false },
];

function Tile({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={cn("relative overflow-hidden rounded-3xl border bg-card p-6 shadow-soft sm:p-7", className)}>
      {children}
    </div>
  );
}

function TileIcon({ icon: Icon, tone }: { icon: typeof Gauge; tone: string }) {
  return (
    <span className={cn("flex size-11 items-center justify-center rounded-2xl", tone)}>
      <Icon className="size-5" aria-hidden="true" />
    </span>
  );
}

export function FeatureBento() {
  return (
    <div className="grid gap-5 md:grid-cols-6">
      {/* Big SLA tile with a live-looking timeline */}
      <Tile className="md:col-span-4 md:row-span-2">
        <div className="absolute -top-24 -right-24 size-72 rounded-full bg-primary/10 blur-3xl" aria-hidden="true" />
        <div className="relative grid gap-8 lg:grid-cols-[1fr_1.1fr]">
          <div>
            <TileIcon icon={Gauge} tone="bg-primary/12 text-primary" />
            <h3 className="mt-5 font-sans text-2xl font-semibold">Every request runs on a clock</h3>
            <p className="mt-3 text-muted-foreground">
              The category sets a base SLA and priority scales it — Urgent ×0.25, High ×0.5, Medium ×1, Low ×1.5. Overdue
              work is flagged to administrators automatically.
            </p>
            <div className="mt-6 grid grid-cols-4 gap-2 text-center text-xs font-medium">
              {[
                ["Urgent", "18 h", "bg-destructive/12 text-destructive"],
                ["High", "36 h", "bg-warning/18 text-[color-mix(in_oklch,var(--warning)_65%,var(--foreground))]"],
                ["Medium", "72 h", "bg-info/12 text-info"],
                ["Low", "108 h", "bg-muted text-muted-foreground"],
              ].map(([p, h, tone]) => (
                <div key={p} className={cn("rounded-xl px-2 py-2.5", tone)}>
                  <p>{p}</p>
                  <p className="mt-0.5 font-heading text-base font-semibold">{h}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-2xl border bg-muted/40 p-5" aria-hidden="true">
            <div className="flex items-center justify-between">
              <p className="font-mono text-xs text-muted-foreground">CF-261121-PTH8K2</p>
              <span className="rounded-full bg-primary/12 px-2.5 py-0.5 text-xs font-medium text-primary">In progress</span>
            </div>
            <p className="mt-2 font-semibold">Deep pothole outside house 12</p>
            <ol className="mt-5 space-y-4 border-s-2 border-dashed border-border ps-5">
              {timeline.map((t) => (
                <li key={t.label} className="relative">
                  <span
                    className={cn(
                      "absolute -start-[27px] top-0.5 size-3.5 rounded-full border-2 border-card",
                      t.done ? "bg-primary" : "bg-warning ring-4 ring-warning/25",
                    )}
                  />
                  <div className="flex items-center justify-between text-sm">
                    <span className={t.done ? "font-medium" : "text-muted-foreground"}>{t.label}</span>
                    <span className="text-xs text-muted-foreground">{t.time}</span>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </Tile>

      <Tile className="md:col-span-2">
        <TileIcon icon={CreditCard} tone="bg-warning/18 text-[color-mix(in_oklch,var(--warning)_65%,var(--foreground))]" />
        <h3 className="mt-4 font-sans text-lg font-semibold">Pay fees online</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Trade licences and water connections are paid through Stripe Checkout. Refunds are automatic if a request is
          rejected.
        </p>
      </Tile>

      <Tile className="md:col-span-2">
        <TileIcon icon={Eye} tone="bg-info/12 text-info" />
        <h3 className="mt-4 font-sans text-lg font-semibold">Track without logging in</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Share the tracking code with neighbours. They see the status timeline, never your personal details.
        </p>
      </Tile>

      <Tile className="md:col-span-2">
        <TileIcon icon={Camera} tone="bg-chart-5/15 text-chart-5" />
        <h3 className="mt-4 font-sans text-lg font-semibold">Photos & documents</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Attach up to five images or PDFs per request, stored on Cloudinary with live upload progress.
        </p>
      </Tile>

      <Tile className="md:col-span-2">
        <TileIcon icon={RotateCcw} tone="bg-success/12 text-success" />
        <h3 className="mt-4 font-sans text-lg font-semibold">Reopen if it breaks again</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Not fixed properly? Reopen within 7 days and it goes back to the same crew with a fresh deadline.
        </p>
      </Tile>

      <Tile className="bg-brand border-0 text-white md:col-span-2">
        <span className="flex size-11 items-center justify-center rounded-2xl bg-white/12">
          <ScrollText className="size-5 text-warning" aria-hidden="true" />
        </span>
        <h3 className="mt-4 font-sans text-lg font-semibold text-white">Accountable by design</h3>
        <p className="mt-2 text-sm text-white/75">
          Every assignment, status change, payment and refund is written to an audit log in the same transaction.
        </p>
      </Tile>
    </div>
  );
}

// ───────────────────────── Departments ─────────────────────────

const DEPT_STYLE: [RegExp, typeof Building2, string][] = [
  [/road|infra/i, Building2, "from-primary/20 text-primary"],
  [/waste|garbage/i, Trash2, "from-chart-5/20 text-chart-5"],
  [/water|sewer/i, Droplets, "from-info/20 text-info"],
  [/licen|permit/i, FileBadge, "from-warning/25 text-[color-mix(in_oklch,var(--warning)_65%,var(--foreground))]"],
];

export async function DepartmentShowcase() {
  const departments = await getDepartments();
  if (departments.length === 0) return null;

  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {departments.map((d) => {
        const [, Icon, tone] = DEPT_STYLE.find(([re]) => re.test(d.name)) ?? [/./, BellRing, "from-primary/20 text-primary"];
        return (
          <div key={d.id} className="group relative overflow-hidden rounded-3xl border bg-card p-6 shadow-soft">
            <div className={cn("absolute inset-x-0 top-0 h-28 bg-gradient-to-b to-transparent", tone.split(" ")[0])} aria-hidden="true" />
            <div className="relative">
              <span
                className={cn(
                  "flex size-12 items-center justify-center rounded-2xl bg-card shadow-sm ring-1 ring-border transition-transform group-hover:-rotate-6",
                  tone.split(" ").slice(1).join(" "),
                )}
              >
                <Icon className="size-6" aria-hidden="true" />
              </span>
              <h3 className="mt-5 font-sans text-lg font-semibold">{d.name}</h3>
              {d.description ? <p className="mt-1.5 text-sm text-muted-foreground">{d.description}</p> : null}
              <p className="mt-4 inline-flex rounded-full bg-muted px-3 py-1 text-xs font-medium">
                {d._count?.categories ?? 0} request {d._count?.categories === 1 ? "type" : "types"}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ───────────────────────── FAQ teaser ─────────────────────────

const faqs = [
  {
    q: "Is it free to report a problem?",
    a: "Yes. Complaints such as potholes, street lights, garbage and leaks are always free. Only municipal services like trade licences carry a fixed fee.",
  },
  {
    q: "How do I know someone is working on it?",
    a: "You see every status change on the request's timeline — submitted, assigned, in progress, resolved — along with the staff member's notes.",
  },
  {
    q: "What if I paid and the request is rejected?",
    a: "A city administrator refunds the fee through Stripe. The refund shows up in your payment history.",
  },
  {
    q: "Can I try it without signing up?",
    a: "Yes — use the one-click demo logins on the login page to explore the citizen, staff and admin workspaces.",
  },
];

export function FaqTeaser() {
  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_1.4fr]">
      <div>
        <h2 className="text-3xl font-semibold text-balance sm:text-4xl">Questions people ask first</h2>
        <p className="mt-3 text-lg text-muted-foreground">
          Payments, deadlines and what happens after you press submit.
        </p>
        <Button asChild variant="outline" className="mt-6 h-11 bg-card px-5">
          <Link href="/faq">
            Read all FAQs <ArrowRight data-icon="inline-end" />
          </Link>
        </Button>
      </div>
      <Accordion type="single" collapsible defaultValue={faqs[0]?.q} className="rounded-3xl border bg-card px-6 shadow-soft">
        {faqs.map((f) => (
          <AccordionItem key={f.q} value={f.q}>
            <AccordionTrigger className="py-5 text-left text-base">{f.q}</AccordionTrigger>
            <AccordionContent className="text-muted-foreground">{f.a}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
