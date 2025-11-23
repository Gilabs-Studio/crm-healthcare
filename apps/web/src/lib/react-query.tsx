"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState } from "react";
import { toast } from "sonner";

export function ReactQueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            refetchOnWindowFocus: false,
            retry: (failureCount, error) => {
              // Don't retry on network errors
              if (error && typeof error === "object" && "code" in error) {
                const code = error.code as string;
                if (code === "ERR_NETWORK" || code === "ECONNABORTED") {
                  return false;
                }
              }
              return failureCount < 1;
            },
            onError: (error) => {
              // Error handling is done in api-client interceptor
              // This is just a fallback
              if (error && typeof error === "object" && "message" in error) {
                console.error("Query error:", error);
              }
            },
          },
          mutations: {
            retry: (failureCount, error) => {
              // Don't retry on network errors
              if (error && typeof error === "object" && "code" in error) {
                const code = error.code as string;
                if (code === "ERR_NETWORK" || code === "ECONNABORTED") {
                  return false;
                }
              }
              return failureCount < 1;
            },
            onError: (error) => {
              // Error handling is done in api-client interceptor
              // This is just a fallback
              if (error && typeof error === "object" && "message" in error) {
                console.error("Mutation error:", error);
              }
            },
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {process.env.NODE_ENV === "development" && <ReactQueryDevtools />}
    </QueryClientProvider>
  );
}

