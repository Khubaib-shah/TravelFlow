import { Branch } from "@/types";

export const mockBranches: Branch[] = [
  { id: 'br-1', agencyId: 'ag-1', name: 'Karachi Main', city: 'Karachi', code: 'KHI-HQ', isHeadOffice: true, status: 'active', createdAt: new Date(), updatedAt: new Date() },
  { id: 'br-2', agencyId: 'ag-1', name: 'Islamabad Branch', city: 'Islamabad', code: 'ISB-01', isHeadOffice: false, status: 'active', createdAt: new Date(), updatedAt: new Date() },
  { id: 'br-3', agencyId: 'ag-1', name: 'Lahore Branch', city: 'Lahore', code: 'LHE-01', isHeadOffice: false, status: 'active', createdAt: new Date(), updatedAt: new Date() },
  { id: 'br-4', agencyId: 'ag-1', name: 'Dubai Office', city: 'Dubai', code: 'DXB-01', isHeadOffice: false, status: 'active', createdAt: new Date(), updatedAt: new Date() },
];
