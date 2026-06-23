"use client";

import * as React from "react";
import { X } from "lucide-react";

import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

interface DrawerFormProps {
  title: string;
  description?: string;
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (e: React.FormEvent) => void;
  isSubmitting?: boolean;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
  submitLabel?: string;
}

const sizeClasses = {
  sm: "sm:max-w-[400px]",
  md: "sm:max-w-[560px]",
  lg: "sm:max-w-[720px]",
  xl: "sm:max-w-[900px]",
};

export function DrawerForm({
  title,
  description,
  isOpen,
  onClose,
  onSubmit,
  isSubmitting = false,
  children,
  size = "md",
  submitLabel = "Save Changes",
}: DrawerFormProps) {
  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent
        className={cn("flex flex-col gap-0 p-0 sm:max-w-none bg-[var(--tf-surface)] border-l-[var(--tf-border)]", sizeClasses[size])}
      >
        <SheetHeader className="px-6 py-4 border-b border-[var(--tf-border)] space-y-1 bg-[var(--tf-surface)] text-left">
          <SheetTitle className="text-xl font-semibold text-[var(--tf-text-primary)]">
            {title}
          </SheetTitle>
          {description && (
            <SheetDescription className="text-sm text-[var(--tf-text-secondary)]">
              {description}
            </SheetDescription>
          )}
        </SheetHeader>
        
        <div className="flex-1 overflow-y-auto px-6 py-6">
          {onSubmit ? (
            <form id="drawer-form" onSubmit={onSubmit} className="space-y-6">
              {children}
            </form>
          ) : (
            <div className="space-y-6">{children}</div>
          )}
        </div>
        
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[var(--tf-border)] bg-[var(--tf-surface)]">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
            className="border-[var(--tf-border)] text-[var(--tf-text-secondary)] hover:bg-[var(--tf-surface-2)] hover:text-[var(--tf-text-primary)]"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form={onSubmit ? "drawer-form" : undefined}
            disabled={isSubmitting}
            className="bg-[var(--tf-primary)] text-white hover:bg-[var(--tf-primary-hover)]"
          >
            {isSubmitting ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white"></div>
                Saving...
              </>
            ) : (
              submitLabel
            )}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
