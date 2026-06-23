"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ProfitChart } from "@/components/dashboard/ProfitChart";

export default function ProfitReportPage() {
  const router = useRouter();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="tf-h2 text-[var(--tf-text-primary)]">Profit & Loss</h1>
          <p className="tf-body text-[var(--tf-text-secondary)] mt-1">Detailed P&L statements across branches.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <ProfitChart data={[]} isLoading={false} />
      </div>
    </div>
  );
}
