import mongoose, { Schema, Document, Types } from "mongoose";

export interface IQuotationAttachment extends Document {
  agencyId: Types.ObjectId;
  quotationId: Types.ObjectId;

  fileName: string;
  fileUrl: string;
  mimeType: string;

  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const QuotationAttachmentSchema = new Schema<IQuotationAttachment>(
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

    fileName: { type: String, required: true },
    fileUrl: { type: String, required: true },
    mimeType: { type: String, required: true },

    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export const QuotationAttachment = mongoose.model<IQuotationAttachment>(
  "QuotationAttachment",
  QuotationAttachmentSchema,
);
