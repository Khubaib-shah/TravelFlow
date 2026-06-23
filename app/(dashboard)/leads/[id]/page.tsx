"use client";

import { use, useEffect, useState } from "react";
import { ArrowLeft, UserPlus, Phone, MapPin, CalendarDays, Wallet, Clock, Tag } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MockAPI } from "@/lib/mock-api";
import { Lead } from "@/types";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { CurrencyDisplay } from "@/components/shared/CurrencyDisplay";

export default function LeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const [lead, setLead] = useState<Lead | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      const data = await MockAPI.getLead(id);
      setLead(data);
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

  if (!lead) {
    return <div>Lead not found.</div>;
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
              <h1 className="tf-h2 text-[var(--tf-text-primary)]">{lead.name}</h1>
              <StatusBadge status={lead.status as any} />
            </div>
            <p className="tf-body text-[var(--tf-text-secondary)] mt-1 flex items-center gap-2">
              <UserPlus className="w-4 h-4" /> Ref: <span className="font-mono font-medium text-[var(--tf-text-primary)]">{lead.leadRef}</span>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="bg-[var(--tf-surface)] text-[var(--tf-text-primary)]">
            Add Follow-up
          </Button>
          <Button className="bg-[var(--tf-primary)] text-white hover:bg-[var(--tf-primary-hover)]">
            Convert to Booking
          </Button>
        </div>
      </div>

      {/* Overview Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Contact & Interest */}
        <div className="bg-[var(--tf-surface)] rounded-xl border border-[var(--tf-border)] p-6 shadow-sm col-span-1 lg:col-span-2">
          <h3 className="text-lg font-semibold text-[var(--tf-text-primary)] mb-4 flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-[var(--tf-primary)]" /> Lead Information
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            <div>
              <p className="text-xs text-[var(--tf-text-muted)] uppercase tracking-wider mb-1 flex items-center gap-1"><Phone className="w-3 h-3" /> Phone</p>
              <p className="font-medium text-[var(--tf-text-primary)]">{lead.phone}</p>
            </div>
            <div>
              <p className="text-xs text-[var(--tf-text-muted)] uppercase tracking-wider mb-1 flex items-center gap-1"><MapPin className="w-3 h-3" /> Destination</p>
              <p className="font-medium text-[var(--tf-text-primary)]">{lead.destination || 'Not Specified'}</p>
            </div>
            <div>
              <p className="text-xs text-[var(--tf-text-muted)] uppercase tracking-wider mb-1 flex items-center gap-1"><Wallet className="w-3 h-3" /> Budget</p>
              {lead.budget ? (
                <CurrencyDisplay amount={lead.budget} className="font-medium text-[var(--tf-text-primary)]" />
              ) : (
                <p className="font-medium text-[var(--tf-text-primary)]">Unspecified</p>
              )}
            </div>
            <div>
              <p className="text-xs text-[var(--tf-text-muted)] uppercase tracking-wider mb-1 flex items-center gap-1"><CalendarDays className="w-3 h-3" /> Travel Date</p>
              <p className="font-medium text-[var(--tf-text-primary)]">
                {lead.travelDate ? new Date(lead.travelDate).toLocaleDateString('en-GB') : 'Flexible'}
              </p>
            </div>
            <div>
              <p className="text-xs text-[var(--tf-text-muted)] uppercase tracking-wider mb-1 flex items-center gap-1"><Tag className="w-3 h-3" /> Source</p>
              <p className="font-medium text-[var(--tf-text-primary)] capitalize">
                {lead.source.replace('_', ' ')}
              </p>
            </div>
          </div>
        </div>

        {/* Lead Activity Summary */}
        <div className="bg-[var(--tf-surface)] rounded-xl border border-[var(--tf-border)] p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-[var(--tf-text-primary)] mb-4">Pipeline Status</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center py-2 border-b border-[var(--tf-border)]">
              <span className="text-[var(--tf-text-secondary)]">Created On</span>
              <span className="font-medium text-[var(--tf-text-primary)]">
                {new Date(lead.createdAt).toLocaleDateString('en-GB')}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-[var(--tf-border)]">
              <span className="text-[var(--tf-text-secondary)]">Last Contacted</span>
              <span className="font-medium text-[var(--tf-text-primary)]">
                {new Date(lead.updatedAt).toLocaleDateString('en-GB')}
              </span>
            </div>
            <div className="pt-2">
              <span className="text-[var(--tf-text-secondary)] block mb-2">Lead Notes</span>
              <p className="text-sm text-[var(--tf-text-primary)] bg-[var(--tf-surface-2)] p-3 rounded-lg border border-[var(--tf-border)]">
                {lead.notes || "No initial notes provided."}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="activity" className="w-full">
        <TabsList className="bg-[var(--tf-surface)] border border-[var(--tf-border)] p-1 rounded-lg">
          <TabsTrigger value="activity" className="rounded-md data-[state=active]:bg-[var(--tf-primary)] data-[state=active]:text-white">Activity Log</TabsTrigger>
          <TabsTrigger value="requirements" className="rounded-md data-[state=active]:bg-[var(--tf-primary)] data-[state=active]:text-white">Detailed Requirements</TabsTrigger>
        </TabsList>
        
        <TabsContent value="activity" className="mt-4 bg-[var(--tf-surface)] rounded-xl border border-[var(--tf-border)] p-6">
          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="w-3 h-3 rounded-full bg-[var(--tf-primary)]"></div>
                <div className="w-0.5 h-full bg-[var(--tf-border)] my-1"></div>
              </div>
              <div className="pb-4">
                <p className="font-medium text-[var(--tf-text-primary)]">Called Customer</p>
                <p className="text-sm text-[var(--tf-text-muted)] mt-1">Customer did not pick up. Will try again tomorrow.</p>
                <p className="text-xs text-[var(--tf-text-muted)] mt-2 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {new Date(lead.updatedAt).toLocaleString()}
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="w-3 h-3 rounded-full bg-[var(--tf-border)]"></div>
              </div>
              <div>
                <p className="font-medium text-[var(--tf-text-primary)]">Lead Captured</p>
                <p className="text-sm text-[var(--tf-text-muted)] mt-1">Lead generated via {lead.source.replace('_', ' ')} campaign.</p>
                <p className="text-xs text-[var(--tf-text-muted)] mt-2 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {new Date(lead.createdAt).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="requirements" className="mt-4 bg-[var(--tf-surface)] rounded-xl border border-[var(--tf-border)] p-6 text-center py-12">
           <p className="text-[var(--tf-text-muted)]">Custom form for detailed lead requirements (e.g., Number of Adults, Children, Flight Preferences) will go here.</p>
        </TabsContent>
      </Tabs>
    </div>
  );
}
