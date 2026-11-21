import type { Metadata } from "next";
import { CitizenOverview } from "@/components/citizen/citizen-overview";

export const metadata: Metadata = { title: "Overview" };

export default function CitizenDashboardPage() {
  return <CitizenOverview />;
}
