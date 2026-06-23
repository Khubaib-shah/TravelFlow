"use client";

import { use, useEffect, useState } from "react";
import { ArrowLeft, User, Phone, Mail, MapPin, Briefcase, CalendarDays, Edit } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MockAPI } from "@/lib/mock-api";
import { Customer } from "@/types";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { CurrencyDisplay } from "@/components/shared/CurrencyDisplay";

export default function CustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      const data = await MockAPI.getCustomer(id);
      setCustomer(data);
      setIsLoading(false);
    }
    load();
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--tf-primary)]"></div>
      </div>
    );
  }

  if (!customer) {
    return <div>Customer not found.</div>;
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full bg-[var(--tf-surface)] border border-[var(--tf-border)]">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="tf-h2 text-[var(--tf-text-primary)]">{customer.firstName} {customer.lastName}</h1>
              <StatusBadge status={customer.status as any} />
            </div>
            <p className="tf-body text-[var(--tf-text-secondary)] mt-1 flex items-center gap-2">
              <User className="w-4 h-4" /> Ref: <span className="font-mono font-medium text-[var(--tf-text-primary)]">{customer.customerRef}</span>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button className="bg-[var(--tf-primary)] text-white hover:bg-[var(--tf-primary-hover)]">
            <Edit className="w-4 h-4 mr-2" /> Edit Profile
          </Button>
        </div>
      </div>

      {/* Overview Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Contact Info */}
        <div className="bg-[var(--tf-surface)] rounded-xl border border-[var(--tf-border)] p-6 shadow-sm col-span-1 lg:col-span-2">
          <h3 className="text-lg font-semibold text-[var(--tf-text-primary)] mb-4 flex items-center gap-2">
            <User className="w-5 h-5 text-[var(--tf-primary)]" /> Profile Information
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            <div>
              <p className="text-xs text-[var(--tf-text-muted)] uppercase tracking-wider mb-1 flex items-center gap-1"><Phone className="w-3 h-3" /> Phone</p>
              <p className="font-medium text-[var(--tf-text-primary)]">{customer.phone}</p>
            </div>
            {customer.whatsapp && (
              <div>
                <p className="text-xs text-[var(--tf-text-muted)] uppercase tracking-wider mb-1">WhatsApp</p>
                <p className="font-medium text-[var(--tf-text-primary)]">{customer.whatsapp}</p>
              </div>
            )}
            <div>
              <p className="text-xs text-[var(--tf-text-muted)] uppercase tracking-wider mb-1 flex items-center gap-1"><Mail className="w-3 h-3" /> Email</p>
              <p className="font-medium text-[var(--tf-text-primary)] truncate">{customer.email || 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs text-[var(--tf-text-muted)] uppercase tracking-wider mb-1 flex items-center gap-1"><MapPin className="w-3 h-3" /> City</p>
              <p className="font-medium text-[var(--tf-text-primary)]">{customer.city || 'Unknown'}</p>
            </div>
            <div>
              <p className="text-xs text-[var(--tf-text-muted)] uppercase tracking-wider mb-1 flex items-center gap-1"><Briefcase className="w-3 h-3" /> Type</p>
              <p className="font-medium text-[var(--tf-text-primary)] capitalize">{customer.type}</p>
            </div>
            {customer.type === 'corporate' && customer.companyName && (
              <div className="col-span-2 md:col-span-1">
                <p className="text-xs text-[var(--tf-text-muted)] uppercase tracking-wider mb-1">Company</p>
                <p className="font-medium text-[var(--tf-text-primary)]">{customer.companyName}</p>
              </div>
            )}
          </div>
        </div>

        {/* Lifetime Stats */}
        <div className="bg-[var(--tf-surface)] rounded-xl border border-[var(--tf-border)] p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-[var(--tf-text-primary)] mb-4">Value Metrics</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center py-2 border-b border-[var(--tf-border)]">
              <span className="text-[var(--tf-text-secondary)]">Total Bookings</span>
              <span className="font-semibold text-[var(--tf-primary)] text-xl">{customer.totalBookings}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-[var(--tf-border)]">
              <span className="text-[var(--tf-text-secondary)]">Lifetime Spend</span>
              <CurrencyDisplay amount={customer.totalSpent} className="font-bold text-[var(--tf-text-primary)] text-xl" />
            </div>
            <div className="flex justify-between items-center pt-2">
              <span className="text-[var(--tf-text-secondary)]">Customer Since</span>
              <span className="font-medium text-[var(--tf-text-primary)] flex items-center gap-1">
                <CalendarDays className="w-4 h-4 text-[var(--tf-text-muted)]" /> 
                {new Date(customer.createdAt).getFullYear()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="bookings" className="w-full">
        <TabsList className="bg-[var(--tf-surface)] border border-[var(--tf-border)] p-1 rounded-lg">
          <TabsTrigger value="bookings" className="rounded-md data-[state=active]:bg-[var(--tf-primary)] data-[state=active]:text-white">Booking History</TabsTrigger>
          <TabsTrigger value="documents" className="rounded-md data-[state=active]:bg-[var(--tf-primary)] data-[state=active]:text-white">Travel Documents</TabsTrigger>
          <TabsTrigger value="notes" className="rounded-md data-[state=active]:bg-[var(--tf-primary)] data-[state=active]:text-white">Internal Notes</TabsTrigger>
        </TabsList>
        
        <TabsContent value="bookings" className="mt-4 bg-[var(--tf-surface)] rounded-xl border border-[var(--tf-border)] p-6">
          <h3 className="text-lg font-semibold text-[var(--tf-text-primary)] mb-4">Recent Bookings</h3>
          <div className="text-center py-12 border-2 border-dashed border-[var(--tf-border)] rounded-lg">
            <p className="text-[var(--tf-text-secondary)]">Booking history table will render here.</p>
            <Button variant="outline" className="mt-4" onClick={() => router.push('/bookings')}>View All Bookings</Button>
          </div>
        </TabsContent>
        
        <TabsContent value="documents" className="mt-4 bg-[var(--tf-surface)] rounded-xl border border-[var(--tf-border)] p-6">
           <h3 className="text-lg font-semibold text-[var(--tf-text-primary)] mb-4">Uploaded Documents</h3>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center justify-between p-4 rounded-lg border border-[var(--tf-border)] hover:bg-[var(--tf-surface-2)] cursor-pointer transition-colors">
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="w-10 h-10 rounded bg-[var(--tf-primary)]/10 flex items-center justify-center text-[var(--tf-primary)] shrink-0">
                  <User className="w-5 h-5" />
                </div>
                <div className="overflow-hidden">
                  <p className="font-medium text-sm text-[var(--tf-text-primary)] truncate">Passport_Front.jpg</p>
                  <p className="text-xs text-[var(--tf-text-muted)]">Expiry: 2029-05-12</p>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="notes" className="mt-4 bg-[var(--tf-surface)] rounded-xl border border-[var(--tf-border)] p-6">
          <div className="space-y-4">
            <div className="bg-[var(--tf-surface-2)] p-4 rounded-lg border border-[var(--tf-border)]">
              <p className="text-sm text-[var(--tf-text-primary)]">Prefers window seats on long-haul flights. Often travels to DXB for business.</p>
              <p className="text-xs text-[var(--tf-text-muted)] mt-2">Added by Agent Umer on 10 Feb 2024</p>
            </div>
            <Button variant="outline" size="sm" className="w-full">
              + Add Note
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
