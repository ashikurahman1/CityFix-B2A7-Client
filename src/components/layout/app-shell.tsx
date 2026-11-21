"use client";

import Link from "next/link";
import { Suspense } from "react";
import { RoleBadge } from "@/components/shared/status-badge";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { Separator } from "@/components/ui/separator";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { useMe } from "@/hooks/use-auth";
import type { Role } from "@/types/api";
import { AppSidebar } from "./app-sidebar";
import { UserMenu } from "./user-menu";

function TopbarUser() {
  const { data: me } = useMe();
  if (!me) return <Skeleton className="size-8 rounded-full" />;
  return <UserMenu user={me} />;
}

/**
 * Dashboard chrome shared by the three workspaces. The role comes from the route segment
 * (/dashboard, /staff, /admin) which proxy.ts already restricted, so navigation renders
 * immediately without waiting for the profile request.
 */
export function AppShell({ role, children }: { role: Role; children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <Suspense fallback={null}>
        <AppSidebar role={role} />
      </Suspense>
      <SidebarInset className="min-w-0">
        <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-2 rounded-t-xl border-b bg-background/85 px-3 backdrop-blur sm:px-4">
          <SidebarTrigger className="-ms-1" />
          <Separator orientation="vertical" className="mx-1 data-[orientation=vertical]:h-5" />
          <RoleBadge role={role} />
          <div className="ms-auto flex items-center gap-1.5">
            <Link href="/" className="hidden px-2 text-sm text-muted-foreground hover:text-foreground sm:inline">
              Public site
            </Link>
            <ThemeToggle />
            <TopbarUser />
          </div>
        </header>
        <div id="main" className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 p-4 sm:p-6 lg:p-8">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
