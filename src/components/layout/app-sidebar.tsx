"use client";

import { LogOut } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo } from "react";
import { Logo } from "@/components/brand/logo";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import { useLogout, useMe } from "@/hooks/use-auth";
import { ROLE_HOME, ROLE_LABEL } from "@/lib/auth/roles";
import type { Role } from "@/types/api";
import { ROLE_NAV } from "./nav-config";
import { UserAvatar } from "./user-menu";

/** Longest matching href wins, so /dashboard/requests/new does not also light up "My requests". */
function useActiveHref(role: Role) {
  const pathname = usePathname();
  return useMemo(() => {
    const items = ROLE_NAV[role].flatMap((g) => g.items);
    const matches = items.filter((i) =>
      i.exact ? pathname === i.href : pathname === i.href || pathname.startsWith(`${i.href}/`),
    );
    return matches.sort((a, b) => b.href.length - a.href.length)[0]?.href;
  }, [pathname, role]);
}

export function AppSidebar({ role }: { role: Role }) {
  const active = useActiveHref(role);
  const { data: me, isPending } = useMe();
  const logout = useLogout();
  const { setOpenMobile } = useSidebar();

  return (
    <Sidebar collapsible="icon" variant="inset">
      <SidebarHeader className="h-14 justify-center px-3">
        <Logo href={ROLE_HOME[role]} className="group-data-[collapsible=icon]:[&>span]:hidden" />
      </SidebarHeader>
      <SidebarContent>
        {ROLE_NAV[role].map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton asChild isActive={active === item.href} tooltip={item.label}>
                      <Link
                        href={item.href}
                        onClick={() => setOpenMobile(false)}
                        aria-current={active === item.href ? "page" : undefined}
                      >
                        <item.icon />
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            {isPending || !me ? (
              <SidebarMenuSkeleton showIcon />
            ) : (
              <div className="flex items-center gap-2.5 rounded-lg p-1.5 group-data-[collapsible=icon]:p-0">
                <UserAvatar user={me} className="size-8" />
                <div className="min-w-0 flex-1 group-data-[collapsible=icon]:hidden">
                  <p className="truncate text-sm font-medium">{me.name}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {me.department?.name ?? ROLE_LABEL[me.role]}
                  </p>
                </div>
              </div>
            )}
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={() => logout.mutate()} disabled={logout.isPending} tooltip="Sign out">
              <LogOut />
              <span>Sign out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
