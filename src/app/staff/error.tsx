"use client";

import { ErrorView } from "@/components/shared/error-view";

export default function SegmentError({ error, retry }: { error: unknown; retry: () => void }) {
  return <ErrorView error={error} retry={retry} homeHref="/staff" title="This page couldn't load" />;
}
