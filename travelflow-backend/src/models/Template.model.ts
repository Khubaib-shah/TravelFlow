import mongoose, { Schema, Document, Types } from "mongoose";

export type TemplateType =
  | "quotation_notes"
  | "quotation_terms"
  | "invoice_notes"
  | "invoice_terms";

export interface ITemplate extends Document {
  agencyId: Types.ObjectId;
  name: string;
  type: TemplateType;
  content: string;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const TemplateSchema = new Schema<ITemplate>(
  {
    agencyId: { type: Schema.Types.ObjectId, ref: "Agency", required: true, index: true },
    name: { type: String, required: true },
    type: {
      type: String,
      enum: ["quotation_notes", "quotation_terms", "invoice_notes", "invoice_terms"],
      required: true,
    },
    content: { type: String, required: true },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const Template = mongoose.model<ITemplate>("Template", TemplateSchema);
