import { z } from "zod";

export const quotationStatusOptions = [
  { label: "Draft", value: "draft" },
  { label: "Sent", value: "sent" },
  { label: "Accepted", value: "accepted" },
  { label: "Rejected", value: "rejected" },
  { label: "Cancelled", value: "cancelled" },
] as const;

export const quotationTaxTypeOptions = [
  { label: "Fixed", value: "fixed" },
  { label: "Percentage", value: "percentage" },
] as const;

export type QuotationStatus = (typeof quotationStatusOptions)[number]["value"];
export type QuotationTaxType =
  (typeof quotationTaxTypeOptions)[number]["value"];

export const quotationItemSchema = z.object({
  id: z.string().optional(),
  description: z.string().min(1, "Item description is required"),
  quantity: z.coerce.number().int().min(1, "Quantity must be >= 1"),
  unitPrice: z.coerce.number().min(0, "Unit price must be >= 0"),
});

export const quotationTaxSchema = z.object({
  id: z.string().optional(),
  label: z.string().min(1, "Tax label is required"),
  taxType: z.enum(["fixed", "percentage"]),
  value: z.coerce.number().min(0, "Tax value must be >= 0"),
});

export const quotationSchema = z
  .object({
    // Quotation title (trip/package title)
    title: z.string().min(1, "Title is required"),

    // Link quotation to an existing customer.
    // NOTE: for UI in this step we will use customerId via a customer name input.
    customerId: z.string().min(1),

    // Owner/agency context is derived elsewhere.
    branchId: z.string().optional(),
    leadId: z.string().optional(),
    agentId: z.string().optional(),

    status: z.enum(["draft", "sent", "accepted", "rejected", "cancelled"]),

    travelType: z.string().min(1, "Travel type is required").default("custom"),
    destination: z.string().min(1, "Destination is required"),
    adults: z.coerce.number().min(0).default(0),
    children: z.coerce.number().min(0).default(0),
    infants: z.coerce.number().min(0).default(0),
    validUntil: z.string().optional(),

    items: z.array(quotationItemSchema).min(1, "Add at least one item"),
    taxes: z.array(quotationTaxSchema).optional().default([]),

    notes: z.string().optional().default(""),
    terms: z.string().optional().default(""),

    // Used for “templates” selection (frontend-only helper)
    templates: z.string().optional().default(""),

    attachments: z
      .array(
        z.object({
          id: z.string().optional(),
          name: z.string().min(1),
          url: z.string().min(1),
          type: z.string().min(1),
        }),
      )
      .optional()
      .default([]),

    revisionBaseVersionId: z.string().optional(),
  })

  .refine((d) => {
    const subtotal = d.items.reduce(
      (acc, it) => acc + it.quantity * it.unitPrice,
      0,
    );
    const taxAmount = (d.taxes ?? []).reduce((acc, t) => {
      if (t.taxType === "fixed") return acc + t.value;
      return acc + subtotal * (t.value / 100);
    }, 0);
    const grandTotal = subtotal + taxAmount;
    return grandTotal >= 0;
  }, "Grand total must be valid");

export type QuotationFormValues = z.infer<typeof quotationSchema>;

export const quotationDefaultValues: QuotationFormValues = {
  title: "",
  customerId: "",
  branchId: undefined,
  leadId: undefined,
  agentId: undefined,

  status: "draft",

  travelType: "custom",
  destination: "",
  adults: 0,
  children: 0,
  infants: 0,
  validUntil: "",

  items: [
    {
      id: undefined,
      description: "",
      quantity: 1,
      unitPrice: 0,
    },
  ],
  taxes: [],

  notes: "",
  terms: "",
  templates: "",
  attachments: [],
  revisionBaseVersionId: undefined,
};
