import { Request, Response } from "express";
import { createApp } from "../src/app";
import { connectDatabase } from "../src/config/database";

let isConnected = false;
const app = createApp();

export default async function handler(req: Request, res: Response) {
  if (!isConnected) {
    await connectDatabase();
    isConnected = true;
  }
  return app(req, res);
}
