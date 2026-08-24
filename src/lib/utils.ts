import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, formatDistanceToNow } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return "N/A";
  const d = typeof date === "string" ? new Date(date) : date;
  return format(d, "MMM dd, yyyy · hh:mm a");
}

export function formatDateShort(date: string | Date | null | undefined): string {
  if (!date) return "N/A";
  const d = typeof date === "string" ? new Date(date) : date;
  return format(d, "MMM dd, yyyy");
}

export function formatTimeAgo(date: string | Date | null | undefined): string {
  if (!date) return "N/A";
  const d = typeof date === "string" ? new Date(date) : date;
  return formatDistanceToNow(d, { addSuffix: true });
}

export function calculateAgeInDays(date: string | Date): number {
  const created = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - created.getTime());
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
}
