export interface Agency {
  id: string;
  name: string;
  code: string;
  logoUrl?: string;
  contactEmail: string;
  contactPhone: string;
  address?: string;
  city?: string;
  country: string;
  currency: string;
  status: 'active' | 'suspended' | 'inactive';
  createdAt: Date;
  updatedAt: Date;
}

export interface Branch {
  id: string;
  agencyId: string;
  name: string;
  code: string;
  city: string;
  address?: string;
  phone?: string;
  isHeadOffice: boolean;
  status: 'active' | 'inactive';
  createdAt: Date;
  updatedAt: Date;
}
