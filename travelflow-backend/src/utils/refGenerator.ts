import mongoose from "mongoose";

const CounterSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  seq: { type: Number, default: 0 },
});

const Counter = mongoose.models.Counter ?? mongoose.model("Counter", CounterSchema);

export type RefPrefix = "BK" | "LD" | "CUS" | "INV" | "EXP" | "SUP" | "RCP";

export async function generateRef(prefix: RefPrefix, agencyId: string): Promise<string> {
  const year = new Date().getFullYear();
  const key = `${prefix}_${agencyId}_${year}`;

  const counter = await Counter.findByIdAndUpdate(
    key,
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );

  return `${prefix}-${year}-${String(counter.seq).padStart(3, "0")}`;
}
