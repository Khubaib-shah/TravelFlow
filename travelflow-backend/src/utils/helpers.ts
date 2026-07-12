import { IUser } from "../models/User.model";

export function userDisplayName(user?: IUser | null): string {
  if (!user) return "System";
  return `${user.firstName} ${user.lastName}`.trim();
}

export function normalizePhone(phone: string): string {
  return phone.replace(/\D/g, "");
}

export function countryForCity(city: string): string {
  if (["Dubai", "Abu Dhabi"].includes(city)) return "UAE";
  return "Pakistan";
}
