import mongoose, { Schema, Document, Types } from "mongoose";

export interface IAgency extends Document {
  name: string;
  slug: string;
  code: string;
  contactEmail: string;
  contactPhone: string;
  address?: string;
  city: string;
  country: string;
  currency: string;
  registrationNo?: string;
  logoUrl?: string;
  primaryColor?: string;
  notifications?: {
    emailAlerts: boolean;
    smsAlerts: boolean;
    dailyReports: boolean;
  };
  status: "active" | "suspended" | "inactive";
  isDeleted: boolean;
  deletedAt?: Date;
}

const AgencySchema = new Schema<IAgency>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    code: { type: String, required: true },
    contactEmail: { type: String, required: true, lowercase: true },
    contactPhone: { type: String, required: true },
    address: String,
    city: { type: String, required: true },
    country: { type: String, default: "Pakistan" },
    currency: { type: String, default: "PKR" },
    registrationNo: String,
    logoUrl: String,
    primaryColor: { type: String, default: "#000000" },
    notifications: {
      emailAlerts: { type: Boolean, default: true },
      smsAlerts: { type: Boolean, default: false },
      dailyReports: { type: Boolean, default: true },
    },
    status: { type: String, enum: ["active", "suspended", "inactive"], default: "active" },
    isDeleted: { type: Boolean, default: false },
    deletedAt: Date,
  },
  { timestamps: true }
);

export const Agency = mongoose.model<IAgency>("Agency", AgencySchema);

export interface IBranch extends Document {
  agencyId: Types.ObjectId;
  name: string;
  code: string;
  city: string;
  address?: string;
  phone?: string;
  isHeadOffice: boolean;
  status: "active" | "inactive";
  isDeleted: boolean;
}

const BranchSchema = new Schema<IBranch>(
  {
    agencyId: { type: Schema.Types.ObjectId, ref: "Agency", required: true, index: true },
    name: { type: String, required: true },
    code: { type: String, required: true },
    city: { type: String, required: true },
    address: String,
    phone: String,
    isHeadOffice: { type: Boolean, default: false },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

BranchSchema.index({ agencyId: 1, code: 1 }, { unique: true });

export const Branch = mongoose.model<IBranch>("Branch", BranchSchema);
