"use client";

import "./globals.css";

/** Last-resort boundary: replaces the root layout, so it renders its own <html> and <body>. */
export default function GlobalError({ error, retry }: { error: unknown; retry: () => void }) {
  const digest = error instanceof Error && "digest" in error ? String(error.digest) : null;

  return (
    <html lang="en">
      <body className="flex min-h-screen items-center justify-center bg-background p-6 font-sans text-foreground">
        <div className="max-w-md text-center">
          <p className="text-sm font-medium text-destructive">CityFix is having trouble</p>
          <h1 className="mt-2 text-3xl font-semibold">We couldn&apos;t load the application</h1>
          <p className="mt-3 text-muted-foreground">
            A critical error stopped the page from rendering. Please try again in a moment.
          </p>
          {digest ? <p className="mt-2 font-mono text-xs text-muted-foreground">Reference: {digest}</p> : null}
          <button
            type="button"
            onClick={() => retry()}
            className="mt-6 inline-flex h-10 items-center rounded-lg bg-primary px-5 text-sm font-medium text-primary-foreground"
          >
            Reload CityFix
          </button>
        </div>
      </body>
    </html>
  );
}
