"use client";

import { use, useEffect, useState } from "react";
import { ArrowLeft, Plane, User, CreditCard, Calendar, Clock, FileText, Download } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DetailHeader } from "@/components/shared/DetailHeader";
import { MockAPI } from "@/lib/mock-api";
import { Booking } from "@/types";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { CurrencyDisplay } from "@/components/shared/CurrencyDisplay";

export default function BookingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const [booking, setBooking] = useState<Booking | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      const data = await MockAPI.getBooking(id);
      setBooking(data);
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

  if (!booking) {
    return <div>Booking not found.</div>;
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <DetailHeader
        title={
          <>
            Booking {booking.bookingRef}
            <StatusBadge status={booking.bookingStatus as any} />
          </>
        }
        subtitle={
          <>
            <Plane className="w-4 h-4" /> PNR: <span className="font-mono font-medium text-[var(--tf-text-primary)]">{booking.pnr}</span>
          </>
        }
        actions={
          <>
            <Button variant="outline" className="bg-[var(--tf-surface)] text-[var(--tf-text-primary)]">
              <FileText className="w-4 h-4 mr-2" /> View Invoice
            </Button>
            <Button className="bg-[var(--tf-primary)] text-white hover:bg-[var(--tf-primary-hover)]">
              <Download className="w-4 h-4 mr-2" /> E-Ticket
            </Button>
          </>
        }
      />

      {/* Overview Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Customer & Trip */}
        <Card className="col-span-1 lg:col-span-2 shadow-sm border-[var(--tf-border)] bg-[var(--tf-surface)]">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2 text-[var(--tf-text-primary)]">
              <User className="w-5 h-5 text-[var(--tf-primary)]" /> Passenger Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <p className="text-xs text-[var(--tf-text-muted)] uppercase tracking-wider mb-1">Name</p>
                <p className="font-medium text-[var(--tf-text-primary)]">{booking.customer?.firstName} {booking.customer?.lastName}</p>
              </div>
              <div>
                <p className="text-xs text-[var(--tf-text-muted)] uppercase tracking-wider mb-1">Phone</p>
                <p className="font-medium text-[var(--tf-text-primary)]">{booking.customer?.phone}</p>
              </div>
              <div>
                <p className="text-xs text-[var(--tf-text-muted)] uppercase tracking-wider mb-1">Email</p>
                <p className="font-medium text-[var(--tf-text-primary)]">{booking.customer?.email}</p>
              </div>
              <div>
                <p className="text-xs text-[var(--tf-text-muted)] uppercase tracking-wider mb-1">Airline</p>
                <p className="font-medium text-[var(--tf-text-primary)] flex items-center gap-2">
                   {booking.airline}
                </p>
              </div>
              <div>
                <p className="text-xs text-[var(--tf-text-muted)] uppercase tracking-wider mb-1">Route</p>
                <p className="font-medium text-[var(--tf-text-primary)] flex items-center gap-2">
                  {booking.departureCity} <ArrowLeft className="w-3 h-3 rotate-180 text-[var(--tf-text-muted)]" /> {booking.arrivalCity}
                </p>
              </div>
              <div>
                <p className="text-xs text-[var(--tf-text-muted)] uppercase tracking-wider mb-1">Departure</p>
                <p className="font-medium text-[var(--tf-text-primary)]">
                  {new Date(booking.departureDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                </p>
              </div>
              {booking.returnDate && (
                <div>
                  <p className="text-xs text-[var(--tf-text-muted)] uppercase tracking-wider mb-1">Return</p>
                  <p className="font-medium text-[var(--tf-text-primary)]">
                    {new Date(booking.returnDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </p>
                </div>
              )}
               <div>
                <p className="text-xs text-[var(--tf-text-muted)] uppercase tracking-wider mb-1">Ticket No</p>
                <p className="font-mono font-medium text-[var(--tf-text-primary)]">{booking.ticketNumber || 'Pending'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Financials */}
        <Card className="shadow-sm border-[var(--tf-border)] bg-[var(--tf-surface)]">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2 text-[var(--tf-text-primary)]">
              <CreditCard className="w-5 h-5 text-[var(--tf-success)]" /> Financials
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center py-2 border-b border-[var(--tf-border)]">
              <span className="text-[var(--tf-text-secondary)]">Cost Price</span>
              <CurrencyDisplay amount={booking.costPrice} className="text-[var(--tf-text-primary)]" />
            </div>
            <div className="flex justify-between items-center py-2 border-b border-[var(--tf-border)]">
              <span className="text-[var(--tf-text-secondary)]">Sale Price</span>
              <CurrencyDisplay amount={booking.salePrice} className="font-semibold text-[var(--tf-text-primary)]" />
            </div>
            <div className="flex justify-between items-center py-2 border-b border-[var(--tf-border)]">
              <span className="text-[var(--tf-text-secondary)]">Profit Margin</span>
              <span className="font-medium text-[var(--tf-success)]">
                <CurrencyDisplay amount={booking.profit} /> ({booking.profitMargin}%)
              </span>
            </div>
            <div className="pt-2">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[var(--tf-text-secondary)]">Amount Received</span>
                <CurrencyDisplay amount={booking.amountReceived} className="text-[var(--tf-text-primary)]" />
              </div>
              <div className="w-full bg-[var(--tf-border)] rounded-full h-2">
                <div className="bg-[var(--tf-success)] h-2 rounded-full" style={{ width: `${(booking.amountReceived / booking.salePrice) * 100}%` }}></div>
              </div>
              <div className="flex justify-between items-center mt-2">
                <span className="text-[var(--tf-danger)] text-sm font-medium">Balance Due</span>
                <CurrencyDisplay amount={booking.balance} className="text-[var(--tf-danger)] font-bold" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="details" className="w-full">
        <TabsList className="bg-[var(--tf-surface)] border border-[var(--tf-border)] p-1 rounded-lg">
          <TabsTrigger value="details" className="rounded-md data-[state=active]:bg-[var(--tf-primary)] data-[state=active]:text-white">Full Details</TabsTrigger>
          <TabsTrigger value="timeline" className="rounded-md data-[state=active]:bg-[var(--tf-primary)] data-[state=active]:text-white">Activity Log</TabsTrigger>
          <TabsTrigger value="documents" className="rounded-md data-[state=active]:bg-[var(--tf-primary)] data-[state=active]:text-white">Documents</TabsTrigger>
        </TabsList>
        
        <TabsContent value="details" className="mt-4">
          <Card className="border-[var(--tf-border)] bg-[var(--tf-surface)] shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Additional Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <p className="text-sm font-medium text-[var(--tf-text-secondary)] mb-2">Supplier Details</p>
                  <div className="bg-[var(--tf-surface-2)] p-4 rounded-lg">
                    <p className="font-medium text-[var(--tf-text-primary)]">{booking.supplier?.name || 'Unknown Supplier'}</p>
                    <p className="text-sm text-[var(--tf-text-muted)] mt-1">{booking.supplier?.contactPerson}</p>
                    <p className="text-sm text-[var(--tf-text-muted)] mt-1">{booking.supplier?.email}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-[var(--tf-text-secondary)] mb-2">System Metadata</p>
                  <div className="bg-[var(--tf-surface-2)] p-4 rounded-lg space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-[var(--tf-text-muted)]">Created By (Agent ID)</span>
                      <span className="text-[var(--tf-text-primary)] font-mono">{booking.agentId}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-[var(--tf-text-muted)]">Branch ID</span>
                      <span className="text-[var(--tf-text-primary)] font-mono">{booking.branchId}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-[var(--tf-text-muted)]">Created At</span>
                      <span className="text-[var(--tf-text-primary)]">{new Date(booking.createdAt).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="timeline" className="mt-4">
          <Card className="border-[var(--tf-border)] bg-[var(--tf-surface)] shadow-sm">
            <CardContent className="pt-6">
              <div className="space-y-6">
                {[
                  { title: "Booking Confirmed", desc: "Ticket issued and sent to customer", date: booking.updatedAt },
                  { title: "Payment Received", desc: `Received partial payment of Rs ${booking.amountReceived}`, date: new Date(new Date(booking.createdAt).getTime() + 86400000) },
                  { title: "Booking Created", desc: "Initial reservation made in system", date: booking.createdAt }
                ].map((event, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-3 h-3 rounded-full bg-[var(--tf-primary)]"></div>
                      {i !== 2 && <div className="w-0.5 h-full bg-[var(--tf-border)] my-1"></div>}
                    </div>
                    <div>
                      <p className="font-medium text-[var(--tf-text-primary)]">{event.title}</p>
                      <p className="text-sm text-[var(--tf-text-muted)] mt-1">{event.desc}</p>
                      <p className="text-xs text-[var(--tf-text-muted)] mt-2 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {new Date(event.date).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="documents" className="mt-4">
          <Card className="border-[var(--tf-border)] bg-[var(--tf-surface)] shadow-sm">
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {['E-Ticket.pdf', 'Customer_Passport.jpg', 'Visa_Copy.pdf'].map((doc, i) => (
                  <div key={i} className="flex items-center gap-3 p-4 rounded-lg border border-[var(--tf-border)] hover:bg-[var(--tf-surface-2)] cursor-pointer transition-colors">
                    <div className="w-10 h-10 rounded bg-[var(--tf-primary)]/10 flex items-center justify-center text-[var(--tf-primary)]">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <p className="font-medium text-sm text-[var(--tf-text-primary)] truncate">{doc}</p>
                      <p className="text-xs text-[var(--tf-text-muted)]">{Math.floor(Math.random() * 2000 + 500)} KB</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
