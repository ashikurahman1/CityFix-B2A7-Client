"use client";

import { AlertTriangle, RotateCcw } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

interface ErrorViewProps {
  error: unknown;
  retry: () => void;
  title?: string;
  homeHref?: string;
}

/** Shared body of every error.tsx boundary. */
export function ErrorView({ error, retry, title = "Something went wrong", homeHref = "/" }: ErrorViewProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  const digest = error instanceof Error && "digest" in error ? String(error.digest) : null;
  const message =
    error instanceof Error && !digest ? error.message : "An unexpected error occurred while loading this page.";

  return (
    <div role="alert" className="flex flex-1 items-center justify-center px-4 py-16">
      <div className="mx-auto max-w-md text-center">
        <div className="mx-auto mb-5 flex size-14 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
          <AlertTriangle className="size-7" aria-hidden="true" />
        </div>
        <h2 className="text-2xl font-semibold">{title}</h2>
        <p className="mt-2 text-muted-foreground">{message}</p>
        {digest ? <p className="mt-2 font-mono text-xs text-muted-foreground">Reference: {digest}</p> : null}
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <Button onClick={() => retry()}>
            <RotateCcw data-icon="inline-start" />
            Try again
          </Button>
          <Button variant="outline" asChild>
            <Link href={homeHref}>Go to safety</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
