import type { Quotation } from "@/types/quotation";
import type { QuotationFormValues } from "../schemas/quotation.schema";

export function mapQuotationToForm(q: Quotation): QuotationFormValues {
  return {
    title: (q as any).title ?? "",
    customerId: q.customerId ?? q.customer?.id ?? "",
    branchId: q.branchId ?? q.branch?.id,

    leadId: q.leadId ?? q.lead?.id,
    agentId: q.agentId ?? q.agent?.id,

    status: q.status,

    items: (Array.isArray(q.items) ? q.items : []).map((it) => ({
      id: it.id,
      description: it.description,
      quantity: it.quantity,
      unitPrice: it.unitPrice,
    })),
    taxes: (Array.isArray(q.taxes) ? q.taxes : []).map((t) => ({
      id: t.id,
      label: t.label,
      taxType: t.taxType as any,
      value: t.value,
    })),

    notes: q.notes ?? "",
    terms: q.terms ?? "",
    templates: q.templates ?? "",
    attachments: (Array.isArray(q.attachments) ? q.attachments : []).map(
      (a) => ({
        id: a.id,
        name: a.name,
        url: a.url,
        type: a.type,
      }),
    ),

    revisionBaseVersionId: undefined,
  };
}
