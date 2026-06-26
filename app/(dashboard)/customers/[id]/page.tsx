"use client";

import { use, useEffect, useState } from "react";
import { ArrowLeft, User, Phone, Mail, MapPin, Briefcase, CalendarDays, Edit, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DetailHeader } from "@/components/shared/DetailHeader";
import { MockAPI } from "@/lib/mock-api";
import { Customer, Booking } from "@/types";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { CurrencyDisplay } from "@/components/shared/CurrencyDisplay";
import { DataTable } from "@/components/tables/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import { formatCurrencyPKR } from "@/lib/utils";
import { TableEntityLink } from "@/components/shared/TableEntityLink";
import { DataTableRowActions } from "@/components/tables/DataTableRowActions";

export default function CustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      const data = await MockAPI.getCustomer(id);
      setCustomer(data);
      if (data) {
        // Fetch all bookings and filter by this customer
        const allBookings = await MockAPI.getBookings();
        setBookings(allBookings.filter(b => b.customerId === id));
      }
      setIsLoading(false);
    }
    load();
  }, [id]);

  const handleEditProfile = () => {
    toast.success("Edit Profile modal opened");
  };

  const handleAddNote = () => {
    toast.success("Note added successfully");
  };

  const columns: ColumnDef<Booking>[] = [
    {
      accessorKey: "bookingRef",
      header: "Reference",
      cell: ({ row }) => (
        <TableEntityLink onClick={() => router.push(`/bookings/${row.original.id}`)}>
          {row.original.bookingRef}
        </TableEntityLink>
      ),
    },
    {
      accessorKey: "pnr",
      header: "PNR",
      cell: ({ row }) => <div className="font-mono text-xs">{row.original.pnr}</div>,
    },
    {
      accessorKey: "airline",
      header: "Route",
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-medium text-[var(--tf-text-primary)]">{row.original.airline}</span>
          <span className="text-xs text-[var(--tf-text-muted)]">{row.original.departureCity} → {row.original.arrivalCity}</span>
        </div>
      ),
    },
    {
      accessorKey: "departureDate",
      header: "Date",
      cell: ({ row }) => (
        <span className="text-xs">{new Date(row.original.departureDate).toLocaleDateString('en-GB')}</span>
      ),
    },
    {
      accessorKey: "salePrice",
      header: "Amount",
      cell: ({ row }) => (
        <div className="font-semibold text-sm">
          {formatCurrencyPKR(row.original.salePrice)}
        </div>
      ),
    },
    {
      accessorKey: "bookingStatus",
      header: "Status",
      cell: ({ row }) => <StatusBadge status={row.original.bookingStatus as any} />,
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <DataTableRowActions
          row={row}
          onView={() => router.push(`/bookings/${row.original.id}`)}
        />
      ),
    },
  ];

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
      <DetailHeader 
        title={
          <>
            {customer.firstName} {customer.lastName}
            <StatusBadge status={customer.status as any} />
          </>
        }
        subtitle={
          <>
            <User className="w-4 h-4" /> Ref: <span className="font-mono font-medium text-[var(--tf-text-primary)]">{customer.customerRef}</span>
          </>
        }
        actions={
          <Button onClick={handleEditProfile} className="bg-[var(--tf-primary)] text-white hover:bg-[var(--tf-primary-hover)]">
            <Edit className="w-4 h-4 mr-2" /> Edit Profile
          </Button>
        }
      />

      {/* Overview Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Contact Info */}
        <Card className="col-span-1 lg:col-span-2 shadow-sm border-[var(--tf-border)] bg-[var(--tf-surface)]">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2 text-[var(--tf-text-primary)]">
              <User className="w-5 h-5 text-[var(--tf-primary)]" /> Profile Information
            </CardTitle>
          </CardHeader>
          <CardContent>
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
          </CardContent>
        </Card>

        {/* Lifetime Stats */}
        <Card className="shadow-sm border-[var(--tf-border)] bg-[var(--tf-surface)]">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg text-[var(--tf-text-primary)]">Value Metrics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
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
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="bookings" className="w-full">
        <TabsList className="bg-[var(--tf-surface)] border border-[var(--tf-border)] p-1 rounded-lg">
          <TabsTrigger value="bookings" className="rounded-md data-[state=active]:bg-[var(--tf-primary)] data-[state=active]:text-white">Booking History</TabsTrigger>
          <TabsTrigger value="documents" className="rounded-md data-[state=active]:bg-[var(--tf-primary)] data-[state=active]:text-white">Travel Documents</TabsTrigger>
          <TabsTrigger value="notes" className="rounded-md data-[state=active]:bg-[var(--tf-primary)] data-[state=active]:text-white">Internal Notes</TabsTrigger>
        </TabsList>
        
        <TabsContent value="bookings" className="mt-4">
          <Card className="border-[var(--tf-border)] bg-[var(--tf-surface)] shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Recent Bookings</CardTitle>
              <Button variant="outline" size="sm" onClick={() => router.push('/bookings')}>View All Bookings <ArrowRight className="ml-2 w-4 h-4" /></Button>
            </CardHeader>
            <CardContent>
              {bookings.length === 0 ? (
                <div className="text-center py-12 border border-[var(--tf-border)] rounded-lg">
                  <p className="text-[var(--tf-text-secondary)]">No bookings found for this customer.</p>
                  <Button variant="outline" className="mt-4" onClick={() => router.push('/bookings/new')}>Create Booking</Button>
                </div>
              ) : (
                <DataTable
                  columns={columns}
                  data={bookings}
                  isLoading={isLoading}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="documents" className="mt-4">
          <Card className="border-[var(--tf-border)] bg-[var(--tf-surface)] shadow-sm">
            <CardHeader>
               <CardTitle className="text-lg">Uploaded Documents</CardTitle>
            </CardHeader>
            <CardContent>
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
                <div className="flex items-center justify-center p-4 rounded-lg border-2 border-dashed border-[var(--tf-border)] hover:border-[var(--tf-primary)] cursor-pointer transition-colors text-[var(--tf-text-muted)] hover:text-[var(--tf-primary)] h-full">
                  + Upload Document
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="notes" className="mt-4">
          <Card className="border-[var(--tf-border)] bg-[var(--tf-surface)] shadow-sm">
            <CardContent className="pt-6 space-y-4">
              <div className="bg-[var(--tf-surface-2)] p-4 rounded-lg border border-[var(--tf-border)]">
                <p className="text-sm text-[var(--tf-text-primary)]">Prefers window seats on long-haul flights. Often travels to DXB for business.</p>
                <p className="text-xs text-[var(--tf-text-muted)] mt-2">Added by Agent Umer on 10 Feb 2024</p>
              </div>
              <Button variant="outline" size="sm" className="w-full" onClick={handleAddNote}>
                + Add Note
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
