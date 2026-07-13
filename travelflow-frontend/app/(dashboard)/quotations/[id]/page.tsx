"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { QuotationDrawer } from "@/components/quotations/QuotationDrawer";

import { API } from "@/lib/data-source";
import type { Quotation } from "@/types";

export default function QuotationDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params?.id;

  const [quotation, setQuotation] = useState<Quotation | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const load = async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      const q = await API.getQuotation(id);
      setQuotation(q);
    } catch (e: any) {
      toast.error(e.message || "Failed to load quotation");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--tf-primary)]" />
      </div>
    );
  }

  if (!quotation) return <div>Quotation not found.</div>;

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="rounded-full bg-tf-surface border border-tf-border"
          >
            ←
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="tf-h2 text-tf-text-primary">
                {quotation.quotationRef}
              </h1>
              <StatusBadge status={quotation.status as any} />
            </div>
            <p className="tf-body text-tf-text-secondary mt-1">
              Grand Total: ₨ {quotation.grandTotal?.toLocaleString?.() ?? "0"}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-tf-surface rounded-xl border border-tf-border shadow-sm p-6">
        <h3 className="text-lg font-semibold text-tf-text-primary mb-4">
          Items
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-tf-border text-left text-xs uppercase tracking-wider text-tf-text-muted">
                <th className="py-2">Description</th>
                <th className="py-2">Qty</th>
                <th className="py-2">Unit Price</th>
                <th className="py-2">Line Total</th>
              </tr>
            </thead>
            <tbody>
              {(quotation.items ?? []).map((it) => (
                <tr key={it.id} className="border-b border-tf-border">
                  <td className="py-2 text-tf-text-primary">
                    {it.description}
                  </td>
                  <td className="py-2">{it.quantity}</td>
                  <td className="py-2">{it.unitPrice}</td>
                  <td className="py-2 font-semibold text-tf-success">
                    ₨{" "}
                    {(
                      it.lineTotal ?? it.quantity * it.unitPrice
                    ).toLocaleString?.() ?? "0"}
                  </td>
                </tr>
              ))}
              {(quotation.items ?? []).length === 0 && (
                <tr>
                  <td className="py-6 text-tf-text-muted" colSpan={4}>
                    No items.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-tf-surface rounded-xl border border-tf-border shadow-sm p-6">
        <h3 className="text-lg font-semibold text-tf-text-primary mb-2">
          Notes & Terms
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <p className="text-xs text-tf-text-muted uppercase tracking-wider">
              Notes
            </p>
            <p className="text-sm text-tf-text-primary">
              {quotation.notes || "-"}
            </p>
          </div>
          <div className="space-y-2">
            <p className="text-xs text-tf-text-muted uppercase tracking-wider">
              Terms
            </p>
            <p className="text-sm text-tf-text-primary">
              {quotation.terms || "-"}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-tf-surface rounded-xl border border-tf-border shadow-sm p-6">
        <h3 className="text-lg font-semibold text-tf-text-primary mb-4">
          Activity Log
        </h3>
        {(quotation.activities ?? []).length === 0 ? (
          <div className="text-sm text-tf-text-muted">No activity yet.</div>
        ) : (
          <div className="space-y-3">
            {(quotation.activities ?? []).map((a) => (
              <div
                key={a.id}
                className="border-b border-tf-border pb-3 last:border-b-0"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="font-medium text-tf-text-primary">
                    {a.type}
                  </div>
                  <div className="text-xs text-tf-text-muted">
                    {new Date(a.createdAt).toLocaleString("en-GB")}
                  </div>
                </div>
                <div className="text-sm text-tf-text-muted mt-1">
                  {a.description}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
