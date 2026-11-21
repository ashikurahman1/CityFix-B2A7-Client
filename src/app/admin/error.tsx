"use client";

import { ErrorView } from "@/components/shared/error-view";

export default function SegmentError({ error, retry }: { error: unknown; retry: () => void }) {
  return <ErrorView error={error} retry={retry} homeHref="/admin" title="This page couldn't load" />;
}
