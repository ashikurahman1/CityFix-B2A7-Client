"use client";

import { Menu } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Logo } from "@/components/brand/logo";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { useMe } from "@/hooks/use-auth";
import { ROLE_HOME } from "@/lib/auth/roles";
import { cn } from "@/lib/utils";
import { PUBLIC_NAV } from "./nav-config";
import { UserMenu } from "./user-menu";

/** Auth-aware part of the public header: renders on the client because it depends on the session. */
export function HeaderActions() {
  const { data: me, isPending } = useMe();
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="flex items-center gap-1.5">
      <ThemeToggle className="size-10" />
      {isPending ? (
        <Skeleton className="hidden h-10 w-44 sm:block" />
      ) : me ? (
        <>
          <Button asChild variant="outline" className="hidden h-10 px-4 sm:inline-flex">
            <Link href={ROLE_HOME[me.role]}>Dashboard</Link>
          </Button>
          <UserMenu user={me} />
        </>
      ) : (
        <div className="hidden items-center gap-1.5 sm:flex">
          <Button asChild variant="ghost" className="h-10 px-4">
            <Link href="/login">Log in</Link>
          </Button>
          <Button asChild className="h-10 px-5 shadow-md shadow-primary/25">
            <Link href="/register">Get started</Link>
          </Button>
        </div>
      )}

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="size-10 lg:hidden" aria-label="Open menu">
            <Menu />
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-[85vw] max-w-sm">
          <SheetHeader>
            <SheetTitle asChild>
              <div>
                <Logo />
              </div>
            </SheetTitle>
          </SheetHeader>
          <nav aria-label="Mobile" className="flex flex-col gap-1 px-4">
            {[{ href: "/", label: "Home" }, ...PUBLIC_NAV].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                aria-current={pathname === item.href ? "page" : undefined}
                className={cn(
                  "rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-accent",
                  pathname === item.href && "bg-accent text-accent-foreground",
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="mt-auto grid gap-2 p-4">
            {me ? (
              <Button asChild>
                <Link href={ROLE_HOME[me.role]} onClick={() => setOpen(false)}>
                  Go to dashboard
                </Link>
              </Button>
            ) : (
              <>
                <Button asChild>
                  <Link href="/register" onClick={() => setOpen(false)}>
                    Create an account
                  </Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href="/login" onClick={() => setOpen(false)}>
                    Log in
                  </Link>
                </Button>
              </>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
