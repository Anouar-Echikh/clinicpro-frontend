import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Extract readable API error message
export function getApiErrorMessage(error: any, fallback: string = 'Something went wrong'): string {
  try {
    if (!error) return fallback;
    // axios style
    const data = error.response?.data || error.data || error;
    if (typeof data === 'string') return data;
    if (data?.message) return data.message;
    if (data?.error?.message) return data.error.message;
    // our backend sometimes returns { success, message, required }
    if (data?.required && data?.message) return `${data.message} (${data.required})`;
    return fallback;
  } catch {
    return fallback;
  }
}
