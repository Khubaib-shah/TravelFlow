"use client";

import { use, useEffect, useState } from "react";
import { ArrowLeft, Building, Phone, Mail, MapPin, Globe, Edit, CreditCard } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MockAPI } from "@/lib/mock-api";
import { Supplier } from "@/types";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { CurrencyDisplay } from "@/components/shared/CurrencyDisplay";

export default function SupplierDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const [supplier, setSupplier] = useState<Supplier | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      const data = await MockAPI.getSupplier(id);
      setSupplier(data);
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

  if (!supplier) {
    return <div>Supplier not found.</div>;
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
              <h1 className="tf-h2 text-[var(--tf-text-primary)]">{supplier.name}</h1>
              <StatusBadge status={supplier.status as any} />
            </div>
            <p className="tf-body text-[var(--tf-text-secondary)] mt-1 flex items-center gap-2">
              <Building className="w-4 h-4" /> Category: <span className="capitalize font-medium text-[var(--tf-text-primary)]">{supplier.category}</span>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="bg-[var(--tf-surface)] text-[var(--tf-text-primary)]">
            <CreditCard className="w-4 h-4 mr-2" /> Settle Balance
          </Button>
          <Button className="bg-[var(--tf-primary)] text-white hover:bg-[var(--tf-primary-hover)]">
            <Edit className="w-4 h-4 mr-2" /> Edit Details
          </Button>
        </div>
      </div>

      {/* Overview Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Contact Info */}
        <div className="bg-[var(--tf-surface)] rounded-xl border border-[var(--tf-border)] p-6 shadow-sm col-span-1 lg:col-span-2">
          <h3 className="text-lg font-semibold text-[var(--tf-text-primary)] mb-4 flex items-center gap-2">
            <Building className="w-5 h-5 text-[var(--tf-primary)]" /> Business Information
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            <div>
              <p className="text-xs text-[var(--tf-text-muted)] uppercase tracking-wider mb-1">Contact Person</p>
              <p className="font-medium text-[var(--tf-text-primary)]">{supplier.contactPerson}</p>
            </div>
            <div>
              <p className="text-xs text-[var(--tf-text-muted)] uppercase tracking-wider mb-1 flex items-center gap-1"><Phone className="w-3 h-3" /> Phone</p>
              <p className="font-medium text-[var(--tf-text-primary)]">{supplier.phone}</p>
            </div>
            <div>
              <p className="text-xs text-[var(--tf-text-muted)] uppercase tracking-wider mb-1 flex items-center gap-1"><Mail className="w-3 h-3" /> Email</p>
              <p className="font-medium text-[var(--tf-text-primary)] truncate">{supplier.email}</p>
            </div>
            <div>
              <p className="text-xs text-[var(--tf-text-muted)] uppercase tracking-wider mb-1 flex items-center gap-1"><MapPin className="w-3 h-3" /> City</p>
              <p className="font-medium text-[var(--tf-text-primary)]">{supplier.city}</p>
            </div>
            <div>
              <p className="text-xs text-[var(--tf-text-muted)] uppercase tracking-wider mb-1 flex items-center gap-1"><Globe className="w-3 h-3" /> Country</p>
              <p className="font-medium text-[var(--tf-text-primary)]">{supplier.country}</p>
            </div>
            <div>
              <p className="text-xs text-[var(--tf-text-muted)] uppercase tracking-wider mb-1">Registered Since</p>
              <p className="font-medium text-[var(--tf-text-primary)]">{new Date(supplier.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
        </div>

        {/* Ledger Summary */}
        <div className="bg-[var(--tf-surface)] rounded-xl border border-[var(--tf-border)] p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-[var(--tf-text-primary)] mb-4">Financial Standing</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center py-2 border-b border-[var(--tf-border)]">
              <span className="text-[var(--tf-text-secondary)]">Current Ledger Balance</span>
              <CurrencyDisplay amount={supplier.balance} className="font-bold text-[var(--tf-danger)] text-xl" />
            </div>
            <p className="text-sm text-[var(--tf-text-muted)] pt-2">
              Positive balance indicates amount owed by your agency to the supplier. Negative indicates advance payment.
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="ledger" className="w-full">
        <TabsList className="bg-[var(--tf-surface)] border border-[var(--tf-border)] p-1 rounded-lg">
          <TabsTrigger value="ledger" className="rounded-md data-[state=active]:bg-[var(--tf-primary)] data-[state=active]:text-white">Supplier Ledger</TabsTrigger>
          <TabsTrigger value="bookings" className="rounded-md data-[state=active]:bg-[var(--tf-primary)] data-[state=active]:text-white">Related Bookings</TabsTrigger>
          <TabsTrigger value="documents" className="rounded-md data-[state=active]:bg-[var(--tf-primary)] data-[state=active]:text-white">Contracts</TabsTrigger>
        </TabsList>
        
        <TabsContent value="ledger" className="mt-4 bg-[var(--tf-surface)] rounded-xl border border-[var(--tf-border)] p-6">
          <h3 className="text-lg font-semibold text-[var(--tf-text-primary)] mb-4">Ledger Entries</h3>
          <div className="text-center py-12 border-2 border-dashed border-[var(--tf-border)] rounded-lg">
            <p className="text-[var(--tf-text-secondary)]">Detailed ledger and debit/credit history will render here.</p>
          </div>
        </TabsContent>
        
        <TabsContent value="bookings" className="mt-4 bg-[var(--tf-surface)] rounded-xl border border-[var(--tf-border)] p-6">
          <div className="text-center py-12">
            <p className="text-[var(--tf-text-muted)]">A list of all tickets/packages booked via this supplier will appear here.</p>
          </div>
        </TabsContent>

        <TabsContent value="documents" className="mt-4 bg-[var(--tf-surface)] rounded-xl border border-[var(--tf-border)] p-6">
          <div className="text-center py-12">
            <p className="text-[var(--tf-text-muted)]">Upload vendor contracts and B2B agreements here.</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
