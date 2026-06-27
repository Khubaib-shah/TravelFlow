"use client";

// Mock Query Provider since react-query wasn't explicitly requested to be installed yet
// but was mentioned in the folder structure.

export function QueryProvider({ children }: { children: React.ReactNode }) {
  // If @tanstack/react-query is added later, configure QueryClient here
  return <>{children}</>;
}
