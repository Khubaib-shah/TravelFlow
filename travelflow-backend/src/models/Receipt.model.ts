import mongoose, { Schema, Document, Types } from "mongoose";

export interface IReceipt extends Document {
  agencyId: Types.ObjectId;
  receiptRef: string;
  bookingId: Types.ObjectId;
  customerId: Types.ObjectId;
  amount: number;
  paymentMethod: string;
  notes?: string;
  date: Date;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ReceiptSchema = new Schema<IReceipt>(
  {
    agencyId: { type: Schema.Types.ObjectId, ref: "Agency", required: true, index: true },
    receiptRef: { type: String, required: true },
    bookingId: { type: Schema.Types.ObjectId, ref: "Booking", required: true },
    customerId: { type: Schema.Types.ObjectId, ref: "Customer", required: true },
    amount: { type: Number, required: true },
    paymentMethod: { type: String, required: true },
    notes: { type: String },
    date: { type: Date, required: true, default: Date.now },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const Receipt = mongoose.model<IReceipt>("Receipt", ReceiptSchema);
