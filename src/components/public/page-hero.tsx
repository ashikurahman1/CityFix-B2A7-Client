export function PageHero({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  return (
    <section className="bg-grid border-b">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 md:py-16 lg:px-8">
        <p className="text-sm font-medium text-primary">{eyebrow}</p>
        <h1 className="mt-2 max-w-3xl text-3xl font-semibold text-balance sm:text-5xl">{title}</h1>
        <p className="mt-4 max-w-2xl text-lg text-pretty text-muted-foreground">{description}</p>
      </div>
    </section>
  );
}
