import mongoose, { Schema, Document, Types } from "mongoose";

export type TaxType = "percentage" | "fixed";

export interface IQuotationTax extends Document {
  agencyId: Types.ObjectId;
  quotationId: Types.ObjectId;

  taxName: string;
  taxType: TaxType;
  taxValue: number; // percentage or fixed amount
  taxAmount: number;

  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const QuotationTaxSchema = new Schema<IQuotationTax>(
  {
    agencyId: {
      type: Schema.Types.ObjectId,
      ref: "Agency",
      required: true,
      index: true,
    },
    quotationId: {
      type: Schema.Types.ObjectId,
      ref: "Quotation",
      required: true,
      index: true,
    },

    taxName: { type: String, required: true },
    taxType: { type: String, enum: ["percentage", "fixed"], required: true },
    taxValue: { type: Number, required: true, default: 0 },
    taxAmount: { type: Number, required: true, default: 0 },

    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export const QuotationTax = mongoose.model<IQuotationTax>(
  "QuotationTax",
  QuotationTaxSchema,
);
