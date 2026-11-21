import { Suspense } from "react";
import { Logo } from "@/components/brand/logo";
import { Skeleton } from "@/components/ui/skeleton";
import { HeaderActions } from "./header-actions";
import { SiteNavLinks } from "./site-nav-links";

/** Server Component shell; only the session-dependent actions hydrate on the client. */
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/70">
      <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Logo />
        <Suspense fallback={null}>
          <SiteNavLinks />
        </Suspense>
        <Suspense fallback={<Skeleton className="h-9 w-40" />}>
          <HeaderActions />
        </Suspense>
      </div>
    </header>
  );
}
