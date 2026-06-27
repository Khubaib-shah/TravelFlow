import { z } from "zod";

const phoneRegex = /^(\+92|0)3[0-9]{2}[-\s]?[0-9]{7}$/;

export const userSchema = z.object({
  firstName: z.string().min(2, "First name is required"),
  lastName: z.string().min(2, "Last name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().regex(phoneRegex, "Enter a valid Pakistani number").optional().or(z.literal("")),
  role: z.enum(["admin", "manager", "agent", "accountant"]),
  branchId: z.string().min(1, "Branch is required"),
  status: z.enum(["active", "inactive", "invited"]),
});

export type UserFormValues = z.infer<typeof userSchema>;
