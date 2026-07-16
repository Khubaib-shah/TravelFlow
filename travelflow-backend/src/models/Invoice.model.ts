import mongoose, { Schema, Document, Types } from "mongoose";

export interface IInvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

export interface IInvoice extends Document {
  agencyId: Types.ObjectId;
  branchId?: Types.ObjectId;
  invoiceRef: string;
  bookingId?: Types.ObjectId;
  customerId: Types.ObjectId;
  items: IInvoiceItem[];
  subtotal: number;
  tax: number;
  total: number;
  status: "draft" | "sent" | "paid" | "overdue" | "cancelled";
  dueDate?: Date;
  paidAt?: Date;
  notes?: string;
  terms?: string;
  createdAt: Date;
  updatedAt: Date;
}

const InvoiceItemSchema = new Schema<IInvoiceItem>({
  description: { type: String, required: true },
  quantity: { type: Number, required: true, default: 1 },
  unitPrice: { type: Number, required: true },
  amount: { type: Number, required: true },
});

const InvoiceSchema = new Schema<IInvoice>(
  {
    agencyId: { type: Schema.Types.ObjectId, ref: "Agency", required: true, index: true },
    branchId: { type: Schema.Types.ObjectId, ref: "Branch", index: true },
    invoiceRef: { type: String, required: true, unique: true },
    bookingId: { type: Schema.Types.ObjectId, ref: "Booking", index: true },
    customerId: { type: Schema.Types.ObjectId, ref: "Customer", required: true, index: true },
    items: [InvoiceItemSchema],
    subtotal: { type: Number, required: true, default: 0 },
    tax: { type: Number, required: true, default: 0 },
    total: { type: Number, required: true, default: 0 },
    status: {
      type: String,
      enum: ["draft", "sent", "paid", "overdue", "cancelled"],
      default: "draft",
    },
    dueDate: Date,
    paidAt: Date,
    notes: String,
    terms: String,
  },
  { timestamps: true }
);

InvoiceSchema.index({ agencyId: 1, invoiceRef: 1 }, { unique: true });

export const Invoice = mongoose.model<IInvoice>("Invoice", InvoiceSchema);
