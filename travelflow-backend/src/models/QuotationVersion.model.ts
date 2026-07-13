import mongoose, { Schema, Document, Types } from "mongoose";

export interface IQuotationVersion extends Document {
  agencyId: Types.ObjectId;
  quotationId: Types.ObjectId;

  version: number;
  changes: string; // human-readable summary

  createdBy: Types.ObjectId;

  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const QuotationVersionSchema = new Schema<IQuotationVersion>(
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

    version: { type: Number, required: true },
    changes: { type: String, required: true },

    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },

    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true },
);

QuotationVersionSchema.index(
  { agencyId: 1, quotationId: 1, version: 1 },
  { unique: true },
);

export const QuotationVersion = mongoose.model<IQuotationVersion>(
  "QuotationVersion",
  QuotationVersionSchema,
);
