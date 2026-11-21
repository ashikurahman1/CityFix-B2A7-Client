import { Mail, Phone } from "lucide-react";
import type { Metadata } from "next";
import { Suspense } from "react";
import { ContactForm } from "@/components/public/contact-form";
import { PageHero } from "@/components/public/page-hero";
import { Skeleton } from "@/components/ui/skeleton";
import { getDepartments } from "@/lib/api/server";

export const metadata: Metadata = {
  title: "Contact the city",
  description: "Reach the CityFix departments directly: Roads, Waste Management, Water & Sewerage, Licensing & Permits.",
  alternates: { canonical: "/contact" },
  openGraph: { title: "Contact CityFix departments", url: "/contact" },
};

async function ContactContent() {
  const departments = await getDepartments();
  const withEmail = departments
    .filter((d) => d.contactEmail)
    .map((d) => ({ name: d.name, email: d.contactEmail as string }));

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_1.4fr]">
      <div>
        <h2 className="text-xl font-semibold">Department desks</h2>
        <p className="mt-1 text-sm text-muted-foreground">Contact details are published by each department.</p>
        <ul className="mt-5 space-y-3">
          {departments.map((d) => (
            <li key={d.id} className="rounded-xl border bg-card p-4">
              <p className="font-medium">{d.name}</p>
              <div className="mt-1.5 flex flex-col gap-1 text-sm text-muted-foreground">
                {d.contactEmail ? (
                  <a href={`mailto:${d.contactEmail}`} className="inline-flex items-center gap-2 hover:text-primary">
                    <Mail className="size-4" aria-hidden="true" /> {d.contactEmail}
                  </a>
                ) : null}
                {d.contactPhone ? (
                  <a href={`tel:${d.contactPhone}`} className="inline-flex items-center gap-2 hover:text-primary">
                    <Phone className="size-4" aria-hidden="true" /> {d.contactPhone}
                  </a>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      </div>
      <ContactForm departments={withEmail} />
    </div>
  );
}

export default function ContactPage() {
  return (
    <>
      <PageHero
        eyebrow="Contact"
        title="Talk to the right desk"
        description="General questions go straight to the department responsible. For anything that needs fixing, file a request so it is tracked."
      />
      <section className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <Suspense
          fallback={
            <div className="grid gap-10 lg:grid-cols-[1fr_1.4fr]">
              <div className="space-y-3">
                {Array.from({ length: 4 }, (_, i) => (
                  <Skeleton key={i} className="h-20 rounded-xl" />
                ))}
              </div>
              <Skeleton className="h-[480px] rounded-2xl" />
            </div>
          }
        >
          <ContactContent />
        </Suspense>
      </section>
    </>
  );
}
