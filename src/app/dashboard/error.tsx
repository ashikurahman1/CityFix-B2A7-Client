"use client";

import { ErrorView } from "@/components/shared/error-view";

export default function CitizenError({ error, retry }: { error: unknown; retry: () => void }) {
  return <ErrorView error={error} retry={retry} homeHref="/dashboard" title="This page couldn't load" />;
}
