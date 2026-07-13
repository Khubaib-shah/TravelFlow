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

interface BaseFieldProps<T extends FieldValues = FieldValues> {
  control: Control<T, any>;
  name: FieldPath<T>;
  label: string;
  description?: string;
  placeholder?: string;
  required?: boolean;
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
              className="rounded-lg bg-tf-surface border-tf-border focus-visible:ring-2 focus-visible:ring-[var(--tf-primary)] focus-visible:ring-offset-0 text-tf-text-primary shadow-sm"
              {...field}
              value={field.value ?? ""}
            />
          </FormControl>
          {description && (
            <FormDescription className="text-xs text-tf-text-muted">
              {description}
            </FormDescription>
          )}
          {fieldState.error && (
            <FormMessage className="text-xs text-[var(--tf-danger)]">
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
              className="min-h-[100px] rounded-lg resize-y bg-tf-surface border-tf-border focus-visible:ring-2 focus-visible:ring-[var(--tf-primary)] focus-visible:ring-offset-0 text-tf-text-primary shadow-sm"
              {...field}
              value={field.value ?? ""}
            />
          </FormControl>
          {description && (
            <FormDescription className="text-xs text-tf-text-muted">
              {description}
            </FormDescription>
          )}
          {fieldState.error && (
            <FormMessage className="text-xs text-[var(--tf-danger)]">
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
}

export function FormSelect<T extends FieldValues = FieldValues>({
  control,
  name,
  label,
  description,
  options,
  required,
}: SelectFieldProps<T>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <FormItem className="w-full space-y-2">
          <FieldLabel label={label} required={required} />
          <FormControl>
            <FilterSelect
              fullWidth
              value={field.value ?? ""}
              onValueChange={field.onChange}
              options={options}
              placeholder={`Select ${label.toLowerCase()}`}
              triggerClassName="focus:ring-2 focus:ring-[var(--tf-primary)]"
            />
          </FormControl>
          {description && (
            <FormDescription className="text-xs text-tf-text-muted">
              {description}
            </FormDescription>
          )}
          {fieldState.error && (
            <FormMessage className="text-xs text-[var(--tf-danger)]">
              {fieldState.error.message}
            </FormMessage>
          )}
        </FormItem>
      )}
    />
  );
}
