"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@/lib/zod-resolver";
import { z } from "zod";
import { toast } from "sonner";
import { DrawerForm } from "@/components/forms/DrawerForm";
import { FormField, FormSelect } from "@/components/forms/FormField";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { CurrencyDisplay } from "@/components/shared/CurrencyDisplay";
import { Lead, Supplier } from "@/types";
import { API } from "@/lib/data-source";

const bookingSchema = z
  .object({
    airline: z.string().min(1),
    departureCity: z.string().min(1),
    arrivalCity: z.string().min(1),
    departureDate: z.string().min(1),
    returnDate: z.string().optional(),
    pnr: z.string().optional(),
    ticketNumber: z.string().optional(),
    supplierId: z.string().min(1),
    costPrice: z.coerce.number().positive("Cost price must be greater than 0"),
    salePrice: z.coerce.number().positive("Sale price must be greater than 0"),
    paymentStatus: z.enum(["unpaid", "partial", "paid"]),
    amountReceived: z.coerce.number().min(0).optional(),
    paymentMethod: z.string().optional(),
  })
  .refine((d) => d.salePrice >= d.costPrice, {
    message: "Sale price must be >= cost price",
    path: ["salePrice"],
  });

type BookingValues = z.infer<typeof bookingSchema>;

interface ConvertToBookingDrawerProps {
  lead: Lead;
  isOpen: boolean;
  onClose: () => void;
}

export function ConvertToBookingDrawer({
  lead,
  isOpen,
  onClose,
}: ConvertToBookingDrawerProps) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);

  const form = useForm<BookingValues>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      airline: "Emirates",
      departureCity: "KHI",
      arrivalCity: "DXB",
      departureDate: "",
      paymentStatus: "unpaid",
      amountReceived: 0,
      supplierId: "",
      costPrice: 0,
      salePrice: 0,
    },
  });

  const loadSuppliers = async () => {
    const data = await API.getSuppliers();
    setSuppliers(data);
    if (data[0] && !form.getValues("supplierId")) {
      form.setValue("supplierId", data[0].id);
    }
  };

  useEffect(() => {
    if (isOpen) {
      setStep(1);
      loadSuppliers();
    }
  }, [isOpen]);

  const costPrice = form.watch("costPrice") || 0;
  const salePrice = form.watch("salePrice") || 0;
  const profit = salePrice - costPrice;
  const margin = salePrice > 0 ? (profit / salePrice) * 100 : 0;

  const onSubmit = async (values: BookingValues) => {
    try {
      const booking = await API.convertLead(lead.id, {
        supplierId: values.supplierId,
        airline: values.airline,
        departureCity: values.departureCity,
        arrivalCity: values.arrivalCity,
        departureDate: values.departureDate,
        returnDate: values.returnDate,
        pnr: values.pnr,
        ticketNumber: values.ticketNumber,
        costPrice: values.costPrice,
        salePrice: values.salePrice,
        paymentStatus: values.paymentStatus,
        amountReceived: values.amountReceived,
        paymentMethod: values.paymentMethod,
        adults: lead.adults,
        children: lead.children,
      });
      toast.success(`Booking created successfully · ${booking.bookingRef}`);
      onClose();
      router.push(`/bookings/${booking.id}`);
    } catch (err: any) {
      toast.error(err.message || "Failed to convert lead to booking");
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 3) {
      setStep(step + 1);
      return;
    }
    form.handleSubmit(onSubmit)(e);
  };

  return (
    <DrawerForm
      title="Convert to Booking"
      description={`Step ${step} of 3 — ${lead.name}`}
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={handleFormSubmit}
      isSubmitting={form.formState.isSubmitting}
      submitLabel={step < 3 ? "Continue" : "Create Booking"}
      size="md"
    >
      {step === 1 && (
        <div className="space-y-4 text-sm">
          <div className="grid grid-cols-2 gap-4 rounded-lg border border-tf-border p-4 bg-tf-surface-2">
            <div>
              <p className="text-tf-text-muted">Customer</p>
              <p className="font-medium">{lead.name}</p>
            </div>
            <div>
              <p className="text-tf-text-muted">Phone</p>
              <p className="font-medium">{lead.phone}</p>
            </div>
            <div>
              <p className="text-tf-text-muted">Destination</p>
              <p className="font-medium">{lead.destination}</p>
            </div>
            <div>
              <p className="text-tf-text-muted">Budget</p>
              <p className="font-medium">
                {lead.budget
                  ? `₨ ${lead.budget.toLocaleString()}`
                  : "Unspecified"}
              </p>
            </div>
            <div>
              <p className="text-tf-text-muted">Adults</p>
              <p className="font-medium">{lead.adults}</p>
            </div>
            <div>
              <p className="text-tf-text-muted">Children</p>
              <p className="font-medium">{lead.children}</p>
            </div>
          </div>
        </div>
      )}

      {step >= 2 && (
        <Form {...form}>
          <div className={step === 2 ? "space-y-4" : "hidden"}>
            <FormSelect
              control={form.control}
              name="airline"
              label="Airline"
              options={[
                { label: "PIA", value: "PIA" },
                { label: "Emirates", value: "Emirates" },
                { label: "Qatar Airways", value: "Qatar Airways" },
                { label: "Turkish Airlines", value: "Turkish Airlines" },
                { label: "Fly Dubai", value: "Fly Dubai" },
                { label: "Saudi Airlines", value: "Saudi Airlines" },
                { label: "Air Arabia", value: "Air Arabia" },
                { label: "Serene Air", value: "Serene Air" },
                { label: "Air Blue", value: "Air Blue" },
              ]}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormSelect
                control={form.control}
                name="departureCity"
                label="Departure City"
                options={[
                  { label: "KHI", value: "KHI" },
                  { label: "LHE", value: "LHE" },
                  { label: "ISB", value: "ISB" },
                  { label: "PEW", value: "PEW" },
                  { label: "MUX", value: "MUX" },
                ]}
              />
              <FormSelect
                control={form.control}
                name="arrivalCity"
                label="Arrival City"
                options={[
                  { label: "DXB", value: "DXB" },
                  { label: "LHR", value: "LHR" },
                  { label: "JED", value: "JED" },
                  { label: "MED", value: "MED" },
                  { label: "IST", value: "IST" },
                  { label: "BKK", value: "BKK" },
                  { label: "KUL", value: "KUL" },
                  { label: "YYZ", value: "YYZ" },
                ]}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="departureDate"
                label="Departure Date"
                type="date"
              />
              <FormField
                control={form.control}
                name="returnDate"
                label="Return Date"
                type="date"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="pnr"
                label="PNR"
                placeholder="6 chars"
              />
              <FormField
                control={form.control}
                name="ticketNumber"
                label="Ticket Number"
              />
            </div>
          </div>

          <div className={step === 3 ? "space-y-4" : "hidden"}>
            <FormSelect
              control={form.control}
              name="supplierId"
              label="Supplier"
              options={suppliers.map((s) => ({ label: s.name, value: s.id }))}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="costPrice"
                label="Cost Price (PKR)"
                type="number"
              />
              <FormField
                control={form.control}
                name="salePrice"
                label="Sale Price (PKR)"
                type="number"
              />
            </div>
            <div className="rounded-lg border border-tf-border p-4 bg-[var(--tf-success-soft)]/30 space-y-1">
              <p className="text-sm text-tf-text-secondary">
                Profit:{" "}
                <CurrencyDisplay
                  amount={profit}
                  className="font-semibold text-tf-success inline"
                />
              </p>
              <p className="text-sm text-tf-text-secondary">
                Margin:{" "}
                <span className="font-semibold text-tf-success">
                  {margin.toFixed(1)}%
                </span>
              </p>
            </div>
            <FormSelect
              control={form.control}
              name="paymentStatus"
              label="Payment Status"
              options={[
                { label: "Unpaid", value: "unpaid" },
                { label: "Partial", value: "partial" },
                { label: "Paid", value: "paid" },
              ]}
            />
            {form.watch("paymentStatus") === "partial" && (
              <FormField
                control={form.control}
                name="amountReceived"
                label="Amount Received"
                type="number"
              />
            )}
            <FormSelect
              control={form.control}
              name="paymentMethod"
              label="Payment Method"
              options={[
                { label: "Cash", value: "cash" },
                { label: "Bank Transfer", value: "bank_transfer" },
                { label: "Cheque", value: "cheque" },
                { label: "Online", value: "online" },
              ]}
            />
          </div>
        </Form>
      )}

      {step > 1 && (
        <Button
          type="button"
          variant="ghost"
          className="mt-4 normal-case tracking-normal"
          onClick={() => setStep(step - 1)}
        >
          Back
        </Button>
      )}
    </DrawerForm>
  );
}
