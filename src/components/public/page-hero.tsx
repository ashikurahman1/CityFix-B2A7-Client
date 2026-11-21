import { Sparkles } from "lucide-react";

export function PageHero({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  return (
    <section className="bg-mesh relative overflow-hidden border-b">
      <div className="bg-grid pointer-events-none absolute inset-0 opacity-50 [mask-image:linear-gradient(to_bottom,black,transparent)]" />
      <div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6 md:py-20 lg:px-8">
        <p className="inline-flex items-center gap-1.5 rounded-full border border-primary/25 bg-card/80 px-3 py-1 text-xs font-semibold text-primary backdrop-blur">
          <Sparkles className="size-3.5" aria-hidden="true" /> {eyebrow}
        </p>
        <h1 className="mt-4 max-w-3xl text-4xl font-bold text-balance sm:text-5xl lg:text-6xl">{title}</h1>
        <p className="mt-5 max-w-2xl text-lg text-pretty text-muted-foreground">{description}</p>
      </div>
    </section>
  );
}
