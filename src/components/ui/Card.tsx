import React, { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  glass?: boolean;
  hoverable?: boolean;
}

export function Card({
  className,
  glass = false,
  hoverable = false,
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border transition-all duration-200",
        glass
          ? "glass-panel"
          : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800/80 shadow-card",
        hoverable && "hover:shadow-cardHover hover:border-slate-300 dark:hover:border-slate-700 transition-all",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("px-6 py-5 border-b border-slate-100 dark:border-slate-800", className)} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3 className={cn("text-lg font-bold tracking-tight text-slate-900 dark:text-white", className)} {...props}>
      {children}
    </h3>
  );
}

export function CardDescription({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={cn("text-sm text-slate-500 dark:text-slate-400 mt-1", className)} {...props}>
      {children}
    </p>
  );
}

export function CardContent({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("p-6", className)} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 rounded-b-xl flex items-center justify-between", className)} {...props}>
      {children}
    </div>
  );
}
