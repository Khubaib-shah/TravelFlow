import { QueryClient } from "@tanstack/react-query";
import { parseApiError } from "./error-parser";

// Shared default config for SSR and Client
export const defaultQueryClientOptions = {
  defaultOptions: {
    queries: {
      retry: (failureCount: number, error: unknown) => {
        // Don't retry 401s, 403s, 404s
        const apiError = parseApiError(error);
        if ([401, 403, 404].includes(apiError.status || 0)) return false;
        return failureCount < 2;
      },
      retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 10_000),
      refetchOnWindowFocus: false, // Prevent unexpected fetching on tab switch
      staleTime: 30_000, // 30s default stale time
      gcTime: 10 * 60 * 1000, // 10m default garbage collection
    },
    mutations: {
      retry: 0, // Never retry mutations automatically
    },
  },
};

// Keep a singleton for RSC / SSR context
let browserQueryClient: QueryClient | undefined = undefined;

export function getQueryClient() {
  if (typeof window === "undefined") {
    // Server: always make a new query client
    return new QueryClient(defaultQueryClientOptions);
  } else {
    // Browser: make a new query client if we don't already have one
    if (!browserQueryClient) browserQueryClient = new QueryClient(defaultQueryClientOptions);
    return browserQueryClient;
  }
}
