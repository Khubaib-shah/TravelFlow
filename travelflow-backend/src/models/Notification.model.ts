import mongoose, { Schema, Document, Types } from "mongoose";

export interface INotification extends Document {
  agencyId: Types.ObjectId;
  branchId?: Types.ObjectId;
  recipientId: Types.ObjectId;
  type: "info" | "success" | "warning" | "error";
  title: string;
  body: string;
  entityType?: "lead" | "booking" | "receipt" | "customer" | "user" | "expense";
  entityId?: string;
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    agencyId: { type: Schema.Types.ObjectId, ref: "Agency", required: true, index: true },
    branchId: { type: Schema.Types.ObjectId, ref: "Branch", index: true },
    recipientId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    type: { type: String, enum: ["info", "success", "warning", "error"], default: "info" },
    title: { type: String, required: true },
    body: { type: String, required: true },
    entityType: { type: String, enum: ["lead", "booking", "receipt", "customer", "user", "expense"] },
    entityId: String,
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const Notification = mongoose.model<INotification>("Notification", NotificationSchema);
