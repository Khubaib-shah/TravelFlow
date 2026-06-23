"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function RevenueReportPage() {
  const router = useRouter();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="tf-h2 text-[var(--tf-text-primary)]">Revenue Report</h1>
          <p className="tf-body text-[var(--tf-text-secondary)] mt-1">Detailed breakdown of gross and net revenue.</p>
        </div>
      </div>

      <div className="bg-[var(--tf-surface)] rounded-xl border border-[var(--tf-border)] p-8 min-h-[400px] flex items-center justify-center">
        <div className="text-center">
          <p className="text-[var(--tf-text-muted)]">Advanced charts, filtering, and revenue export options will go here.</p>
        </div>
      </div>
    </div>
  );
}
