import { z } from "zod";

export const leadSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().min(10, "Valid phone number is required"),
  whatsapp: z.string().optional(),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  destination: z.string().min(2, "Destination is required"),
  travelDate: z.date().optional(),
  budget: z.preprocess(
    (val) => (val === "" || val === undefined || val === null ? undefined : Number(val)),
    z.number().min(0).optional()
  ),
  source: z.enum(["walk_in", "whatsapp", "facebook", "instagram", "website", "referral", "google_ads"]),
  status: z.enum(["new", "contacted", "follow_up", "interested", "negotiation", "converted", "lost"]),
  notes: z.string().optional(),
});

export type LeadFormValues = z.infer<typeof leadSchema>;
