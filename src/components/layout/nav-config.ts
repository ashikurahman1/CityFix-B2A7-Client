import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  Building2,
  ClipboardList,
  CreditCard,
  FilePlus2,
  FolderKanban,
  Inbox,
  LayoutDashboard,
  ListChecks,
  ScrollText,
  Tags,
  TrendingUp,
  UserCog,
  Users,
} from "lucide-react";
import type { Role } from "@/types/api";

export const PUBLIC_NAV = [
  { href: "/services", label: "Services" },
  { href: "/track", label: "Track request" },
  { href: "/about", label: "About" },
  { href: "/faq", label: "FAQ" },
  { href: "/contact", label: "Contact" },
] as const;

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  /** Match only the exact path (for section roots like /admin). */
  exact?: boolean;
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

/** Sidebar navigation per role. Each role only ever sees its own links. */
export const ROLE_NAV: Record<Role, NavGroup[]> = {
  CITIZEN: [
    {
      label: "My city",
      items: [
        { href: "/dashboard", label: "Overview", icon: LayoutDashboard, exact: true },
        { href: "/dashboard/requests", label: "My requests", icon: ClipboardList },
        { href: "/dashboard/requests/new", label: "New request", icon: FilePlus2, exact: true },
      ],
    },
    {
      label: "Account",
      items: [
        { href: "/dashboard/payments", label: "Payments", icon: CreditCard },
        { href: "/dashboard/profile", label: "Profile & security", icon: UserCog },
      ],
    },
  ],
  STAFF: [
    {
      label: "Work",
      items: [
        { href: "/staff", label: "My tasks", icon: ListChecks, exact: true },
        { href: "/staff/queue", label: "Department queue", icon: Inbox },
        { href: "/staff/performance", label: "Performance", icon: TrendingUp },
      ],
    },
    {
      label: "Account",
      items: [{ href: "/staff/profile", label: "Profile & availability", icon: UserCog }],
    },
  ],
  ADMIN: [
    {
      label: "Operations",
      items: [
        { href: "/admin", label: "Analytics", icon: BarChart3, exact: true },
        { href: "/admin/complaints", label: "Requests", icon: FolderKanban },
        { href: "/admin/payments", label: "Payments & refunds", icon: CreditCard },
      ],
    },
    {
      label: "City setup",
      items: [
        { href: "/admin/users", label: "Users & staff", icon: Users },
        { href: "/admin/departments", label: "Departments", icon: Building2 },
        { href: "/admin/categories", label: "Categories", icon: Tags },
      ],
    },
    {
      label: "Compliance",
      items: [
        { href: "/admin/audit-logs", label: "Audit logs", icon: ScrollText },
        { href: "/admin/profile", label: "Profile", icon: UserCog },
      ],
    },
  ],
};
