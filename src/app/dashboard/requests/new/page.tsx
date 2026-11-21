import type { Metadata } from "next";
import { RequestWizard } from "@/components/citizen/request-wizard";
import { PageHeader } from "@/components/shared/page-header";

export const metadata: Metadata = { title: "New request" };

export default function NewRequestPage() {
  return (
    <>
      <PageHeader
        title="New request"
        description="Four quick steps. Your draft is kept if you refresh or step away."
      />
      <RequestWizard />
    </>
  );
}
