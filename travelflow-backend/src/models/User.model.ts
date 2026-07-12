import mongoose, { Schema, Document, Types } from "mongoose";
import bcrypt from "bcryptjs";
import { env } from "../config/env";

export type UserRole = string;
export type UserStatus = "active" | "inactive" | "invited";

export interface IUser extends Document {
  agencyId: Types.ObjectId;
  branchId: Types.ObjectId;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
  role: UserRole;
  status: UserStatus;
  avatarUrl?: string;
  lastLoginAt?: Date;
  isDeleted: boolean;
  comparePassword(candidate: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>(
  {
    agencyId: { type: Schema.Types.ObjectId, ref: "Agency", required: true, index: true },
    branchId: { type: Schema.Types.ObjectId, ref: "Branch", required: true },
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    password: { type: String, required: true, select: false },
    phone: String,
    role: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["active", "inactive", "invited"],
      default: "active",
    },
    avatarUrl: String,
    lastLoginAt: Date,
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

UserSchema.index({ agencyId: 1, email: 1 }, { unique: true });

UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, env.bcryptRounds);
  next();
});

UserSchema.methods.comparePassword = async function (candidate: string) {
  return bcrypt.compare(candidate, this.password);
};

export const User = mongoose.model<IUser>("User", UserSchema);
