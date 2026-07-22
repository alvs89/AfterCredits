import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatMediaType(type: string): string {
  if (type === 'tv_series') return 'TV Series';
  if (type === 'k_drama') return 'K-Drama';
  return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

export function formatWatchStatus(status: string): string {
  return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}
