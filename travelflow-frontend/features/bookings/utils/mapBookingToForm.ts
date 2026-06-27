import type { Booking } from "@/types";
import type { BookingFormValues } from "@/features/bookings/schemas/booking.schema";

export function mapBookingToForm(booking: Booking): BookingFormValues {
  return {
    customerId: booking.customerId,
    supplierId: booking.supplierId,
    airline: booking.airline,
    departureCity: booking.departureCity,
    arrivalCity: booking.arrivalCity,
    departureDate: new Date(booking.departureDate),
    returnDate: booking.returnDate ? new Date(booking.returnDate) : undefined,
    pnr: booking.pnr,
    ticketNumber: booking.ticketNumber ?? "",
    costPrice: booking.costPrice,
    salePrice: booking.salePrice,
    paymentStatus: booking.paymentStatus,
    amountReceived: booking.amountReceived ?? 0,
    notes: booking.notes ?? "",
  };
}

export const bookingDefaultValues: BookingFormValues = {
  customerId: "",
  supplierId: "",
  airline: "",
  departureCity: "",
  arrivalCity: "",
  departureDate: new Date(),
  pnr: "",
  ticketNumber: "",
  costPrice: undefined as unknown as number,
  salePrice: undefined as unknown as number,
  paymentStatus: "unpaid",
  amountReceived: 0,
  notes: "",
};
