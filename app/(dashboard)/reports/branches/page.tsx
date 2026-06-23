"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function BranchReportPage() {
  const router = useRouter();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="tf-h2 text-[var(--tf-text-primary)]">Branch Performance</h1>
          <p className="tf-body text-[var(--tf-text-secondary)] mt-1">Metrics comparing different agency branches.</p>
        </div>
      </div>

      <div className="bg-[var(--tf-surface)] rounded-xl border border-[var(--tf-border)] p-8 min-h-[400px] flex items-center justify-center">
        <div className="text-center">
          <p className="text-[var(--tf-text-muted)]">Leaderboards, branch vs branch comparison, and regional statistics will go here.</p>
        </div>
      </div>
    </div>
  );
}
