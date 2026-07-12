import mongoose, { Schema, Document, Types } from "mongoose";

export interface ISupplier extends Document {
  agencyId: Types.ObjectId;
  name: string;
  category: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  website?: string;
  address?: string;
  city?: string;
  country?: string;
  taxId?: string;
  balance: number;
  status: "active" | "inactive";
  isDeleted: boolean;
}

const SupplierSchema = new Schema<ISupplier>(
  {
    agencyId: { type: Schema.Types.ObjectId, ref: "Agency", required: true, index: true },
    name: { type: String, required: true },
    category: { type: String, required: true },
    contactPerson: String,
    email: String,
    phone: String,
    website: String,
    address: String,
    city: String,
    country: String,
    taxId: String,
    balance: { type: Number, default: 0 },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const Supplier = mongoose.model<ISupplier>("Supplier", SupplierSchema);

export interface IBooking extends Document {
  agencyId: Types.ObjectId;
  bookingRef: string;
  pnr: string;
  ticketNumber?: string;
  customerId: Types.ObjectId;
  supplierId: Types.ObjectId;
  branchId: Types.ObjectId;
  agentId: Types.ObjectId;
  leadId?: Types.ObjectId;
  airline: string;
  departureCity: string;
  arrivalCity: string;
  departureDate: Date;
  returnDate?: Date;
  costPrice: number;
  salePrice: number;
  profit: number;
  profitMargin: number;
  bookingStatus: string;
  paymentStatus: string;
  amountReceived: number;
  balance: number;
  notes?: string;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const BookingSchema = new Schema<IBooking>(
  {
    agencyId: { type: Schema.Types.ObjectId, ref: "Agency", required: true, index: true },
    bookingRef: { type: String, required: true },
    pnr: { type: String, default: "" },
    ticketNumber: String,
    customerId: { type: Schema.Types.ObjectId, ref: "Customer", required: true },
    supplierId: { type: Schema.Types.ObjectId, ref: "Supplier", required: true },
    branchId: { type: Schema.Types.ObjectId, ref: "Branch", required: true },
    agentId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    leadId: { type: Schema.Types.ObjectId, ref: "Lead" },
    airline: { type: String, required: true },
    departureCity: { type: String, required: true },
    arrivalCity: { type: String, required: true },
    departureDate: { type: Date, required: true },
    returnDate: Date,
    costPrice: { type: Number, required: true },
    salePrice: { type: Number, required: true },
    profit: { type: Number, required: true },
    profitMargin: { type: Number, required: true },
    bookingStatus: { type: String, default: "confirmed" },
    paymentStatus: { type: String, default: "unpaid" },
    amountReceived: { type: Number, default: 0 },
    balance: { type: Number, default: 0 },
    notes: String,
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

BookingSchema.index({ agencyId: 1, bookingRef: 1 }, { unique: true });

BookingSchema.pre("save", function (next) {
  this.profit = this.salePrice - this.costPrice;
  this.profitMargin = this.salePrice > 0 ? (this.profit / this.salePrice) * 100 : 0;
  this.balance = this.salePrice - (this.amountReceived ?? 0);
  next();
});

export const Booking = mongoose.model<IBooking>("Booking", BookingSchema);

export interface IExpense extends Document {
  agencyId: Types.ObjectId;
  branchId: Types.ObjectId;
  expenseRef: string;
  title: string;
  category: string;
  amount: number;
  date: Date;
  paidTo?: string;
  paymentMethod: string;
  receiptUrl?: string;
  notes?: string;
  recordedById: Types.ObjectId;
  status: "approved" | "pending" | "rejected";
  isDeleted: boolean;
}

const ExpenseSchema = new Schema<IExpense>(
  {
    agencyId: { type: Schema.Types.ObjectId, ref: "Agency", required: true, index: true },
    branchId: { type: Schema.Types.ObjectId, ref: "Branch", required: true },
    expenseRef: { type: String, required: true },
    title: { type: String, required: true },
    category: { type: String, required: true },
    amount: { type: Number, required: true },
    date: { type: Date, required: true },
    paidTo: String,
    paymentMethod: { type: String, required: true },
    receiptUrl: String,
    notes: String,
    recordedById: { type: Schema.Types.ObjectId, ref: "User", required: true },
    status: { type: String, enum: ["approved", "pending", "rejected"], default: "approved" },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

ExpenseSchema.index({ agencyId: 1, expenseRef: 1 }, { unique: true });

export const Expense = mongoose.model<IExpense>("Expense", ExpenseSchema);
