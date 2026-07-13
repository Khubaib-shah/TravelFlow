import mongoose, { Schema, Document, Types } from "mongoose";

export interface IQuotationItem extends Document {
  agencyId: Types.ObjectId;
  quotationId: Types.ObjectId;

  serviceCategory: string;
  title: string;
  description?: string;

  quantity: number;
  unit: string;

  costPrice: number;
  sellingPrice: number;

  total: number; // selling total

  sortOrder: number;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const QuotationItemSchema = new Schema<IQuotationItem>(
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

    serviceCategory: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String },

    quantity: { type: Number, required: true, default: 1 },
    unit: { type: String, required: true, default: "Person" },

    costPrice: { type: Number, required: true, default: 0 },
    sellingPrice: { type: Number, required: true, default: 0 },

    total: { type: Number, required: true, default: 0 },

    sortOrder: { type: Number, required: true, default: 0 },

    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true },
);

QuotationItemSchema.pre("save", function (next) {
  // selling total is quantity * sellingPrice
  this.total = (this.quantity ?? 0) * (this.sellingPrice ?? 0);
  next();
});

export const QuotationItem = mongoose.model<IQuotationItem>(
  "QuotationItem",
  QuotationItemSchema,
);
