"use client";

import { use, useEffect, useState } from "react";
import {
  ArrowLeft,
  User,
  Phone,
  Mail,
  MapPin,
  Briefcase,
  CalendarDays,
  Edit,
  ArrowRight,
  CreditCard,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DetailHeader } from "@/components/shared/DetailHeader";
import { API } from "@/lib/data-source";
import { Customer, Booking, CustomerNote, CustomerDocument } from "@/types";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { CurrencyDisplay } from "@/components/shared/CurrencyDisplay";
import { DataTable } from "@/components/tables/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import { formatCurrencyPKR } from "@/lib/utils";
import { TableEntityLink } from "@/components/shared/TableEntityLink";
import { DataTableRowActions } from "@/components/tables/DataTableRowActions";
import { CustomerNotesPanel } from "@/components/customers/CustomerNotesPanel";
import { CustomerDocumentsPanel } from "@/components/customers/CustomerDocumentsPanel";
import { DrawerForm } from "@/components/forms/DrawerForm";
import { FormField, FormSelect } from "@/components/forms/FormField";
import { Form } from "@/components/ui/form";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@/lib/zod-resolver";
import {
  customerSchema,
  CustomerFormValues,
  PAKISTAN_CITIES,
  countryForCity,
} from "@/features/customers/schemas/customer.schema";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { mapCustomerToForm } from "@/features/customers/utils/mapCustomerToForm";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { RecordPaymentDrawer } from "@/components/bookings/RecordPaymentDrawer";

export default function CustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { id } = use(params);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [notes, setNotes] = useState<CustomerNote[]>([]);
  const [documents, setDocuments] = useState<CustomerDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [isPaymentDrawerOpen, setIsPaymentDrawerOpen] = useState(false);
  const [selectedBookingForPayment, setSelectedBookingForPayment] =
    useState<Booking | null>(null);

  const form = useForm<CustomerFormValues>({
    resolver: zodResolver(customerSchema),
  });

  const loadAll = async () => {
    setIsLoading(true);
    const data = await API.getCustomer(id);
    setCustomer(data);
    if (data) {
      const allBookings = await API.getBookings();
      setBookings(allBookings.filter((b) => b.customerId === id));
      setNotes(await API.getCustomerNotes(id));
      setDocuments(await API.getCustomerDocuments(id));
      form.reset({
        type: data.type,
        firstName: data.firstName,
        lastName: data.lastName,
        companyName: data.companyName ?? "",
        businessType: data.businessType ?? "",
        taxNumber: data.taxNumber ?? "",
        email: data.email ?? "",
        phone: data.phone,
        whatsapp: data.whatsapp ?? "",
        dateOfBirth: data.dateOfBirth
          ? new Date(data.dateOfBirth).toISOString().slice(0, 10)
          : "",
        gender: data.gender,
        cnic: data.cnic ?? "",
        passportNumber: data.passportNumber ?? "",
        city: data.city ?? "Karachi",
        country: data.country ?? "Pakistan",
        address: data.address ?? "",
        emergencyContactName: data.emergencyContactName ?? "",
        emergencyContactPhone: data.emergencyContactPhone ?? "",
        internalNotes: data.internalNotes ?? "",
      });
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadAll();
  }, [id]);

  const columns: ColumnDef<Booking>[] = [
    {
      accessorKey: "bookingRef",
      header: "Reference",
      cell: ({ row }) => (
        <TableEntityLink
          onClick={() => router.push(`/bookings/${row.original.id}`)}
        >
          {row.original.bookingRef}
        </TableEntityLink>
      ),
    },
    {
      accessorKey: "pnr",
      header: "PNR",
      cell: ({ row }) => (
        <div className="font-mono text-xs">{row.original.pnr}</div>
      ),
    },
    {
      accessorKey: "airline",
      header: "Route",
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-medium text-tf-text-primary">
            {row.original.airline}
          </span>
          <span className="text-xs text-tf-text-muted">
            {row.original.departureCity} → {row.original.arrivalCity}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "departureDate",
      header: "Date",
      cell: ({ row }) => (
        <span className="text-xs">
          {new Date(row.original.departureDate).toLocaleDateString("en-GB")}
        </span>
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
      cell: ({ row }) => (
        <StatusBadge status={row.original.bookingStatus as any} />
      ),
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <DataTableRowActions
          row={row}
          onView={() => router.push(`/bookings/${row.original.id}`)}
          customActions={(r) => (
            <DropdownMenuItem
              onClick={() => {
                setSelectedBookingForPayment(r.original);
                setIsPaymentDrawerOpen(true);
              }}
              className="text-tf-success focus:bg-tf-success-soft focus:text-tf-success cursor-pointer"
            >
              <CreditCard className="mr-2 h-4 w-4" />
              Record Payment
            </DropdownMenuItem>
          )}
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
            <User className="w-4 h-4" /> Ref:{" "}
            <span className="font-mono font-medium text-tf-text-primary">
              {customer.customerRef}
            </span>
          </>
        }
        actions={
          <Button
            onClick={() => {
              if (customer) form.reset(mapCustomerToForm(customer));
              setEditOpen(true);
            }}
            className="bg-tf-primary text-white hover:bg-tf-primary-hover"
          >
            <Edit className="w-4 h-4 mr-2" /> Edit Customer
          </Button>
        }
      />

      {/* Overview Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Contact Info */}
        <Card className="col-span-1 lg:col-span-2 shadow-sm border-tf-border bg-[var(--tf-surface)]">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2 text-tf-text-primary">
              <User className="w-5 h-5 text-tf-primary" /> Profile Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              <div>
                <p className="text-xs text-tf-text-muted uppercase tracking-wider mb-1 flex items-center gap-1">
                  <Phone className="w-3 h-3" /> Phone
                </p>
                <p className="font-medium text-tf-text-primary">
                  {customer.phone}
                </p>
              </div>
              {customer.whatsapp && (
                <div>
                  <p className="text-xs text-tf-text-muted uppercase tracking-wider mb-1">
                    WhatsApp
                  </p>
                  <p className="font-medium text-tf-text-primary">
                    {customer.whatsapp}
                  </p>
                </div>
              )}
              <div>
                <p className="text-xs text-tf-text-muted uppercase tracking-wider mb-1 flex items-center gap-1">
                  <Mail className="w-3 h-3" /> Email
                </p>
                <p className="font-medium text-tf-text-primary truncate">
                  {customer.email || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-xs text-tf-text-muted uppercase tracking-wider mb-1 flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> City
                </p>
                <p className="font-medium text-tf-text-primary">
                  {customer.city || "Unknown"}
                </p>
              </div>
              <div>
                <p className="text-xs text-tf-text-muted uppercase tracking-wider mb-1 flex items-center gap-1">
                  <Briefcase className="w-3 h-3" /> Type
                </p>
                <p className="font-medium text-tf-text-primary capitalize">
                  {customer.type}
                </p>
              </div>
              {customer.type === "corporate" && customer.companyName && (
                <div className="col-span-2 md:col-span-1">
                  <p className="text-xs text-tf-text-muted uppercase tracking-wider mb-1">
                    Company
                  </p>
                  <p className="font-medium text-tf-text-primary">
                    {customer.companyName}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Lifetime Stats */}
        <Card className="shadow-sm border-tf-border bg-[var(--tf-surface)]">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg text-tf-text-primary">
              Value Metrics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center py-2 border-b border-tf-border">
              <span className="text-tf-text-secondary">Total Bookings</span>
              <span className="font-semibold text-tf-primary text-xl">
                {customer.totalBookings}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-tf-border">
              <span className="text-tf-text-secondary">Lifetime Spend</span>
              <CurrencyDisplay
                amount={customer.totalSpent}
                className="font-bold text-tf-text-primary text-xl"
              />
            </div>
            <div className="flex justify-between items-center pt-2">
              <span className="text-tf-text-secondary">Customer Since</span>
              <span className="font-medium text-tf-text-primary flex items-center gap-1">
                <CalendarDays className="w-4 h-4 text-tf-text-muted" />
                {new Date(customer.createdAt).getFullYear()}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="bookings" className="w-full">
        <TabsList className="bg-[var(--tf-surface)] border border-tf-border p-1 rounded-lg">
          <TabsTrigger
            value="bookings"
            className="rounded-md data-[state=active]:bg-tf-primary data-[state=active]:text-white"
          >
            Booking History
          </TabsTrigger>
          <TabsTrigger
            value="documents"
            className="rounded-md data-[state=active]:bg-tf-primary data-[state=active]:text-white"
          >
            Travel Documents
          </TabsTrigger>
          <TabsTrigger
            value="notes"
            className="rounded-md data-[state=active]:bg-tf-primary data-[state=active]:text-white"
          >
            Internal Notes
          </TabsTrigger>
        </TabsList>

        <TabsContent value="bookings" className="mt-4">
          <Card className="border-tf-border bg-[var(--tf-surface)] shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Recent Bookings</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push("/bookings")}
              >
                View All Bookings <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </CardHeader>
            <CardContent>
              {bookings.length === 0 ? (
                <div className="text-center py-12 border border-tf-border rounded-lg">
                  <p className="text-tf-text-secondary">
                    No bookings found for this customer.
                  </p>
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => router.push("/bookings/new")}
                  >
                    Create Booking
                  </Button>
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
          <Card className="border-tf-border bg-[var(--tf-surface)] shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Uploaded Documents</CardTitle>
            </CardHeader>
            <CardContent>
              <CustomerDocumentsPanel
                customerId={id}
                documents={documents}
                onUpdate={loadAll}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notes" className="mt-4">
          <Card className="border-tf-border bg-[var(--tf-surface)] shadow-sm">
            <CardContent className="pt-6">
              <CustomerNotesPanel
                customerId={id}
                notes={notes}
                onUpdate={loadAll}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <DrawerForm
        title="Edit Customer"
        description="Update customer profile information."
        isOpen={editOpen}
        onClose={() => setEditOpen(false)}
        onSubmit={form.handleSubmit(async (values) => {
          if (!customer) return;
          await API.updateCustomer(customer.id, values);
          toast.success("Customer updated successfully");
          setEditOpen(false);
          loadAll();
        })}
        isSubmitting={form.formState.isSubmitting}
        size="md"
      >
        <Form {...form}>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="firstName"
                label="First Name"
              />
              <FormField
                control={form.control}
                name="lastName"
                label="Last Name"
              />
              <FormField
                control={form.control}
                name="email"
                label="Email"
                type="email"
              />
              <FormField
                control={form.control}
                name="phone"
                label="Phone"
                type="tel"
              />
              <FormField
                control={form.control}
                name="whatsapp"
                label="WhatsApp"
                type="tel"
              />
              <FormSelect
                control={form.control}
                name="city"
                label="City"
                options={PAKISTAN_CITIES.map((c) => ({ label: c, value: c }))}
              />
              <FormField
                control={form.control}
                name="country"
                label="Country"
              />
              <FormField control={form.control} name="cnic" label="CNIC" />
              <FormField
                control={form.control}
                name="passportNumber"
                label="Passport"
              />
            </div>
            <div className="flex items-center gap-3">
              <Label className="normal-case tracking-normal">Individual</Label>
              <Controller
                control={form.control}
                name="type"
                render={({ field }) => (
                  <Switch
                    checked={field.value === "corporate"}
                    onCheckedChange={(checked) =>
                      field.onChange(checked ? "corporate" : "individual")
                    }
                  />
                )}
              />
              <Label className="normal-case tracking-normal">Corporate</Label>
            </div>
            {form.watch("type") === "corporate" && (
              <FormField
                control={form.control}
                name="companyName"
                label="Company Name"
              />
            )}
            <FormField
              control={form.control}
              name="internalNotes"
              label="Internal Notes"
            />
          </div>
        </Form>
      </DrawerForm>

      <RecordPaymentDrawer
        isOpen={isPaymentDrawerOpen}
        onClose={() => {
          setIsPaymentDrawerOpen(false);
          setSelectedBookingForPayment(null);
        }}
        booking={selectedBookingForPayment}
        onSuccess={() => {
          loadAll();
        }}
      />
    </div>
  );
}
