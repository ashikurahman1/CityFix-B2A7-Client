import type { Metadata } from "next";
import Link from "next/link";
import { MapPinOff } from "lucide-react";
import { LogoMark } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Page not found" };

export default function NotFound() {
  return (
    <main className="bg-grid flex flex-1 items-center justify-center px-4 py-24">
      <div className="mx-auto max-w-md text-center">
        <LogoMark className="mx-auto mb-8 size-10" />
        <div className="mx-auto mb-6 flex size-16 items-center justify-center rounded-2xl bg-accent text-accent-foreground">
          <MapPinOff className="size-8" aria-hidden="true" />
        </div>
        <p className="font-mono text-sm text-muted-foreground">Error 404</p>
        <h1 className="mt-2 text-3xl font-semibold sm:text-4xl">This street isn&apos;t on our map</h1>
        <p className="mt-3 text-muted-foreground">
          The page you are looking for was moved, removed or never existed. Check the address or head back to
          familiar ground.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Button asChild size="lg">
            <Link href="/">Back to home</Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/track">Track a request</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
