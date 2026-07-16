import { z } from "zod";

// International phone: allows +, digits, spaces, dashes, parens. Min 7, max 20 chars.
const phoneRegex = /^[+]?[\d\s\-().]{7,20}$/;

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const leadSchema = z.object({
  name: z.string().min(2).max(60),
  phone: z.string().regex(phoneRegex, "Enter a valid phone number"),
  whatsapp: z.string().regex(phoneRegex).optional().or(z.literal("")),
  email: z.string().email().optional().or(z.literal("")),
  destination: z.string().min(2),
  travelDate: z.string().optional(),
  budget: z.preprocess(
    (val) => (val === "" || val === undefined || val === null ? undefined : Number(val)),
    z.number().min(0).optional()
  ),
  adults: z.coerce.number().int().min(1).max(20).default(1),
  children: z.coerce.number().int().min(0).max(10).default(0),
  specialRequirements: z.string().max(500).optional().or(z.literal("")),
  source: z.enum(["walk_in", "whatsapp", "facebook", "instagram", "website", "referral", "google_ads"]),
  status: z.enum(["new", "contacted", "follow_up", "interested", "negotiation", "converted", "lost"]),
  assignedAgentId: z.string().optional(),
  branchId: z.string().optional(),
  notes: z.string().max(1000).optional().or(z.literal("")),
});

export const leadActivitySchema = z.object({
  type: z.enum([
    "note",
    "call",
    "whatsapp",
    "email",
    "status_change",
    "meeting",
    "site_visit",
    "booking_created",
  ]),
  description: z.string().min(1),
  outcome: z.enum(["reached", "no_answer", "callback_requested", "meeting_scheduled"]).optional(),
});

export const customerSchema = z
  .object({
    type: z.enum(["individual", "corporate"]),
    firstName: z.string().min(2).max(30),
    lastName: z.string().min(2).max(30),
    companyName: z.string().optional(),
    businessType: z.string().optional(),
    taxNumber: z.string().optional(),
    email: z.string().email().optional().or(z.literal("")),
    phone: z.string().regex(phoneRegex),
    whatsapp: z.string().regex(phoneRegex).optional().or(z.literal("")),
    dateOfBirth: z.string().optional(),
    gender: z.enum(["male", "female", "prefer_not_to_say"]).optional(),
    cnic: z.string().optional().or(z.literal("")),
    passportNumber: z.string().optional().or(z.literal("")),
    city: z.string().min(1),
    country: z.string().optional(),
    address: z.string().optional(),
    emergencyContactName: z.string().optional(),
    emergencyContactPhone: z.string().optional().or(z.literal("")),
    internalNotes: z.string().max(500).optional().or(z.literal("")),
  })
  .refine((data) => data.type !== "corporate" || (data.companyName && data.companyName.length >= 2), {
    message: "Company name is required for corporate customers",
    path: ["companyName"],
  });

export const bookingSchema = z.object({
  customerId: z.string().min(1),
  supplierId: z.string().min(1),
  airline: z.string().min(2),
  departureCity: z.string().min(3),
  arrivalCity: z.string().min(3),
  departureDate: z.coerce.date(),
  returnDate: z.coerce.date().optional(),
  pnr: z.string().min(4).max(10),
  ticketNumber: z.string().optional(),
  costPrice: z.preprocess(
    (val) => (val === "" || val === undefined || val === null ? undefined : Number(val)),
    z.number().min(1)
  ),
  salePrice: z.preprocess(
    (val) => (val === "" || val === undefined || val === null ? undefined : Number(val)),
    z.number().min(1)
  ),
  paymentStatus: z.enum(["unpaid", "partial", "paid"]),
  amountReceived: z.preprocess(
    (val) => (val === "" || val === undefined || val === null ? 0 : Number(val)),
    z.number().min(0).optional()
  ),
  notes: z.string().optional(),
  leadId: z.string().optional(),
  branchId: z.string().optional(),
  agentId: z.string().optional(),
});

export const convertLeadSchema = bookingSchema.omit({ customerId: true });

export const supplierSchema = z.object({
  name: z.string().min(2),
  category: z.enum(["airline", "hotel", "visa", "transport", "insurance", "consolidator", "other"]),
  contactPerson: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
});

export const branchSchema = z.object({
  name: z.string().min(2),
  code: z.string().min(2).max(8).optional(),
  city: z.string().min(2),
  address: z.string().optional(),
  phone: z.string().optional(),
  isHeadOffice: z.boolean().optional(),
  status: z.enum(["active", "inactive"]).optional(),
});


export const expenseSchema = z.object({
  title: z.string().min(2),
  category: z.enum(["salary", "rent", "marketing", "utilities", "office_supplies", "software", "travel", "other"]),
  amount: z.preprocess(
    (val) => (val === "" || val === undefined || val === null ? undefined : Number(val)),
    z.number().min(1)
  ),
  date: z.coerce.date(),
  paidTo: z.string().optional(),
  paymentMethod: z.enum(["cash", "bank_transfer", "credit_card", "cheque"]),
  notes: z.string().optional(),
  branchId: z.string().optional(),
});

export const userSchema = z.object({
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  email: z.string().email(),
  phone: z.string().regex(phoneRegex).optional().or(z.literal("")),
  role: z.string().min(1),
  branchId: z.string().min(1),
  status: z.enum(["active", "inactive", "invited"]),
  password: z.string().min(6).optional(),
});

export const rolePermissionsSchema = z.object({
  permissions: z.array(z.string()),
});

export const createRoleSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional().default(""),
  permissions: z.array(z.string()).default([]),
  color: z.string().min(3),
  textColor: z.string().min(3),
});

export const customerNoteSchema = z.object({
  note: z.string().min(1),
});

export const customerDocumentSchema = z.object({
  documentType: z.string().min(1),
  fileName: z.string().min(1),
  fileSize: z.number().min(0),
  mimeType: z.string().min(1),
  fileUrl: z.string().url().refine((url) => url.startsWith("https://"), { message: "File URL must use HTTPS" }),
  notes: z.string().optional(),
});

export const idParamSchema = z.object({
  id: z.string().min(1),
});

export const leadIdParamSchema = z.object({
  leadId: z.string().min(1),
});

export const roleIdParamSchema = z.object({
  roleId: z.string().min(1),
});
