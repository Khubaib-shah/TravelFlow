"use client";

import * as React from "react";
import { Control, FieldPath, FieldValues, Controller } from "react-hook-form";
import {
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FilterSelect } from "@/components/shared/FilterSelect";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface BaseFieldProps<T extends FieldValues = FieldValues> {
  control: Control<T, any>;
  name: FieldPath<T>;
  label: string;
  description?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean
}

function FieldLabel({
  label,
  required,
}: {
  label: string;
  required?: boolean;
}) {
  return (
    <FormLabel className="text-sm font-medium text-tf-text-secondary">
      {label}
      {required && <span className="text-[var(--tf-danger)] ml-0.5">*</span>}
    </FormLabel>
  );
}

interface TextFieldProps<
  T extends FieldValues = FieldValues,
> extends BaseFieldProps<T> {
  disabled?: boolean
  type?:
  | "text"
  | "email"
  | "password"
  | "number"
  | "tel"
  | "url"
  | "date"
  | "datetime-local"
  | "color";
}

export function FormField<T extends FieldValues = FieldValues>({
  control,
  name,
  label,
  description,
  placeholder,
  type = "text",
  required,
  disabled,
}: TextFieldProps<T>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <FormItem className="w-full space-y-2">
          <FieldLabel label={label} required={required} />
          <FormControl>
            <Input
              type={type}
              placeholder={placeholder}
              className={`rounded-lg bg-tf-surface focus-visible:ring-2 focus-visible:ring-offset-0 text-tf-text-primary shadow-sm ${fieldState.error
                ? "border-[var(--tf-danger)] focus-visible:ring-[var(--tf-danger)] ring-1 ring-[var(--tf-danger)]"
                : "border-tf-border focus-visible:ring-[var(--tf-primary)]"
                }`}
              disabled={disabled}
              {...field}
              value={field.value ?? ""}
              ref={(e) => {
                field.ref(e);
                // Auto-focus on error if it's the first one in the DOM
                if (fieldState.error && e && document.activeElement?.tagName === "BODY") {
                  e.focus();
                }
              }}
            />
          </FormControl>
          {description && (
            <FormDescription className="text-xs text-tf-text-muted">
              {description}
            </FormDescription>
          )}
          {fieldState.error && (
            <FormMessage className="text-sm font-medium text-[var(--tf-danger)] mt-1.5 flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
              {fieldState.error.message}
            </FormMessage>
          )}
        </FormItem>
      )}
    />
  );
}

export function FormTextArea<T extends FieldValues = FieldValues>({
  control,
  name,
  label,
  description,
  placeholder,
  required,
  disabled,
}: BaseFieldProps<T>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <FormItem className="w-full space-y-2">
          <FieldLabel label={label} required={required} />
          <FormControl>
            <Textarea
              placeholder={placeholder}
              className={`min-h-[100px] rounded-lg resize-y bg-tf-surface focus-visible:ring-2 focus-visible:ring-offset-0 text-tf-text-primary shadow-sm ${fieldState.error
                ? "border-[var(--tf-danger)] focus-visible:ring-[var(--tf-danger)] ring-1 ring-[var(--tf-danger)]"
                : "border-tf-border focus-visible:ring-[var(--tf-primary)]"
                }`}
              disabled={disabled}
              {...field}
              value={field.value ?? ""}
              ref={(e) => {
                field.ref(e);
                if (fieldState.error && e && document.activeElement?.tagName === "BODY") {
                  e.focus();
                }
              }}
            />
          </FormControl>
          {description && (
            <FormDescription className="text-xs text-tf-text-muted">
              {description}
            </FormDescription>
          )}
          {fieldState.error && (
            <FormMessage className="text-sm font-medium text-[var(--tf-danger)] mt-1.5 flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
              {fieldState.error.message}
            </FormMessage>
          )}
        </FormItem>
      )}
    />
  );
}

export interface SelectOption {
  label: string;
  value: string;
}

interface SelectFieldProps<
  T extends FieldValues = FieldValues,
> extends BaseFieldProps<T> {
  options: SelectOption[];
  disabled?: boolean
}

export function FormSelect<T extends FieldValues = FieldValues>({
  control,
  name,
  label,
  description,
  options,
  required,
  disabled,
}: SelectFieldProps<T>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <FormItem className="w-full space-y-2">
          <FieldLabel label={label} required={required} />
          <FormControl>
            <div className={fieldState.error ? "rounded-lg border-[var(--tf-danger)] ring-1 ring-[var(--tf-danger)]" : ""}>
              <FilterSelect
                fullWidth
                value={field.value ?? ""}
                onValueChange={field.onChange}
                options={options}
                placeholder={`Select ${label.toLowerCase()}`}
                triggerClassName={fieldState.error ? "focus:ring-0" : "focus:ring-2 focus:ring-[var(--tf-primary)]"}
                disabled={disabled}
              />
            </div>
          </FormControl>
          {description && (
            <FormDescription className="text-xs text-tf-text-muted">
              {description}
            </FormDescription>
          )}
          {fieldState.error && (
            <FormMessage className="text-sm font-medium text-[var(--tf-danger)] mt-1.5 flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
              {fieldState.error.message}
            </FormMessage>
          )}
        </FormItem>
      )}
    />
  );
}

export function FormCombobox<T extends FieldValues = FieldValues>({
  control,
  name,
  label,
  description,
  options,
  required,
  disabled,
}: SelectFieldProps<T>) {
  const [open, setOpen] = React.useState(false);

  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <FormItem className="w-full flex flex-col mt-2">
          <FieldLabel label={label} required={required} />
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <FormControl>
                <Button
                  variant="outline"
                  role="combobox"
                  disabled={disabled}
                  className={cn(
                    "w-full justify-between font-normal text-tf-text-primary bg-tf-surface hover:bg-tf-surface-hover border-tf-border shadow-sm",
                    !field.value && "text-tf-text-secondary",
                    fieldState.error && "border-[var(--tf-danger)] ring-1 ring-[var(--tf-danger)] focus:ring-0"
                  )}
                >
                  {field.value
                    ? options.find((option) => option.value === field.value)?.label
                    : `Select ${label.toLowerCase()}`}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </FormControl>
            </PopoverTrigger>
            <PopoverContent className="w-[300px] p-0" align="start">
              <Command>
                <CommandInput placeholder={`Search ${label.toLowerCase()}...`} />
                {options.some((o) => o.value === "NEW_CUSTOMER") && (
                  <div className="p-1 border-b border-tf-border">
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-tf-primary hover:text-tf-primary-hover font-medium h-9 px-2"
                      onClick={() => {
                        field.onChange("NEW_CUSTOMER");
                        setOpen(false);
                      }}
                    >
                      + Create New Customer
                    </Button>
                  </div>
                )}
                <CommandList className="max-h-[300px] overflow-y-auto">
                  <CommandEmpty>No {label.toLowerCase()} found.</CommandEmpty>
                  <CommandGroup>
                    {options
                      .filter((o) => o.value !== "NEW_CUSTOMER")
                      .map((option) => (
                      <CommandItem
                        value={option.label}
                        key={option.value}
                        onSelect={() => {
                          field.onChange(option.value);
                          setOpen(false);
                        }}
                        className="cursor-pointer"
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            option.value === field.value ? "opacity-100" : "opacity-0"
                          )}
                        />
                        <span className="truncate">
                          {option.label}
                        </span>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
          {description && (
            <FormDescription className="text-xs text-tf-text-muted">
              {description}
            </FormDescription>
          )}
          {fieldState.error && (
            <FormMessage className="text-sm font-medium text-[var(--tf-danger)] mt-1.5 flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
              {fieldState.error.message}
            </FormMessage>
          )}
        </FormItem>
      )}
    />
  );
}
