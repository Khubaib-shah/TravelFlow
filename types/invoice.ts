export interface Invoice {
  id: string;
  agencyId: string;
  invoiceRef: string;    // INV-2024-001
  bookingId: string;
  customerId: string;
  issueDate: Date;
  dueDate: Date;
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  amountPaid: number;
  balance: number;
  status: 'draft' | 'sent' | 'paid' | 'partial' | 'overdue' | 'cancelled';
  notes?: string;
  terms?: string;
  createdAt: Date;
  updatedAt: Date;
}
