"use client";

import { useState } from "react";
import { DrawerForm } from "@/components/forms/DrawerForm";
import { Input } from "@/components/ui/input";
import { showSuccess, showError } from "@/lib/toast-utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Supplier } from "@/types";
import { API } from "@/lib/data-source";

interface SettleBalanceDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  supplier: Supplier;
  onSuccess?: () => void;
}

export function SettleBalanceDrawer({
  isOpen,
  onClose,
  supplier,
  onSuccess,
}: SettleBalanceDrawerProps) {
  const [amount, setAmount] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<string>("bank_transfer");
  const [reference, setReference] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) {
      showError("Please enter a valid amount");
      return;
    }

    setIsSubmitting(true);
    try {
      await API.recordSupplierPayment(supplier.id, {
        amount: Number(amount),
        method: paymentMethod,
        reference,
      });
      showSuccess(
        `Successfully recorded payment of Rs ${Number(amount).toLocaleString()} to ${supplier.name}`,
      );
      onSuccess?.();
      onClose();
    } catch (error: unknown) {
      const err = error as { message?: string };
      showError(err.message || "Failed to process payment");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DrawerForm
      title="Settle Balance"
      description={`Record a payment made to ${supplier.name}.`}
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting}
      size="sm"
      submitLabel="Record Payment"
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-tf-surface-2 rounded-lg border border-tf-border">
          <span className="text-sm text-tf-text-secondary">
            Current Balance
          </span>
          <span className="text-lg font-bold text-tf-danger">
            Rs {supplier.balance.toLocaleString()}
          </span>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-tf-text-primary">
            Amount to Pay (PKR)
          </label>
          <Input
            type="number"
            placeholder="e.g. 50000"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="bg-tf-surface"
            min="1"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-tf-text-primary">
            Payment Method
          </label>
          <Select value={paymentMethod} onValueChange={setPaymentMethod}>
            <SelectTrigger className="bg-tf-surface">
              <SelectValue placeholder="Select method" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
              <SelectItem value="cheque">Cheque</SelectItem>
              <SelectItem value="cash">Cash</SelectItem>
              <SelectItem value="credit_card">Credit Card</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-tf-text-primary">
            Reference / Cheque No. (Optional)
          </label>
          <Input
            type="text"
            placeholder="e.g. TRN-12345"
            value={reference}
            onChange={(e) => setReference(e.target.value)}
            className="bg-tf-surface"
          />
        </div>
      </div>
    </DrawerForm>
  );
}
