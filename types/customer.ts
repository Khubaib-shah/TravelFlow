export interface Customer {
  id: string;
  agencyId: string;
  customerRef: string; // e.g. CUS-001
  type: 'individual' | 'corporate';
  firstName: string;
  lastName: string;
  companyName?: string;
  email?: string;
  phone: string;
  whatsapp?: string;
  passportNumber?: string;
  passportExpiry?: Date;
  nationality?: string;
  address?: string;
  city?: string;
  totalBookings: number;
  totalSpent: number;
  status: 'active' | 'inactive';
  createdAt: Date;
  updatedAt: Date;
}
