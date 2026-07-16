"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

/**
 * QueryProvider — Configures @tanstack/react-query with sensible defaults
 * for the TravelFlow application.
 *
 * Global defaults:
 *   - retry: 1 (retry once on failure, then show error state)
 *   - retryDelay: exponential backoff (1s, 2s, 4s …)
 *   - refetchOnWindowFocus: false (avoid unexpected background refetches)
 *   - staleTime: 30s (data stays fresh for 30s before becoming stale)
 *   - gcTime: 5 min (unused cache entries are garbage collected after 5 min)
 */
export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: 1,
            retryDelay: (attemptIndex) =>
              Math.min(1000 * 2 ** attemptIndex, 10_000),
            refetchOnWindowFocus: false,
            staleTime: 30_000,
            gcTime: 5 * 60 * 1000,
          },
          mutations: {
            retry: 0, // Mutations should not auto-retry — user action required
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
