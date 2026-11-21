import type { Metadata } from "next";
import { AppShell } from "@/components/layout/app-shell";

export const metadata: Metadata = {
  title: { default: "My dashboard", template: "%s · CityFix" },
  robots: { index: false, follow: false },
};

/** Citizen workspace. Access is restricted to the CITIZEN role by src/proxy.ts. */
export default function CitizenLayout({ children }: LayoutProps<"/dashboard">) {
  return <AppShell role="CITIZEN">{children}</AppShell>;
}
