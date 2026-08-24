import React, { InputHTMLAttributes, TextareaHTMLAttributes, SelectHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

interface BaseFieldProps {
  label?: string;
  error?: string;
  helperText?: string;
  containerClassName?: string;
}

export interface InputProps extends InputHTMLAttributes<HTMLInputElement>, BaseFieldProps {}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, helperText, containerClassName, id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className={cn("w-full space-y-1.5", containerClassName)}>
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300"
          >
            {label}
          </label>
        )}
        <input
          id={inputId}
          ref={ref}
          className={cn(
            "w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900/90 px-3.5 py-2 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 shadow-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-50",
            error && "border-rose-500 focus:border-rose-500 focus:ring-rose-500/20",
            className
          )}
          {...props}
        />
        {error && <p className="text-xs text-rose-500 font-medium">{error}</p>}
        {helperText && !error && <p className="text-xs text-slate-500 dark:text-slate-400">{helperText}</p>}
      </div>
    );
  }
);
Input.displayName = "Input";

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement>, BaseFieldProps {}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, helperText, containerClassName, id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className={cn("w-full space-y-1.5", containerClassName)}>
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300"
          >
            {label}
          </label>
        )}
        <textarea
          id={inputId}
          ref={ref}
          className={cn(
            "w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900/90 px-3.5 py-2 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 shadow-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-50 min-h-[100px]",
            error && "border-rose-500 focus:border-rose-500 focus:ring-rose-500/20",
            className
          )}
          {...props}
        />
        {error && <p className="text-xs text-rose-500 font-medium">{error}</p>}
        {helperText && !error && <p className="text-xs text-slate-500 dark:text-slate-400">{helperText}</p>}
      </div>
    );
  }
);
Textarea.displayName = "Textarea";

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement>, BaseFieldProps {
  options?: { value: string; label: string }[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, helperText, containerClassName, options, children, id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className={cn("w-full space-y-1.5", containerClassName)}>
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300"
          >
            {label}
          </label>
        )}
        <select
          id={inputId}
          ref={ref}
          className={cn(
            "w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 py-2 text-sm text-slate-900 dark:text-white shadow-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-50",
            error && "border-rose-500 focus:border-rose-500 focus:ring-rose-500/20",
            className
          )}
          {...props}
        >
          {options
            ? options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))
            : children}
        </select>
        {error && <p className="text-xs text-rose-500 font-medium">{error}</p>}
        {helperText && !error && <p className="text-xs text-slate-500 dark:text-slate-400">{helperText}</p>}
      </div>
    );
  }
);
Select.displayName = "Select";
