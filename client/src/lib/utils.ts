import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number | string): string {
  const numAmount = typeof amount === "string" ? parseFloat(amount) : amount;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(numAmount);
}

export function formatDate(date: string | Date): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(dateObj);
}

export function formatDateWithTime(date: string | Date): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  }).format(dateObj);
}

export function truncateText(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.substring(0, length) + "...";
}

export function generateOrderNumber(): string {
  const prefix = "ORD";
  const random = Math.floor(7600 + Math.random() * 1000);
  return `#${prefix}-${random}`;
}

export function getPercentChange(current: number, previous: number): number {
  if (previous === 0) return 0;
  return ((current - previous) / previous) * 100;
}

export function calculateROAS(revenue: number, adSpend: number): number {
  if (adSpend === 0) return 0;
  return revenue / adSpend;
}
