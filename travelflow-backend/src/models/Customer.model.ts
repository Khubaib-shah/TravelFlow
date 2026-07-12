import mongoose, { Schema, Document, Types } from "mongoose";

export interface ICustomer extends Document {
  agencyId: Types.ObjectId;
  customerRef: string;
  type: "individual" | "corporate";
  firstName: string;
  lastName: string;
  companyName?: string;
  businessType?: string;
  taxNumber?: string;
  email?: string;
  phone: string;
  whatsapp?: string;
  dateOfBirth?: Date;
  gender?: string;
  cnic?: string;
  passportNumber?: string;
  passportExpiry?: Date;
  nationality?: string;
  address?: string;
  city?: string;
  country?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  internalNotes?: string;
  totalBookings: number;
  totalSpent: number;
  status: "active" | "inactive";
  isDeleted: boolean;
}

const CustomerSchema = new Schema<ICustomer>(
  {
    agencyId: { type: Schema.Types.ObjectId, ref: "Agency", required: true, index: true },
    customerRef: { type: String, required: true },
    type: { type: String, enum: ["individual", "corporate"], required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    companyName: String,
    businessType: String,
    taxNumber: String,
    email: String,
    phone: { type: String, required: true },
    whatsapp: String,
    dateOfBirth: Date,
    gender: String,
    cnic: String,
    passportNumber: String,
    passportExpiry: Date,
    nationality: String,
    address: String,
    city: String,
    country: String,
    emergencyContactName: String,
    emergencyContactPhone: String,
    internalNotes: String,
    totalBookings: { type: Number, default: 0 },
    totalSpent: { type: Number, default: 0 },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

CustomerSchema.index({ agencyId: 1, customerRef: 1 }, { unique: true });

export const Customer = mongoose.model<ICustomer>("Customer", CustomerSchema);

export interface ICustomerNote extends Document {
  agencyId: Types.ObjectId;
  customerId: Types.ObjectId;
  note: string;
  addedBy: string;
}

const CustomerNoteSchema = new Schema<ICustomerNote>(
  {
    agencyId: { type: Schema.Types.ObjectId, ref: "Agency", required: true },
    customerId: { type: Schema.Types.ObjectId, ref: "Customer", required: true, index: true },
    note: { type: String, required: true },
    addedBy: { type: String, required: true },
  },
  { timestamps: true }
);

export const CustomerNote = mongoose.model<ICustomerNote>("CustomerNote", CustomerNoteSchema);

export interface ICustomerDocument extends Document {
  agencyId: Types.ObjectId;
  customerId: Types.ObjectId;
  documentType: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  fileUrl: string;
  notes?: string;
  uploadedBy: string;
}

const CustomerDocumentSchema = new Schema<ICustomerDocument>(
  {
    agencyId: { type: Schema.Types.ObjectId, ref: "Agency", required: true },
    customerId: { type: Schema.Types.ObjectId, ref: "Customer", required: true, index: true },
    documentType: { type: String, required: true },
    fileName: { type: String, required: true },
    fileSize: { type: Number, required: true },
    mimeType: { type: String, required: true },
    fileUrl: { type: String, required: true },
    notes: String,
    uploadedBy: { type: String, required: true },
  },
  { timestamps: true }
);

export const CustomerDocument = mongoose.model<ICustomerDocument>("CustomerDocument", CustomerDocumentSchema);
