import mongoose, { Schema, Document } from "mongoose";

export interface ITokenBlacklist extends Document {
  token: string;
  expiresAt: Date;
}

const TokenBlacklistSchema = new Schema<ITokenBlacklist>({
  token: { type: String, required: true, unique: true },
  expiresAt: { type: Date, required: true },
});

// Automatically delete document when expiresAt is reached
TokenBlacklistSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const TokenBlacklist = mongoose.model<ITokenBlacklist>("TokenBlacklist", TokenBlacklistSchema);
