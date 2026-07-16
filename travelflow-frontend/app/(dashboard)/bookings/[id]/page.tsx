"use client";

import { use, useEffect, useState } from "react";
import {
  ArrowLeft,
  Plane,
  User,
  CreditCard,
  Calendar,
  Clock,
  FileText,
  Download,
} from "lucide-react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DetailHeader } from "@/components/shared/DetailHeader";
import { API } from "@/lib/data-source";
import { Booking, BookingDocument } from "@/types";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { CurrencyDisplay } from "@/components/shared/CurrencyDisplay";
import { RecordPaymentDrawer } from "@/components/bookings/RecordPaymentDrawer";
import { BookingDocumentsPanel } from "@/components/bookings/BookingDocumentsPanel";
import { showError } from "@/lib/toast-utils";

export default function BookingDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const [booking, setBooking] = useState<Booking | null>(null);
  const [documents, setDocuments] = useState<BookingDocument[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPaymentDrawerOpen, setIsPaymentDrawerOpen] = useState(false);
  const [isGeneratingInvoice, setIsGeneratingInvoice] = useState(false);

  const handleViewInvoice = async () => {
    if (!booking) return;
    setIsGeneratingInvoice(true);
    try {
      const invoice = await API.generateInvoiceFromBooking(booking.id);
      window.open(`/print/invoice/${invoice.id}`, "_blank");
    } catch (error: any) {
      showError(error.message || "Failed to view invoice");
    } finally {
      setIsGeneratingInvoice(false);
    }
  };

  const handleViewReceipt = async () => {
    if (!booking) return;
    try {
      const receipts = await API.getReceipts();
      const receipt = receipts.find((r: any) => 
        (typeof r.bookingId === 'object' ? r.bookingId.id : r.bookingId) === booking.id
      );
      if (receipt) {
        window.open(`/print/receipt/${receipt.id}`, "_blank");
      } else {
        showError("No receipt found for this booking. Please record a payment first.");
      }
    } catch (error: any) {
      showError(error.message || "Failed to view receipt");
    }
  };

  const loadAll = async () => {
    setIsLoading(true);
    try {
      if (!id) return;
      const data = await API.getBooking(id);
      setBooking(data);
      if (data) {
        const docs = await API.getBookingDocuments(id);
        setDocuments(docs);
        const actData = await API.getBookingActivities(id);
        setActivities(actData);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
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
            <Plane className="w-4 h-4" /> PNR:{" "}
            <span className="font-mono font-medium text-tf-text-primary">
              {booking.pnr}
            </span>
          </>
        }
        actions={
          <>
            {booking.balance > 0 && (
              <Button
                variant="outline"
                onClick={() => setIsPaymentDrawerOpen(true)}
                className="bg-[var(--tf-success-soft)] text-tf-success hover:bg-tf-success hover:text-white border-tf-success/30 transition-colors"
              >
                <CreditCard className="w-4 h-4 mr-2" /> Record Payment
              </Button>
            )}
            <Button
              variant="outline"
              className="bg-tf-surface text-tf-text-primary"
              onClick={handleViewInvoice}
              disabled={isGeneratingInvoice}
            >
              <FileText className="w-4 h-4 mr-2" /> 
              {isGeneratingInvoice ? "Opening..." : "View Invoice"}
            </Button>
            <Button
              variant="outline"
              className="bg-tf-surface text-tf-text-primary"
              onClick={handleViewReceipt}
            >
              <FileText className="w-4 h-4 mr-2" /> 
              View Receipt
            </Button>
            <Button className="bg-tf-primary text-white hover:bg-tf-primary-hover">
              <Download className="w-4 h-4 mr-2" /> E-Ticket
            </Button>
          </>
        }
      />

      <RecordPaymentDrawer
        isOpen={isPaymentDrawerOpen}
        onClose={() => setIsPaymentDrawerOpen(false)}
        booking={booking}
        onSuccess={async () => {
          const data = await API.getBooking(id);
          setBooking(data);
        }}
      />

      {/* Overview Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Customer & Trip */}
        <Card className="col-span-1 lg:col-span-2 shadow-sm border-tf-border bg-tf-surface">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2 text-tf-text-primary">
              <User className="w-5 h-5 text-tf-primary" /> Passenger Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <p className="text-xs text-tf-text-muted uppercase tracking-wider mb-1">
                  Name
                </p>
                <p className="font-medium text-tf-text-primary">
                  {booking.customer?.firstName} {booking.customer?.lastName}
                </p>
              </div>
              <div>
                <p className="text-xs text-tf-text-muted uppercase tracking-wider mb-1">
                  Phone
                </p>
                <p className="font-medium text-tf-text-primary">
                  {booking.customer?.phone}
                </p>
              </div>
              <div>
                <p className="text-xs text-tf-text-muted uppercase tracking-wider mb-1">
                  Email
                </p>
                <p className="font-medium text-tf-text-primary">
                  {booking.customer?.email}
                </p>
              </div>
              <div>
                <p className="text-xs text-tf-text-muted uppercase tracking-wider mb-1">
                  Airline
                </p>
                <p className="font-medium text-tf-text-primary flex items-center gap-2">
                  {booking.airline}
                </p>
              </div>
              <div>
                <p className="text-xs text-tf-text-muted uppercase tracking-wider mb-1">
                  Route
                </p>
                <p className="font-medium text-tf-text-primary flex items-center gap-2">
                  {booking.departureCity}{" "}
                  <ArrowLeft className="w-3 h-3 rotate-180 text-tf-text-muted" />{" "}
                  {booking.arrivalCity}
                </p>
              </div>
              <div>
                <p className="text-xs text-tf-text-muted uppercase tracking-wider mb-1">
                  Departure
                </p>
                <p className="font-medium text-tf-text-primary">
                  {new Date(booking.departureDate).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
              </div>
              {booking.returnDate && (
                <div>
                  <p className="text-xs text-tf-text-muted uppercase tracking-wider mb-1">
                    Return
                  </p>
                  <p className="font-medium text-tf-text-primary">
                    {new Date(booking.returnDate).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </div>
              )}
              <div>
                <p className="text-xs text-tf-text-muted uppercase tracking-wider mb-1">
                  Ticket No
                </p>
                <p className="font-mono font-medium text-tf-text-primary">
                  {booking.ticketNumber || "Pending"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Financials */}
        <Card className="shadow-sm border-tf-border bg-tf-surface">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2 text-tf-text-primary">
              <CreditCard className="w-5 h-5 text-tf-success" /> Financials
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center py-2 border-b border-tf-border">
              <span className="text-tf-text-secondary">Cost Price</span>
              <CurrencyDisplay
                amount={booking.costPrice}
                className="text-tf-text-primary"
              />
            </div>
            <div className="flex justify-between items-center py-2 border-b border-tf-border">
              <span className="text-tf-text-secondary">Sale Price</span>
              <CurrencyDisplay
                amount={booking.salePrice}
                className="font-semibold text-tf-text-primary"
              />
            </div>
            <div className="flex justify-between items-center py-2 border-b border-tf-border">
              <span className="text-tf-text-secondary">Profit Margin</span>
              <span className="font-medium text-tf-success">
                <CurrencyDisplay amount={booking.profit} /> (
                {Math.round(booking.profitMargin)}%)
              </span>
            </div>
            <div className="pt-2">
              <div className="flex justify-between items-center mb-2">
                <span className="text-tf-text-secondary">Amount Received</span>
                <CurrencyDisplay
                  amount={booking.amountReceived}
                  className="text-tf-text-primary"
                />
              </div>
              <div className="w-full bg-tf-border rounded-full h-2">
                <div
                  className="bg-[var(--tf-success)] h-2 rounded-full"
                  style={{
                    width: `${(booking.amountReceived / booking.salePrice) * 100}%`,
                  }}
                ></div>
              </div>
              <div className="flex justify-between items-center mt-2">
                <span className="text-tf-danger text-sm font-medium">
                  Balance Due
                </span>
                <CurrencyDisplay
                  amount={booking.balance}
                  className="text-tf-danger font-bold"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="details" className="w-full">
        <TabsList className="bg-tf-surface border border-tf-border p-1 rounded-lg">
          <TabsTrigger
            value="details"
            className="rounded-md data-[state=active]:bg-tf-primary data-[state=active]:text-white"
          >
            Full Details
          </TabsTrigger>
          <TabsTrigger
            value="timeline"
            className="rounded-md data-[state=active]:bg-tf-primary data-[state=active]:text-white"
          >
            Activity Log
          </TabsTrigger>
          <TabsTrigger
            value="documents"
            className="rounded-md data-[state=active]:bg-tf-primary data-[state=active]:text-white"
          >
            Documents
          </TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="mt-4">
          <Card className="border-tf-border bg-tf-surface shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Additional Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <p className="text-sm font-medium text-tf-text-secondary mb-2">
                    Supplier Details
                  </p>
                  <div className="bg-tf-surface-2 p-4 rounded-lg">
                    <p className="font-medium text-tf-text-primary">
                      {booking.supplier?.name || "Unknown Supplier"}
                    </p>
                    <p className="text-sm text-tf-text-muted mt-1">
                      {booking.supplier?.contactPerson}
                    </p>
                    <p className="text-sm text-tf-text-muted mt-1">
                      {booking.supplier?.email}
                    </p>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-tf-text-secondary mb-2">
                    System Metadata
                  </p>
                  <div className="bg-tf-surface-2 p-4 rounded-lg space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-tf-text-muted">
                        Created By (Agent)
                      </span>
                      <span className="text-tf-text-primary">
                        {booking.agent?.name || booking.agentId}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-tf-text-muted">Branch</span>
                      <span className="text-tf-text-primary">
                        {booking.branch?.name || booking.branchId}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-tf-text-muted">Created At</span>
                      <span className="text-tf-text-primary">
                        {new Date(booking.createdAt).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timeline" className="mt-4">
          <Card className="border-tf-border bg-tf-surface shadow-sm">
            <CardContent className="pt-6">
              <div className="space-y-6">
                {
                  (activities.length > 0 ? activities.map(a => ({
                    title: a.title,
                    desc: a.description,
                    date: a.createdAt,
                  })) : [
                    {
                      title: "Booking Created",
                      desc: "Initial reservation made in system",
                      date: booking.createdAt,
                    }
                  ]).map((event, i, arr) => (
                  <div key={i} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-3 h-3 rounded-full bg-tf-primary"></div>
                      {i !== arr.length - 1 && (
                        <div className="w-0.5 h-full bg-tf-border my-1"></div>
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-tf-text-primary">
                        {event.title}
                      </p>
                      <p className="text-sm text-tf-text-muted mt-1">
                        {event.desc}
                      </p>
                      <p className="text-xs text-tf-text-muted mt-2 flex items-center gap-1">
                        <Clock className="w-3 h-3" />{" "}
                        {new Date(event.date).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents" className="mt-4">
          <Card className="border-tf-border bg-tf-surface shadow-sm">
            <CardContent className="pt-6">
              <BookingDocumentsPanel
                bookingId={id}
                documents={documents}
                onUpdate={loadAll}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
