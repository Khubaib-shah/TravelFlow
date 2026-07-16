"use client";

import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
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
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="bg-tf-surface border-l border-tf-border sm:max-w-md w-full overflow-y-auto">
        <SheetHeader className="mb-6">
          <SheetTitle className="text-tf-text-primary">
            Settle Balance
          </SheetTitle>
          <SheetDescription className="text-tf-text-secondary">
            Record a payment made to {supplier.name}.
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
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

          <div className="flex items-center gap-3 pt-4 border-t border-tf-border">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 bg-transparent"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-tf-primary hover:bg-tf-primary-hover text-white"
            >
              {isSubmitting ? "Processing..." : "Record Payment"}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
