import { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/ApiError";

export function errorMiddleware(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  if (err instanceof ApiError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      code: err.code,
      errors: err.errors,
      timestamp: new Date().toISOString(),
    });
    return;
  }

  console.error(err);
  res.status(500).json({
    success: false,
    message: "Internal server error",
    code: "INTERNAL_ERROR",
    timestamp: new Date().toISOString(),
  });
}

export function notFoundMiddleware(_req: Request, res: Response) {
  res.status(404).json({
    success: false,
    message: "Route not found",
    code: "NOT_FOUND",
    timestamp: new Date().toISOString(),
  });
}
