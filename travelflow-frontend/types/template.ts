export type TemplateType =
  | "quotation_notes"
  | "quotation_terms"
  | "invoice_notes"
  | "invoice_terms";

export interface Template {
  id: string;
  agencyId: string;
  name: string;
  type: TemplateType;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export type CreateTemplatePayload = {
  name: string;
  type: TemplateType;
  content: string;
};

export type UpdateTemplatePayload = Partial<CreateTemplatePayload>;
