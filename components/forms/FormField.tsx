"use client";

import * as React from "react";
import { 
  Control, 
  FieldPath, 
  FieldValues,
  Controller,
} from "react-hook-form";
import { FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface BaseFieldProps<T extends FieldValues = FieldValues> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  control: Control<T, any>;
  name: FieldPath<T>;
  label: string;
  description?: string;
  placeholder?: string;
}

interface TextFieldProps<T extends FieldValues = FieldValues> extends BaseFieldProps<T> {
  type?: "text" | "email" | "password" | "number" | "tel" | "url";
}

export function FormField<T extends FieldValues = FieldValues>({
  control,
  name,
  label,
  description,
  placeholder,
  type = "text",
}: TextFieldProps<T>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <FormItem>
          <FormLabel className="text-sm font-medium text-[var(--tf-text-secondary)]">
            {label}
          </FormLabel>
          <FormControl>
            <Input
              type={type}
              placeholder={placeholder}
              className="rounded-lg bg-[var(--tf-surface)] border-[var(--tf-border)] focus-visible:ring-2 focus-visible:ring-[var(--tf-primary)] focus-visible:ring-offset-0 text-[var(--tf-text-primary)] shadow-sm"
              {...field}
              value={field.value ?? ""}
            />
          </FormControl>
          {description && (
            <FormDescription className="text-xs text-[var(--tf-text-muted)]">
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
}: BaseFieldProps<T>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <FormItem>
          <FormLabel className="text-sm font-medium text-[var(--tf-text-secondary)]">
            {label}
          </FormLabel>
          <FormControl>
            <Textarea
              placeholder={placeholder}
              className="min-h-[100px] rounded-lg resize-y bg-[var(--tf-surface)] border-[var(--tf-border)] focus-visible:ring-2 focus-visible:ring-[var(--tf-primary)] focus-visible:ring-offset-0 text-[var(--tf-text-primary)] shadow-sm"
              {...field}
              value={field.value ?? ""}
            />
          </FormControl>
          {description && (
            <FormDescription className="text-xs text-[var(--tf-text-muted)]">
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

interface SelectFieldProps<T extends FieldValues = FieldValues> extends BaseFieldProps<T> {
  options: SelectOption[];
}

export function FormSelect<T extends FieldValues = FieldValues>({
  control,
  name,
  label,
  description,
  options,
}: SelectFieldProps<T>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <FormItem>
          <FormLabel className="text-sm font-medium text-[var(--tf-text-secondary)]">
            {label}
          </FormLabel>
          <FormControl>
            <select
              className="flex h-10 w-full rounded-lg border border-[var(--tf-border)] bg-[var(--tf-surface)] px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tf-primary)] focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50 text-[var(--tf-text-primary)] shadow-sm"
              {...field}
            >
              {options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </FormControl>
          {description && (
            <FormDescription className="text-xs text-[var(--tf-text-muted)]">
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
