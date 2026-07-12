import mongoose, { Schema, Document, Types } from "mongoose";

export interface ILead extends Document {
  agencyId: Types.ObjectId;
  leadRef: string;
  name: string;
  phone: string;
  whatsapp?: string;
  email?: string;
  destination: string;
  travelDate?: Date;
  budget?: number;
  adults: number;
  children: number;
  specialRequirements?: string;
  source: string;
  status: string;
  assignedAgentId?: Types.ObjectId;
  branchId: Types.ObjectId;
  notes?: string;
  lastContactedAt?: Date;
  isDeleted: boolean;
}

const LeadSchema = new Schema<ILead>(
  {
    agencyId: { type: Schema.Types.ObjectId, ref: "Agency", required: true, index: true },
    leadRef: { type: String, required: true },
    name: { type: String, required: true },
    phone: { type: String, required: true },
    whatsapp: String,
    email: String,
    destination: { type: String, required: true },
    travelDate: Date,
    budget: Number,
    adults: { type: Number, default: 1 },
    children: { type: Number, default: 0 },
    specialRequirements: String,
    source: { type: String, required: true },
    status: { type: String, required: true, default: "new" },
    assignedAgentId: { type: Schema.Types.ObjectId, ref: "User" },
    branchId: { type: Schema.Types.ObjectId, ref: "Branch", required: true },
    notes: String,
    lastContactedAt: Date,
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

LeadSchema.index({ agencyId: 1, leadRef: 1 }, { unique: true });

export const Lead = mongoose.model<ILead>("Lead", LeadSchema);

export interface ILeadActivity extends Document {
  agencyId: Types.ObjectId;
  leadId: Types.ObjectId;
  type: string;
  description: string;
  outcome?: string;
  createdBy: string;
}

const LeadActivitySchema = new Schema<ILeadActivity>(
  {
    agencyId: { type: Schema.Types.ObjectId, ref: "Agency", required: true },
    leadId: { type: Schema.Types.ObjectId, ref: "Lead", required: true, index: true },
    type: { type: String, required: true },
    description: { type: String, required: true },
    outcome: String,
    createdBy: { type: String, required: true },
  },
  { timestamps: true }
);

export const LeadActivity = mongoose.model<ILeadActivity>("LeadActivity", LeadActivitySchema);
