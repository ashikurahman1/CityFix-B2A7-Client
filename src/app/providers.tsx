"use client";

import { MutationCache, QueryCache, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import dynamic from "next/dynamic";
import { usePathname, useRouter } from "next/navigation";
import { type ReactNode, Suspense, useEffect, useState } from "react";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ApiError, errorMessage, SESSION_EXPIRED_EVENT } from "@/lib/api/client";
import { qk } from "@/lib/query-keys";

// Devtools are code-split and only shipped in development.
const ReactQueryDevtools =
  process.env.NODE_ENV === "development"
    ? dynamic(() => import("@tanstack/react-query-devtools").then((m) => m.ReactQueryDevtools))
    : () => null;

declare module "@tanstack/react-query" {
  interface Register {
    queryMeta: { silent?: boolean };
    mutationMeta: { silent?: boolean };
  }
}

function makeQueryClient() {
  return new QueryClient({
    queryCache: new QueryCache({
      // Background refetch failures of data already on screen surface as a toast.
      onError: (error, query) => {
        if (query.meta?.silent) return;
        if (error instanceof ApiError && error.status === 401) return;
        if (query.state.data !== undefined) toast.error(errorMessage(error));
      },
    }),
    mutationCache: new MutationCache({
      // Every failed mutation shows a toast unless the caller handles it (meta.silent).
      onError: (error, _vars, _ctx, mutation) => {
        if (mutation.meta?.silent) return;
        toast.error(errorMessage(error));
      },
    }),
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        gcTime: 5 * 60_000,
        refetchOnWindowFocus: false,
        retry: (count, error) => {
          if (error instanceof ApiError && error.status >= 400 && error.status < 500) return false;
          return count < 2;
        },
      },
    },
  });
}

function SessionWatcher({ client }: { client: QueryClient }) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const onExpired = () => {
      client.setQueryData(qk.me, null);
      client.removeQueries({ predicate: (q) => q.queryKey[0] !== "categories" && q.queryKey[0] !== "departments" });
      toast.warning("Your session has ended. Please log in again.");
      router.push(`/login?next=${encodeURIComponent(pathname)}`);
    };
    window.addEventListener(SESSION_EXPIRED_EVENT, onExpired);
    return () => window.removeEventListener(SESSION_EXPIRED_EVENT, onExpired);
  }, [client, router, pathname]);

  return null;
}

export function Providers({ children }: { children: ReactNode }) {
  const [client] = useState(makeQueryClient);

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <QueryClientProvider client={client}>
        <TooltipProvider delayDuration={200}>
          {children}
          <Suspense fallback={null}>
            <SessionWatcher client={client} />
          </Suspense>
          <Toaster richColors closeButton position="top-right" />
        </TooltipProvider>
        <ReactQueryDevtools buttonPosition="bottom-left" />
      </QueryClientProvider>
    </ThemeProvider>
  );
}
