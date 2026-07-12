import mongoose, { Schema, Document, Types } from "mongoose";

export interface IRole extends Document {
  agencyId: Types.ObjectId;
  name: string;
  description: string;
  permissions: string[];
  color: string;
  textColor: string;
  isDeleted: boolean;
}

const RoleSchema = new Schema<IRole>(
  {
    agencyId: { type: Schema.Types.ObjectId, ref: "Agency", required: true, index: true },
    name: { type: String, required: true },
    description: { type: String, default: "" },
    permissions: [{ type: String }],
    color: { type: String, required: true },
    textColor: { type: String, required: true },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const Role = mongoose.model<IRole>("Role", RoleSchema);
