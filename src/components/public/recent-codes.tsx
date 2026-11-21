"use client";

import { History, X } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";
import { useRecentTracking } from "@/stores/recent-tracking";

/** Remembers the code just looked up and lists the visitor's recent lookups (Zustand + localStorage). */
export function RecentCodes({ current }: { current?: string }) {
  const { codes, remember, forget } = useRecentTracking();

  useEffect(() => {
    if (current) remember(current);
  }, [current, remember]);

  const others = codes.filter((c) => c !== current);
  if (others.length === 0) return null;

  return (
    <div className="mt-4">
      <p className="mb-2 inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
        <History className="size-3.5" aria-hidden="true" /> Recent lookups
      </p>
      <ul className="flex flex-wrap gap-2">
        {others.map((code) => (
          <li key={code} className="inline-flex items-center rounded-full border bg-card text-xs">
            <Link href={`/track?code=${code}`} className="py-1 ps-3 pe-1 font-mono hover:text-primary">
              {code}
            </Link>
            <button
              type="button"
              onClick={() => forget(code)}
              className="rounded-full p-1 pe-2 text-muted-foreground hover:text-foreground"
              aria-label={`Forget ${code}`}
            >
              <X className="size-3" />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
