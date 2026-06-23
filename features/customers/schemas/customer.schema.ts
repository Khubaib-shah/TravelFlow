import { z } from "zod";

export const customerSchema = z.object({
  type: z.enum(["individual", "corporate"]),
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  companyName: z.string().optional(),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  phone: z.string().min(10, "Valid phone number is required"),
  whatsapp: z.string().optional(),
  city: z.string().optional(),
});

export type CustomerFormValues = z.infer<typeof customerSchema>;
