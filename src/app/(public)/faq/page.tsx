import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/public/page-hero";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export const metadata: Metadata = {
  title: "Frequently asked questions",
  description:
    "Answers about filing complaints, paying service fees with Stripe, SLA deadlines, reopening requests and refunds on CityFix.",
  alternates: { canonical: "/faq" },
  openGraph: { title: "CityFix FAQ", url: "/faq" },
};

const groups: { title: string; items: { q: string; a: React.ReactNode }[] }[] = [
  {
    title: "Filing a request",
    items: [
      {
        q: "What is the difference between a complaint and a service?",
        a: "Complaints (potholes, street lights, garbage, leaks) are free and go straight to the department. Services (trade licence, bulk waste pickup, new water connection) have a fixed fee that must be paid before the request is routed.",
      },
      {
        q: "Can I edit a request after filing it?",
        a: "Yes. You can edit the title, description and location until a staff member is assigned. You can also cancel it before assignment.",
      },
      {
        q: "Can I attach photos?",
        a: "Up to 5 files per request: JPEG, PNG, WEBP or PDF, 5 MB each. Files are stored on Cloudinary.",
      },
    ],
  },
  {
    title: "Payments",
    items: [
      {
        q: "How do I pay a service fee?",
        a: "Open the request and choose “Pay now”. You are taken to a secure Stripe Checkout page. In this demo Stripe runs in test mode: use card 4242 4242 4242 4242 with any future date and any CVC.",
      },
      {
        q: "What happens if I close the checkout page?",
        a: "Nothing is charged. The request stays in “Awaiting payment” and you can start a new checkout at any time.",
      },
      {
        q: "Will I get my money back if the request is rejected?",
        a: "Yes. When a paid request is rejected or cancelled, a city administrator refunds the fee through Stripe.",
      },
    ],
  },
  {
    title: "Deadlines & follow-up",
    items: [
      {
        q: "How is the SLA deadline calculated?",
        a: "Each category has a base number of hours. Priority adjusts it: Urgent ×0.25, High ×0.5, Medium ×1, Low ×1.5.",
      },
      {
        q: "The problem came back. What can I do?",
        a: "Within 7 days of a request being resolved you can reopen it with a reason. It goes back to the same staff member with a fresh SLA.",
      },
      {
        q: "Can someone else follow my request?",
        a: (
          <>
            Share the tracking code. Anyone can look it up on the <Link href="/track">tracking page</Link>; it shows
            the status timeline but never your personal details.
          </>
        ),
      },
    ],
  },
];

export default function FaqPage() {
  return (
    <>
      <PageHero
        eyebrow="FAQ"
        title="Questions, answered"
        description="Everything you need to know about filing, paying for and following up on city requests."
      />
      <section className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6">
        {groups.map((group) => (
          <div key={group.title} className="mb-10">
            <h2 className="mb-2 text-xl font-semibold">{group.title}</h2>
            <Accordion type="single" collapsible className="rounded-2xl border bg-card px-5">
              {group.items.map((item) => (
                <AccordionItem key={item.q} value={item.q}>
                  <AccordionTrigger className="text-left text-base">{item.q}</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground [&_a]:text-primary [&_a]:underline">
                    {item.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        ))}
      </section>
    </>
  );
}
