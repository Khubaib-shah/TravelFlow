"use client";

import { use, useEffect, useState } from "react";
import { ArrowLeft, MapPin, Phone, Users, CheckCircle, Mail, Globe, Building } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CurrencyDisplay } from "@/components/shared/CurrencyDisplay";
import { BranchPerformance } from "@/components/dashboard/BranchPerformance";
import { toast } from "sonner";
import { Branch } from "@/types";

// Temporarily hardcode data here since we don't have a getBranch in mock-api yet
const mockBranchesData = [
  { id: "br-1", name: "Karachi Main", code: "KHI-HQ", city: "Karachi", isHeadOffice: true, status: "active", revenue: 4820000, bookings: 54, agents: 12 },
  { id: "br-2", name: "Islamabad Branch", code: "ISB-01", city: "Islamabad", isHeadOffice: false, status: "active", revenue: 2340000, bookings: 28, agents: 6 },
  { id: "br-3", name: "Lahore Branch", code: "LHE-01", city: "Lahore", isHeadOffice: false, status: "active", revenue: 1980000, bookings: 22, agents: 5 },
  { id: "br-4", name: "Dubai Office", code: "DXB-01", city: "Dubai", isHeadOffice: false, status: "active", revenue: 3100000, bookings: 31, agents: 8 },
];

export default function BranchDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const [branch, setBranch] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Mock network request
    setTimeout(() => {
      const b = mockBranchesData.find((br) => br.id === id);
      setBranch(b);
      setIsLoading(false);
    }, 400);
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--tf-primary)]"></div>
      </div>
    );
  }

  if (!branch) {
    return <div>Branch not found.</div>;
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
              <h1 className="tf-h2 text-[var(--tf-text-primary)]">{branch.name}</h1>
              <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${branch.status === 'active' ? 'bg-[var(--tf-success-soft)] text-[var(--tf-success)]' : 'bg-[var(--tf-danger-soft)] text-[var(--tf-danger)]'}`}>
                {branch.status}
              </span>
            </div>
            <p className="tf-body text-[var(--tf-text-secondary)] mt-1 flex items-center gap-2">
              <Building className="w-4 h-4" /> Type: <span className="font-medium text-[var(--tf-text-primary)]">{branch.isHeadOffice ? 'Main Headquarters' : 'Branch Office'}</span>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="bg-[var(--tf-surface)] text-[var(--tf-text-primary)]" onClick={() => toast.info("Agent management opening...")}>
            Manage Agents
          </Button>
          <Button className="bg-[var(--tf-primary)] text-white hover:bg-[var(--tf-primary-hover)]" onClick={() => toast.info("Edit branch form opening...")}>
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
              <p className="font-medium text-[var(--tf-text-primary)] truncate">{branch.city.toLowerCase()}@travelflow.pk</p>
            </div>
            <div>
              <p className="text-xs text-[var(--tf-text-muted)] uppercase tracking-wider mb-1 flex items-center gap-1"><Globe className="w-3 h-3" /> Region</p>
              <p className="font-medium text-[var(--tf-text-primary)]">{branch.city}, Pakistan</p>
            </div>
            <div className="col-span-2 md:col-span-3">
              <p className="text-xs text-[var(--tf-text-muted)] uppercase tracking-wider mb-1">Address</p>
              <p className="font-medium text-[var(--tf-text-primary)]">Suite 400, Business Avenue, Main Boulevard, {branch.city}</p>
            </div>
          </div>
        </div>

        {/* Performance Summary */}
        <div className="bg-[var(--tf-surface)] rounded-xl border border-[var(--tf-border)] p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-[var(--tf-text-primary)] mb-4">Current Month Performance</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center py-2 border-b border-[var(--tf-border)]">
              <span className="text-[var(--tf-text-secondary)]">Revenue Generated</span>
              <CurrencyDisplay amount={branch.revenue} className="font-bold text-[var(--tf-success)]" />
            </div>
            <div className="flex justify-between items-center py-2 border-b border-[var(--tf-border)]">
              <span className="text-[var(--tf-text-secondary)]">Total Bookings</span>
              <span className="font-bold text-[var(--tf-text-primary)]">{branch.bookings}</span>
            </div>
            <div className="flex justify-between items-center pt-2">
              <span className="text-[var(--tf-text-secondary)] flex items-center gap-2"><Users className="w-4 h-4 text-[var(--tf-text-muted)]" /> Active Agents</span>
              <span className="font-medium text-[var(--tf-text-primary)]">
                {branch.agents}
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
             <Button variant="outline" size="sm" onClick={() => toast.success("Add agent dialog opened")}>+ Add Agent</Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Array.from({ length: branch.agents }).map((_, i) => (
              <div key={i} className="flex items-center justify-between p-4 rounded-lg border border-[var(--tf-border)] hover:bg-[var(--tf-surface-2)] transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[var(--tf-primary)]/10 flex items-center justify-center text-[var(--tf-primary)]">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-medium text-sm text-[var(--tf-text-primary)]">Agent {i + 1}</p>
                    <p className="text-xs text-[var(--tf-text-muted)]">agent{i + 1}_{branch.code.toLowerCase()}@travelflow.pk</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" className="text-[var(--tf-text-muted)]" onClick={() => toast.info(`Viewing agent ${i + 1}`)}>View</Button>
              </div>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="performance" className="mt-4">
          <div className="max-w-4xl">
             <BranchPerformance isLoading={isLoading} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
