import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merges multiple class names using clsx and tailwind-merge
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats a number as currency (USD)
 * @param value - The number to format
 * @param options - Formatting options
 * @returns Formatted currency string
 */
export function formatCurrency(
  value: number,
  options: {
    currency?: string;
    minimumFractionDigits?: number;
    maximumFractionDigits?: number;
  } = {}
): string {
  const {
    currency = 'USD',
    minimumFractionDigits = 2,
    maximumFractionDigits = 2
  } = options;

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits,
    maximumFractionDigits
  }).format(value);
}

/**
 * Formats a number as a percentage
 * @param value - The percentage value (e.g., 10.5 for 10.5%)
 * @param options - Formatting options
 * @returns Formatted percentage string
 */
export function formatPercentage(
  value: number,
  options: {
    minimumFractionDigits?: number;
    maximumFractionDigits?: number;
    includeSign?: boolean;
  } = {}
): string {
  const {
    minimumFractionDigits = 2,
    maximumFractionDigits = 2,
    includeSign = false
  } = options;

  // Format the number as a percentage
  const formatted = new Intl.NumberFormat('en-US', {
    style: 'percent',
    minimumFractionDigits,
    maximumFractionDigits,
    signDisplay: includeSign ? 'always' : 'auto'
  }).format(value / 100);

  return formatted;
}

/**
 * Formats a date relative to current time (e.g., "2 days ago", "3 hours ago")
 * Simplified version - for more complex usage, consider using date-fns directly
 * @param date - The date to format
 * @returns Formatted relative time string
 */
export function formatRelativeTime(date: Date | string | number): string {
  const now = new Date();
  const targetDate = new Date(date);
  const diffInMs = now.getTime() - targetDate.getTime();
  
  // Convert to seconds, minutes, hours, days
  const diffInSecs = diffInMs / 1000;
  const diffInMins = diffInSecs / 60;
  const diffInHours = diffInMins / 60;
  const diffInDays = diffInHours / 24;
  
  if (diffInSecs < 60) {
    return `${Math.floor(diffInSecs)}s ago`;
  } else if (diffInMins < 60) {
    return `${Math.floor(diffInMins)}m ago`;
  } else if (diffInHours < 24) {
    return `${Math.floor(diffInHours)}h ago`;
  } else if (diffInDays < 30) {
    return `${Math.floor(diffInDays)}d ago`;
  } else {
    // For older dates, just return the formatted date
    return targetDate.toLocaleDateString();
  }
}

/**
 * Truncates text with ellipsis if it exceeds the maximum length
 * @param text - The text to truncate
 * @param maxLength - Maximum length before truncation
 * @returns Truncated text
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}...`;
}

/**
 * Generates a color based on a percentage value (red to green)
 * @param percentage - The percentage value (0-100)
 * @returns CSS color string
 */
export function getColorByPercentage(percentage: number): string {
  if (percentage > 0) return 'text-secondary';
  if (percentage < 0) return 'text-danger';
  return 'text-gray-400';
}

/**
 * Calculates grid step size based on price range and grid count
 * @param upperLimit - Upper price limit
 * @param lowerLimit - Lower price limit
 * @param gridCount - Number of grid lines
 * @returns Grid step size
 */
export function calculateGridStepSize(
  upperLimit: number,
  lowerLimit: number,
  gridCount: number
): number {
  return (upperLimit - lowerLimit) / gridCount;
}

/**
 * Calculates potential profit based on grid parameters
 * @param investment - Investment amount
 * @param profitPerGrid - Profit percentage per grid (as decimal, e.g., 0.005 for 0.5%)
 * @param gridCount - Number of grid lines
 * @param activationRate - Estimated percentage of grids that will be activated (0-1)
 * @returns Potential profit amount
 */
export function calculatePotentialProfit(
  investment: number,
  profitPerGrid: number,
  gridCount: number,
  activationRate: number = 0.5
): number {
  return investment * profitPerGrid * gridCount * activationRate;
}
