/**
 * Compatibility wrapper for @hookform/resolvers v5 + react-hook-form v7
 * These two packages have duplicate type instances that cause TS2719 errors.
 * This wrapper casts the resolver to suppress the issue safely.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
import { zodResolver as _zodResolver } from "@hookform/resolvers/zod";
import type { Resolver, FieldValues } from "react-hook-form";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function zodResolver<T extends FieldValues>(schema: any): Resolver<T> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return _zodResolver(schema) as unknown as Resolver<T>;
}
