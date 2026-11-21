import type { Metadata } from "next";
import { AppShell } from "@/components/layout/app-shell";

export const metadata: Metadata = {
  title: { default: "Admin console", template: "%s · CityFix Admin" },
  robots: { index: false, follow: false },
};

/** City admin console. Access is restricted to the ADMIN role by src/proxy.ts. */
export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return <AppShell role="ADMIN">{children}</AppShell>;
}
