import mongoose, { Schema, Document, Types } from "mongoose";

export interface IBookingActivity extends Document {
  agencyId: Types.ObjectId;
  bookingId: Types.ObjectId;
  type: string;
  title: string;
  description: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

const BookingActivitySchema = new Schema<IBookingActivity>(
  {
    agencyId: { type: Schema.Types.ObjectId, ref: "Agency", required: true },
    bookingId: { type: Schema.Types.ObjectId, ref: "Booking", required: true, index: true },
    type: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    createdBy: { type: String, required: true },
  },
  { timestamps: true }
);

BookingActivitySchema.index({ agencyId: 1, bookingId: 1, createdAt: -1 });

export const BookingActivity = mongoose.model<IBookingActivity>("BookingActivity", BookingActivitySchema);
