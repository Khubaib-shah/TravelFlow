export interface User {
  id: string;
  agencyId: string;
  branchId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: string;
  status: 'active' | 'inactive' | 'invited';
  avatarUrl?: string;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
