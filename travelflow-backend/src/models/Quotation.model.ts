import mongoose, { Schema, Document, Types } from "mongoose";

export type QuotationStatus =
  | "draft"
  | "sent"
  | "negotiation"
  | "accepted"
  | "rejected"
  | "expired"
  | "cancelled";

export type TravelType =
  | "visa"
  | "holiday_package"
  | "honey moon"
  | "umrah"
  | "hajj"
  | "flight"
  | "hotel"
  | "corporate"
  | "custom";

export type QuotationCustomerType =
  | "walk_in"
  | "existing_lead"
  | "existing_customer";

export interface IQuotation extends Document {
  agencyId: Types.ObjectId;
  quotationNumber: string;

  leadId?: Types.ObjectId;
  customerId?: Types.ObjectId;

  branchId: Types.ObjectId;
  consultantId: Types.ObjectId;

  travelType: string;
  destination: string;
  departureDate?: Date;
  returnDate?: Date;

  adults: number;
  children: number;
  infants: number;

  currency: string;

  subtotal: number;
  agencyFee: number;
  discount: number;
  taxTotal: number;
  total: number;
  estimatedProfit: number;

  status: QuotationStatus;
  validUntil?: Date;

  customerNotes?: string;
  internalNotes?: string;

  termsTemplateId?: Types.ObjectId;

  authorizedSignature?: string;

  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const QuotationSchema = new Schema<IQuotation>(
  {
    agencyId: {
      type: Schema.Types.ObjectId,
      ref: "Agency",
      required: true,
      index: true,
    },
    quotationNumber: { type: String, required: true },

    leadId: { type: Schema.Types.ObjectId, ref: "Lead" },
    customerId: { type: Schema.Types.ObjectId, ref: "Customer" },

    branchId: {
      type: Schema.Types.ObjectId,
      ref: "Branch",
      required: true,
      index: true,
    },
    consultantId: { type: Schema.Types.ObjectId, ref: "User", required: true },

    travelType: { type: String, required: true },
    destination: { type: String, required: true },
    departureDate: { type: Date },
    returnDate: { type: Date },

    adults: { type: Number, default: 0 },
    children: { type: Number, default: 0 },
    infants: { type: Number, default: 0 },

    currency: { type: String, required: true, default: "PKR" },

    subtotal: { type: Number, default: 0 },
    agencyFee: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    taxTotal: { type: Number, default: 0 },
    total: { type: Number, default: 0 },
    estimatedProfit: { type: Number, default: 0 },

    status: {
      type: String,
      enum: [
        "draft",
        "sent",
        "negotiation",
        "accepted",
        "rejected",
        "expired",
        "cancelled",
      ],
      default: "draft",
    },

    validUntil: { type: Date },

    customerNotes: { type: String },
    internalNotes: { type: String },

    termsTemplateId: { type: Schema.Types.ObjectId },

    authorizedSignature: { type: String },

    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true },
);

QuotationSchema.index({ agencyId: 1, quotationNumber: 1 }, { unique: true });

export const Quotation = mongoose.model<IQuotation>(
  "Quotation",
  QuotationSchema,
);
