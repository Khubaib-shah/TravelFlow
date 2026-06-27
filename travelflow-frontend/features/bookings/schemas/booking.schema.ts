import { z } from "zod";

export const bookingSchema = z.object({
  customerId: z.string().min(1, "Customer is required"),
  supplierId: z.string().min(1, "Supplier is required"),
  airline: z.string().min(2, "Airline name is required"),
  departureCity: z.string().min(3, "Departure city required"),
  arrivalCity: z.string().min(3, "Arrival city required"),
  departureDate: z.date({ error: "Departure date is required" }),
  returnDate: z.date().optional(),
  pnr: z.string().length(6, "PNR must be exactly 6 characters"),
  ticketNumber: z.string().optional(),
  costPrice: z.preprocess(
    (val) => (val === "" || val === undefined || val === null ? undefined : Number(val)),
    z.number({ error: "Cost price must be a number" }).min(1, "Cost price is required")
  ),
  salePrice: z.preprocess(
    (val) => (val === "" || val === undefined || val === null ? undefined : Number(val)),
    z.number({ error: "Sale price must be a number" }).min(1, "Sale price is required")
  ),
  paymentStatus: z.enum(["unpaid", "partial", "paid"]),
  amountReceived: z.preprocess(
    (val) => (val === "" || val === undefined || val === null ? 0 : Number(val)),
    z.number().min(0).optional()
  ),
  notes: z.string().optional(),
});

export type BookingFormValues = z.infer<typeof bookingSchema>;
