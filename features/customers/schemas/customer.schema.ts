import { z } from "zod";

const phoneRegex = /^(\+92|0)3[0-9]{2}[-\s]?[0-9]{7}$/;

export const customerSchema = z
  .object({
    type: z.enum(["individual", "corporate"]),
    firstName: z.string().min(2, "First name must be at least 2 characters").max(30),
    lastName: z.string().min(2, "Last name must be at least 2 characters").max(30),
    companyName: z.string().optional(),
    businessType: z.string().optional(),
    taxNumber: z.string().optional(),
    email: z.string().email("Invalid email address").optional().or(z.literal("")),
    phone: z.string().regex(phoneRegex, "Enter a valid Pakistani number (03XX-XXXXXXX)"),
    whatsapp: z.string().regex(phoneRegex, "Enter a valid Pakistani number").optional().or(z.literal("")),
    dateOfBirth: z.string().optional(),
    gender: z.enum(["male", "female", "prefer_not_to_say"]).optional(),
    cnic: z.string().optional().or(z.literal("")),
    passportNumber: z.string().optional().or(z.literal("")),
    city: z.string().min(1, "City is required"),
    country: z.string().optional(),
    address: z.string().optional(),
    emergencyContactName: z.string().optional(),
    emergencyContactPhone: z.string().optional().or(z.literal("")),
    internalNotes: z.string().max(500).optional().or(z.literal("")),
  })
  .refine(
    (data) => data.type !== "corporate" || (data.companyName && data.companyName.length >= 2),
    { message: "Company name is required for corporate customers", path: ["companyName"] }
  );

export type CustomerFormValues = z.infer<typeof customerSchema>;

export const PAKISTAN_CITIES = [
  "Karachi",
  "Lahore",
  "Islamabad",
  "Rawalpindi",
  "Peshawar",
  "Multan",
  "Faisalabad",
  "Dubai",
  "Abu Dhabi",
];

export function countryForCity(city: string): string {
  if (["Dubai", "Abu Dhabi"].includes(city)) return "UAE";
  return "Pakistan";
}
