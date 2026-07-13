"use client";

import { Table } from "@tanstack/react-table";
import { Search, Download } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FilterSelect } from "@/components/shared/FilterSelect";
import { DataTableViewOptions } from "./DataTableViewOptions";
import { toast } from "sonner";

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
  searchKey?: string;
  searchPlaceholder?: string;
  filters?: {
    column: string;
    title: string;
    options: { label: string; value: string }[];
  }[];
  enableExport?: boolean;
}

export function DataTableToolbar<TData>({
  table,
  searchKey,
  searchPlaceholder,
  filters,
  enableExport,
}: DataTableToolbarProps<TData>) {
  const handleExport = () => {
    try {
      const rows = table.getFilteredRowModel().rows;
      if (rows.length === 0) {
        toast.info("No data to export");
        return;
      }

      const headers = table
        .getAllColumns()
        .filter((c) => c.getIsVisible() && c.id !== "actions")
        .map((c) => c.id);

      const csvData = rows.map((row) => {
        return headers
          .map((header) => {
            const val = row.getValue(header);
            return typeof val === "string"
              ? `"${val.replace(/"/g, '""')}"`
              : val;
          })
          .join(",");
      });

      const csvString = [headers.join(","), ...csvData].join("\n");
      const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `export_${new Date().getTime()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("Export successful");
    } catch (e) {
      toast.error("Failed to export data");
    }
  };

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center space-x-2">
        <div className="relative w-[250px] lg:w-[350px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-tf-text-muted" />
          <Input
            placeholder={searchPlaceholder || "Search..."}
            value={(table.getState().globalFilter as string) ?? ""}
            onChange={(event) => table.setGlobalFilter(event.target.value)}
            className="pl-9 h-9 bg-tf-surface border-tf-border focus-visible:ring-[var(--tf-primary)]"
          />
        </div>
        {filters?.map((filter) => {
          const column = table.getColumn(filter.column);
          if (!column) return null;
          return (
            <FilterSelect
              key={filter.column}
              value={(column.getFilterValue() as string) ?? ""}
              onValueChange={(v) => column.setFilterValue(v || undefined)}
              options={filter.options}
              placeholder={filter.title}
              allowAll
              allLabel={`${filter.title} (All)`}
            />
          );
        })}
      </div>

      <div className="flex items-center space-x-2">
        <DataTableViewOptions table={table} />
        {enableExport && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            className="h-9 border-tf-border text-tf-text-secondary"
          >
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        )}
      </div>
    </div>
  );
}
