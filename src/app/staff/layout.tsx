import type { Metadata } from "next";
import { AppShell } from "@/components/layout/app-shell";

export const metadata: Metadata = {
  title: { default: "Staff workspace", template: "%s · CityFix Staff" },
  robots: { index: false, follow: false },
};

/** Department staff workspace. Access is restricted to the STAFF role by src/proxy.ts. */
export default function StaffLayout({ children }: LayoutProps<"/staff">) {
  return <AppShell role="STAFF">{children}</AppShell>;
}
