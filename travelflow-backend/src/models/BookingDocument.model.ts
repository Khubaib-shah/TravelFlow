import mongoose, { Schema, Document, Types } from "mongoose";

export interface IBookingDocument extends Document {
  agencyId: Types.ObjectId;
  bookingId: Types.ObjectId;
  name: string;
  url: string;
  type: string;
  uploadedBy: string;
  createdAt: Date;
  updatedAt: Date;
}

const BookingDocumentSchema = new Schema<IBookingDocument>(
  {
    agencyId: { type: Schema.Types.ObjectId, ref: "Agency", required: true, index: true },
    bookingId: { type: Schema.Types.ObjectId, ref: "Booking", required: true, index: true },
    name: { type: String, required: true },
    url: { type: String, required: true },
    type: { type: String, required: true },
    uploadedBy: { type: String, required: true },
  },
  { timestamps: true }
);

export const BookingDocument = mongoose.model<IBookingDocument>("BookingDocument", BookingDocumentSchema);
