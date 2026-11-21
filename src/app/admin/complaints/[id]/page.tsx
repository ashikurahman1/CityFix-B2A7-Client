import type { Metadata } from "next";
import { ComplaintDetailView } from "@/components/complaints/complaint-detail";

export const metadata: Metadata = { title: "Request details" };

export default async function RequestDetailPage({ params }: PageProps<"/admin/complaints/[id]">) {
  const { id } = await params;
  return <ComplaintDetailView key={id} id={id} role="ADMIN" />;
}
