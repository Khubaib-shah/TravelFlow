import mongoose, { Schema, Document, Types } from "mongoose";

export interface IRecentActivity extends Document {
  agencyId: Types.ObjectId;
  branchId?: Types.ObjectId;
  type: string;
  title: string;
  detail: string;
  createdBy: string;
  createdByUserId?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const RecentActivitySchema = new Schema<IRecentActivity>(
  {
    agencyId: { type: Schema.Types.ObjectId, ref: "Agency", required: true },
    branchId: { type: Schema.Types.ObjectId, ref: "Branch" },
    type: { type: String, required: true },
    title: { type: String, required: true },
    detail: { type: String, required: true },
    createdBy: { type: String, required: true },
    createdByUserId: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

// Compound index for efficient tenant + time-range queries
RecentActivitySchema.index({ agencyId: 1, createdAt: -1 });
// Branch-scoped activity queries
RecentActivitySchema.index({ agencyId: 1, branchId: 1, createdAt: -1 });

export const RecentActivity = mongoose.model<IRecentActivity>("RecentActivity", RecentActivitySchema);

