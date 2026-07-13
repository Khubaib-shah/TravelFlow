"use client";

import { useEffect, useMemo } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@/lib/zod-resolver";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";

import { DrawerForm } from "@/components/forms/DrawerForm";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import {
  FormField,
  FormSelect,
  FormTextArea,
} from "@/components/forms/FormField";

import {
  quotationDefaultValues,
  quotationSchema,
  quotationStatusOptions,
  quotationTaxTypeOptions,
  type QuotationFormValues,
} from "@/features/quotations/schemas/quotation.schema";
import type { QuotationItem, QuotationTax, Quotation } from "@/types/quotation";
import type { Customer, Supplier, Branch, User } from "@/types";

import { API } from "@/lib/data-source";

function calcSubtotal(items: QuotationItem[]) {
  return (items ?? []).reduce((acc, it) => acc + it.quantity * it.unitPrice, 0);
}

function calcTaxAmount(subtotal: number, taxes: QuotationTax[]) {
  return (taxes ?? []).reduce((acc, t) => {
    if (t.taxType === "fixed") return acc + t.value;
    return acc + subtotal * (t.value / 100);
  }, 0);
}

function formatMoney(n: unknown) {
  if (typeof n !== "number") return "0";
  return n.toLocaleString?.() ?? String(n);
}

export function QuotationDrawer({
  title,
  description,
  isOpen,
  onClose,
  onSaved,
  initialValues,
  size = "lg",
  customers = [],
  branches = [],
  agents = [],

  editingId,
  mode = "create",
  onEditFromView,
  onCreateFromView,
}: {
  title: string;
  description?: string;
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => Promise<void> | void;
  initialValues?: Partial<QuotationFormValues>;
  size?: "sm" | "md" | "lg" | "xl";
  customers?: Customer[];
  branches?: Branch[];
  agents?: User[];
  editingId?: string;
  mode?: "create" | "edit" | "view";
  onEditFromView?: () => void;
  onCreateFromView?: () => void;
}) {
  const isViewMode = mode === "view";

  const form = useForm<QuotationFormValues>({
    resolver: zodResolver(quotationSchema),
    defaultValues: { ...quotationDefaultValues, ...initialValues },
  });

  const {
    fields: itemFields,
    append: appendItem,
    remove: removeItem,
  } = useFieldArray({ control: form.control, name: "items" });

  const {
    fields: taxFields,
    append: appendTax,
    remove: removeTax,
  } = useFieldArray({ control: form.control, name: "taxes" });

  const watchedItems = form.watch("items");
  const watchedTaxes = form.watch("taxes") ?? [];

  // Defensive: backend / initialValues mapping might accidentally provide a non-array.
  const watchedItemsArray = Array.isArray(watchedItems) ? watchedItems : [];
  const watchedTaxesArray = Array.isArray(watchedTaxes) ? watchedTaxes : [];

  const subtotal = useMemo(
    () => calcSubtotal(watchedItemsArray as any),
    [watchedItemsArray],
  );
  const taxAmount = useMemo(
    () => calcTaxAmount(subtotal, watchedTaxesArray as any),
    [subtotal, watchedTaxesArray],
  );
  const grandTotal = subtotal + taxAmount;

  useEffect(() => {
    if (!isOpen) return;
    form.reset({ ...quotationDefaultValues, ...initialValues });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, editingId, mode]);

  const onSubmit = async (values: QuotationFormValues) => {
    if (isViewMode) return;

    try {
      // Only runs if validation succeeded
      console.log("[QuotationDrawer] Submitting validated payload:", values);

      if (editingId) {
        await API.updateQuotation(editingId, values);
        toast.success("Quotation updated successfully");
      } else {
        const created = await API.createQuotation(values);
        toast.success("Quotation created successfully", {
          description: created.quotationRef
            ? `Ref: ${created.quotationRef}`
            : undefined,
        });
      }

      await onSaved();
      onClose();
    } catch (e: any) {
      toast.error(e.message || "Failed to save quotation");
    }
  };

  if (isViewMode) {
    const values = form.getValues();

    return (
      <DrawerForm
        title={title}
        description={description}
        isOpen={isOpen}
        onClose={onClose}
        // DrawerForm always renders its footer with Cancel + Submit when onSubmit is provided.
        // We omit onSubmit by not passing it (no submit in view mode).
      >
        <div className="space-y-5">
          <div className="flex items-center justify-between gap-3">
            <div />
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                className="border-tf-border text-tf-text-secondary"
                onClick={onClose}
              >
                ✕
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={onEditFromView}
              >
                Edit
              </Button>

              <Button
                type="button"
                variant="secondary"
                onClick={() => onCreateFromView?.()}
              >
                Create
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-xs text-tf-text-muted uppercase tracking-wider">
              Title
            </div>
            <div className="text-sm font-medium text-tf-text-primary">
              {values.title || "-"}
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-xs text-tf-text-muted uppercase tracking-wider">
              Customer / Supplier IDs
            </div>
            <div className="text-sm text-tf-text-primary">
              Customer: {values.customerId || "-"}
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-xs text-tf-text-muted uppercase tracking-wider">
              Items
            </div>
            <div className="space-y-2">
              {(Array.isArray(values.items) ? values.items : []).map(
                (it, idx) => (
                  <div
                    key={`${it.id ?? "new"}-${idx}`}
                    className="rounded-lg border border-tf-border p-3"
                  >
                    <div className="font-medium text-tf-text-primary">
                      {it.description || "-"}
                    </div>
                    <div className="text-sm text-tf-text-secondary">
                      Qty: {it.quantity} • Unit: {formatMoney(it.unitPrice)}
                    </div>
                  </div>
                ),
              )}
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-xs text-tf-text-muted uppercase tracking-wider">
              Taxes
            </div>
            <div className="space-y-2">
              {(Array.isArray(values.taxes) ? values.taxes : []).map(
                (t, idx) => (
                  <div
                    key={`${t.id ?? "new"}-${idx}`}
                    className="rounded-lg border border-tf-border p-3"
                  >
                    <div className="font-medium text-tf-text-primary">
                      {t.label || "-"}
                    </div>
                    <div className="text-sm text-tf-text-secondary">
                      {t.taxType} • Value: {formatMoney(t.value)}
                    </div>
                  </div>
                ),
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="text-xs text-tf-text-muted uppercase tracking-wider">
                Notes
              </div>
              <div className="text-sm text-tf-text-primary">
                {values.notes || "-"}
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-xs text-tf-text-muted uppercase tracking-wider">
                Terms
              </div>
              <div className="text-sm text-tf-text-primary">
                {values.terms || "-"}
              </div>
            </div>
          </div>

          <div className="pt-1">
            <div className="text-sm font-semibold text-tf-text-primary">
              Grand Total: ₨ {grandTotal?.toLocaleString?.() ?? "0"}
            </div>
          </div>
        </div>
      </DrawerForm>
    );
  }

  return (
    <DrawerForm
      title={title}
      description={description}
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={(e) => {
        e.preventDefault();

        const values = form.getValues();
        console.log(
          "[QuotationDrawer] Create/Update submit clicked. Current form values:",
          values,
        );

        form.handleSubmit(onSubmit, (formErrors) => {
          console.log(
            "[QuotationDrawer] Validation failed. Errors:",
            formErrors,
          );
          // Keep UI feedback minimal here; react-hook-form FormField components should show errors.
        })(e);
      }}
      isSubmitting={form.formState.isSubmitting}
      size={size}
      submitLabel={editingId ? "Save Changes" : "Create Quotation"}
    >
      <Form {...form}>
        <div className="space-y-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-tf-text-primary">
                Parties
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="title"
                  label="Title"
                  placeholder="e.g. Umrah package - 2026"
                  required
                />

                <FormField
                  control={form.control}
                  name="customerId"
                  label="Customer Name"
                  placeholder="Type customer name"
                  required
                />
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-tf-text-primary">
                Items
              </h4>
              <div className="space-y-3">
                {itemFields.map((field, index) => (
                  <div
                    key={field.id}
                    className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end"
                  >
                    <div className="md:col-span-6">
                      <FormField
                        control={form.control}
                        name={`items.${index}.description` as const}
                        label={index === 0 ? "Description" : ""}
                        placeholder="e.g. Umrah package"
                        required
                      />
                    </div>
                    <div className="md:col-span-2">
                      <FormField
                        control={form.control}
                        name={`items.${index}.quantity` as const}
                        label={index === 0 ? "Qty" : ""}
                        type="number"
                        required
                      />
                    </div>
                    <div className="md:col-span-3">
                      <FormField
                        control={form.control}
                        name={`items.${index}.unitPrice` as const}
                        label={index === 0 ? "Unit Price (PKR)" : ""}
                        type="number"
                        required
                      />
                    </div>
                    <div className="md:col-span-1 flex justify-end">
                      <Button
                        type="button"
                        variant="outline"
                        className="border-tf-border text-tf-text-muted hover:text-tf-text-primary"
                        onClick={() => removeItem(index)}
                        disabled={itemFields.length <= 1}
                        aria-label="Remove item"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}

                <Button
                  type="button"
                  variant="outline"
                  className="w-full border-dashed border-tf-border text-tf-text-secondary hover:bg-tf-surface-2"
                  onClick={() =>
                    appendItem({
                      id: undefined,
                      description: "",
                      quantity: 1,
                      unitPrice: 0,
                    })
                  }
                >
                  <Plus className="mr-2 h-4 w-4" /> Add Item
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-tf-text-primary">
                Taxes
              </h4>

              <div className="space-y-3">
                {taxFields.map((field, index) => (
                  <div
                    key={field.id}
                    className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end"
                  >
                    <div className="md:col-span-5">
                      <FormField
                        control={form.control}
                        name={`taxes.${index}.label` as const}
                        label={index === 0 ? "Label" : ""}
                        placeholder="e.g. Sales tax"
                        required
                      />
                    </div>
                    <div className="md:col-span-3">
                      <FormSelect
                        control={form.control}
                        name={`taxes.${index}.taxType` as const}
                        label={index === 0 ? "Type" : ""}
                        required
                        options={quotationTaxTypeOptions.map((t) => ({
                          label: t.label,
                          value: t.value,
                        }))}
                      />
                    </div>
                    <div className="md:col-span-3">
                      <FormField
                        control={form.control}
                        name={`taxes.${index}.value` as const}
                        label={index === 0 ? "Value" : ""}
                        type="number"
                        required
                      />
                    </div>
                    <div className="md:col-span-1 flex justify-end">
                      <Button
                        type="button"
                        variant="outline"
                        className="border-tf-border text-tf-text-muted hover:text-tf-text-primary"
                        onClick={() => removeTax(index)}
                        aria-label="Remove tax"
                        disabled={taxFields.length <= 0}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}

                <Button
                  type="button"
                  variant="outline"
                  className="w-full border-dashed border-tf-border text-tf-text-secondary hover:bg-tf-surface-2"
                  onClick={() =>
                    appendTax({
                      id: undefined,
                      label: "VAT",
                      taxType: "percentage",
                      value: 0,
                    })
                  }
                >
                  <Plus className="mr-2 h-4 w-4" /> Add Tax
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-tf-text-primary">
                Notes & Terms
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormTextArea
                  control={form.control}
                  name="notes"
                  label="Notes"
                  placeholder="Internal or customer notes"
                />
                <FormTextArea
                  control={form.control}
                  name="terms"
                  label="Terms"
                  placeholder="Payment / cancellation / package terms"
                />
              </div>

              <FormSelect
                control={form.control}
                name="status"
                label="Quotation Status"
                options={quotationStatusOptions.map((s) => ({
                  label: s.label,
                  value: s.value,
                }))}
              />
            </div>
          </div>
        </div>
      </Form>
    </DrawerForm>
  );
}
