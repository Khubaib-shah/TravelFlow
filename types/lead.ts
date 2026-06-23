export type LeadStatus = 'new' | 'contacted' | 'follow_up' | 'interested' | 'negotiation' | 'converted' | 'lost';
export type LeadSource = 'walk_in' | 'whatsapp' | 'facebook' | 'instagram' | 'website' | 'referral' | 'google_ads';

export interface LeadActivity {
  id: string;
  leadId: string;
  type: 'note' | 'call' | 'whatsapp' | 'email' | 'status_change' | 'meeting';
  description: string;
  createdBy: string;
  createdAt: Date;
}

export interface Lead {
  id: string;
  leadRef: string;
  name: string;
  phone: string;
  whatsapp?: string;
  email?: string;
  cnic?: string;
  destination: string;
  travelDate?: Date;
  budget?: number;
  source: LeadSource;
  status: LeadStatus;
  assignedAgentId?: string;
  branchId: string;
  notes?: string;
  activities: LeadActivity[];
  createdAt: Date;
  updatedAt: Date;
}
