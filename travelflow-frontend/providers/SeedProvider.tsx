"use client";

import { useEffect } from "react";
import { initializeSeedData } from "@/lib/data-service";

export function SeedProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    initializeSeedData();
  }, []);

  return <>{children}</>;
}
