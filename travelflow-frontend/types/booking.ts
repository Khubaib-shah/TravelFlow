import { Customer } from "./customer";
import { Supplier } from "./supplier";

export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'refunded' | 'completed';
export type PaymentStatus = 'unpaid' | 'partial' | 'paid';

export interface Booking {
  id: string;
  bookingRef: string;        // BK-2024-001
  pnr: string;               // 6-char
  ticketNumber?: string;
  customerId: string;
  customer?: Customer;
  supplierId: string;
  supplier?: Supplier;
  branchId: string;
  branch?: { id: string; name: string };
  agentId: string;
  agent?: { id: string; name: string };
  leadId?: string;
  airline: string;
  departureCity: string;     // IATA code
  arrivalCity: string;
  departureDate: Date;
  returnDate?: Date;
  costPrice: number;         // in PKR paisa or whole rupees
  salePrice: number;
  profit: number;            // auto: salePrice - costPrice
  profitMargin: number;      // profit/salePrice * 100
  bookingStatus: BookingStatus;
  paymentStatus: PaymentStatus;
  amountReceived: number;
  balance: number;           // auto: salePrice - amountReceived
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Receipt {
  id: string;
  receiptRef: string;
  bookingId: string;
  customerId: string;
  amount: number;
  paymentMethod: string;
  notes?: string;
  date: Date;
  createdAt: Date;
}

export interface BookingDocument {
  id: string;
  bookingId: string;
  name: string;
  url: string;
  type: string;
  uploadedBy: string;
  createdAt: Date;
}
