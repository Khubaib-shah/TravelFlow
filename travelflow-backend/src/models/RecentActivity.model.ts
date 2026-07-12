import mongoose, { Schema, Document, Types } from "mongoose";

export interface IRecentActivity extends Document {
  agencyId: Types.ObjectId;
  type: string;
  title: string;
  detail: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

const RecentActivitySchema = new Schema<IRecentActivity>(
  {
    agencyId: { type: Schema.Types.ObjectId, ref: "Agency", required: true, index: true },
    type: { type: String, required: true },
    title: { type: String, required: true },
    detail: { type: String, required: true },
    createdBy: { type: String, required: true },
  },
  { timestamps: true }
);

export const RecentActivity = mongoose.model<IRecentActivity>("RecentActivity", RecentActivitySchema);
