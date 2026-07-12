import mongoose from "mongoose";
import { env } from "./env";

export async function connectDatabase(): Promise<void> {
  mongoose.set("strictQuery", true);

  await mongoose.connect(env.mongodbUri, {
    maxPoolSize: 10,
  });

  console.log(`MongoDB connected: ${env.mongodbUri}`);
}

export async function disconnectDatabase(): Promise<void> {
  await mongoose.disconnect();
}
