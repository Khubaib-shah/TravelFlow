import { z } from "zod";

export const supplierSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  category: z.enum(["airline", "hotel", "visa", "transport", "insurance", "consolidator", "other"]),
  contactPerson: z.string().optional(),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  phone: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
});

export type SupplierFormValues = z.infer<typeof supplierSchema>;
