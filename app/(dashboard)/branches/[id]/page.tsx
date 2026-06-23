"use client";

import { use } from "react";
import { ArrowLeft, MapPin, Phone, Users, CheckCircle, Mail, Globe, Building } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CurrencyDisplay } from "@/components/shared/CurrencyDisplay";

export default function BranchDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);

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
              <h1 className="tf-h2 text-[var(--tf-text-primary)]">Branch {id}</h1>
              <span className="inline-flex items-center rounded-md bg-[var(--tf-success-soft)] px-2 py-1 text-xs font-medium text-[var(--tf-success)]">
                Active
              </span>
            </div>
            <p className="tf-body text-[var(--tf-text-secondary)] mt-1 flex items-center gap-2">
              <Building className="w-4 h-4" /> Type: <span className="font-medium text-[var(--tf-text-primary)]">Main Headquarters</span>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="bg-[var(--tf-surface)] text-[var(--tf-text-primary)]">
            Manage Agents
          </Button>
          <Button className="bg-[var(--tf-primary)] text-white hover:bg-[var(--tf-primary-hover)]">
            Edit Branch
          </Button>
        </div>
      </div>

      {/* Overview Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Contact Info */}
        <div className="bg-[var(--tf-surface)] rounded-xl border border-[var(--tf-border)] p-6 shadow-sm col-span-1 lg:col-span-2">
          <h3 className="text-lg font-semibold text-[var(--tf-text-primary)] mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-[var(--tf-primary)]" /> Branch Details
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            <div>
              <p className="text-xs text-[var(--tf-text-muted)] uppercase tracking-wider mb-1 flex items-center gap-1"><Phone className="w-3 h-3" /> Phone</p>
              <p className="font-medium text-[var(--tf-text-primary)]">+92 21 111 222 333</p>
            </div>
            <div>
              <p className="text-xs text-[var(--tf-text-muted)] uppercase tracking-wider mb-1 flex items-center gap-1"><Mail className="w-3 h-3" /> Email</p>
              <p className="font-medium text-[var(--tf-text-primary)] truncate">karachi.main@travelflow.pk</p>
            </div>
            <div>
              <p className="text-xs text-[var(--tf-text-muted)] uppercase tracking-wider mb-1 flex items-center gap-1"><Globe className="w-3 h-3" /> Region</p>
              <p className="font-medium text-[var(--tf-text-primary)]">Sindh, Pakistan</p>
            </div>
            <div className="col-span-2 md:col-span-3">
              <p className="text-xs text-[var(--tf-text-muted)] uppercase tracking-wider mb-1">Address</p>
              <p className="font-medium text-[var(--tf-text-primary)]">Suite 400, Business Avenue, Shahrah-e-Faisal, Karachi</p>
            </div>
          </div>
        </div>

        {/* Performance Summary */}
        <div className="bg-[var(--tf-surface)] rounded-xl border border-[var(--tf-border)] p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-[var(--tf-text-primary)] mb-4">Current Month Performance</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center py-2 border-b border-[var(--tf-border)]">
              <span className="text-[var(--tf-text-secondary)]">Revenue Generated</span>
              <CurrencyDisplay amount={4500000} className="font-bold text-[var(--tf-success)]" />
            </div>
            <div className="flex justify-between items-center py-2 border-b border-[var(--tf-border)]">
              <span className="text-[var(--tf-text-secondary)]">Total Bookings</span>
              <span className="font-bold text-[var(--tf-text-primary)]">145</span>
            </div>
            <div className="flex justify-between items-center pt-2">
              <span className="text-[var(--tf-text-secondary)] flex items-center gap-2"><Users className="w-4 h-4 text-[var(--tf-text-muted)]" /> Active Agents</span>
              <span className="font-medium text-[var(--tf-text-primary)]">
                12
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="agents" className="w-full">
        <TabsList className="bg-[var(--tf-surface)] border border-[var(--tf-border)] p-1 rounded-lg">
          <TabsTrigger value="agents" className="rounded-md data-[state=active]:bg-[var(--tf-primary)] data-[state=active]:text-white">Agents</TabsTrigger>
          <TabsTrigger value="performance" className="rounded-md data-[state=active]:bg-[var(--tf-primary)] data-[state=active]:text-white">Performance Metrics</TabsTrigger>
        </TabsList>
        
        <TabsContent value="agents" className="mt-4 bg-[var(--tf-surface)] rounded-xl border border-[var(--tf-border)] p-6">
          <div className="flex justify-between items-center mb-6">
             <h3 className="text-lg font-semibold text-[var(--tf-text-primary)]">Assigned Personnel</h3>
             <Button variant="outline" size="sm">+ Add Agent</Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center justify-between p-4 rounded-lg border border-[var(--tf-border)] hover:bg-[var(--tf-surface-2)] transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[var(--tf-primary)]/10 flex items-center justify-center text-[var(--tf-primary)]">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-medium text-sm text-[var(--tf-text-primary)]">Agent Name {i}</p>
                    <p className="text-xs text-[var(--tf-text-muted)]">agent{i}@travelflow.pk</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" className="text-[var(--tf-text-muted)]">View</Button>
              </div>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="performance" className="mt-4 bg-[var(--tf-surface)] rounded-xl border border-[var(--tf-border)] p-6">
          <div className="text-center py-12">
            <p className="text-[var(--tf-text-muted)]">Advanced charts showing monthly growth, top selling agents, and route performance will go here.</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
