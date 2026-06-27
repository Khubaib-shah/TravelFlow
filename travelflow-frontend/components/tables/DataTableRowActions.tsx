"use client";

import { Row } from "@tanstack/react-table";
import { MoreHorizontal, Edit, Trash, Eye } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface DataTableRowActionsProps<TData> {
  row: Row<TData>;
  onView?: (row: Row<TData>) => void;
  onEdit?: (row: Row<TData>) => void;
  onDelete?: (row: Row<TData>) => void;
}

export function DataTableRowActions<TData>({
  row,
  onView,
  onEdit,
  onDelete,
}: DataTableRowActionsProps<TData>) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="flex h-8 w-8 p-0 data-[state=open]:bg-[var(--tf-surface-2)] text-[var(--tf-text-secondary)] hover:text-[var(--tf-text-primary)] hover:bg-[var(--tf-surface-2)]"
        >
          <MoreHorizontal className="h-4 w-4" />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[160px] bg-[var(--tf-surface)] border-[var(--tf-border)] shadow-md">
        {onView && (
          <DropdownMenuItem onClick={() => onView(row)} className="text-[var(--tf-text-secondary)] focus:bg-[var(--tf-surface-2)] cursor-pointer">
            <Eye className="mr-2 h-4 w-4" />
            View
          </DropdownMenuItem>
        )}
        {onEdit && (
          <DropdownMenuItem onClick={() => onEdit(row)} className="text-[var(--tf-text-secondary)] focus:bg-[var(--tf-surface-2)] cursor-pointer">
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </DropdownMenuItem>
        )}
        {onDelete && (
          <>
            <DropdownMenuSeparator className="bg-[var(--tf-border)]" />
            <DropdownMenuItem
              onClick={() => onDelete(row)}
              className="text-[var(--tf-danger)] focus:bg-[var(--tf-danger-soft)] focus:text-[var(--tf-danger)] cursor-pointer font-medium"
            >
              <Trash className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
