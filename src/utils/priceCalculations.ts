/**
 * Price calculation utilities for wishlist items
 * Includes trend calculation logic and price fluctuation algorithms
 */

import { PricePoint, WishlistItem } from '../types';

/**
 * Calculate the trend direction based on price history
 * @param priceHistory - Array of price points
 * @returns 'up' | 'down' | 'flat'
 */
export function calculateTrend(priceHistory: PricePoint[]): 'up' | 'down' | 'flat' {
  if (priceHistory.length < 2) {
    return 'flat';
  }

  // Get the most recent price and compare with the oldest price
  const recentPrice = priceHistory[priceHistory.length - 1].price;
  const oldestPrice = priceHistory[0].price;

  // Calculate percentage change
  const percentageChange = ((recentPrice - oldestPrice) / oldestPrice) * 100;

  // Use a threshold to determine if the change is significant
  const threshold = 2; // 2% threshold

  if (percentageChange > threshold) {
    return 'up';
  } else if (percentageChange < -threshold) {
    return 'down';
  } else {
    return 'flat';
  }
}

/**
 * Calculate days tracked since the item was added
 * @param dateAdded - Date when the item was added
 * @returns Number of days tracked
 */
export function calculateDaysTracked(dateAdded: Date): number {
  const now = new Date();
  const added = new Date(dateAdded);
  const diffTime = Math.abs(now.getTime() - added.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

/**
 * Generate realistic price fluctuations for a given base price
 * @param basePrice - Starting price
 * @param days - Number of days to generate prices for
 * @param volatility - Price volatility factor (0-1, default 0.1 for 10% max change)
 * @returns Array of price points
 */
export function generatePriceHistory(
  basePrice: number,
  days: number,
  volatility: number = 0.1
): PricePoint[] {
  const priceHistory: PricePoint[] = [];
  let currentPrice = basePrice;
  const now = new Date();

  for (let i = 0; i < days; i++) {
    // Calculate date for this price point (going backwards from today)
    const date = new Date(now);
    date.setDate(date.getDate() - (days - i - 1));

    // Generate random price change within volatility range
    const changePercent = (Math.random() - 0.5) * 2 * volatility;
    const priceChange = currentPrice * changePercent;
    currentPrice = Math.max(0.01, currentPrice + priceChange); // Ensure price stays positive

    priceHistory.push({
      date,
      price: Math.round(currentPrice * 100) / 100, // Round to 2 decimal places
    });
  }

  return priceHistory;
}

/**
 * Update wishlist item with current price and trend
 * @param item - Wishlist item to update
 * @returns Updated wishlist item
 */
export function updateItemPriceData(item: WishlistItem): WishlistItem {
  const currentPrice = item.priceHistory.length > 0
    ? item.priceHistory[item.priceHistory.length - 1].price
    : item.currentPrice;

  const trend = calculateTrend(item.priceHistory);
  const daysTracked = calculateDaysTracked(item.dateAdded);

  return {
    ...item,
    currentPrice,
    trend,
    daysTracked,
  };
}

/**
 * Get trend color for UI display
 * @param trend - Price trend direction
 * @returns Tailwind color class
 */
export function getTrendColor(trend: 'up' | 'down' | 'flat'): string {
  switch (trend) {
    case 'up':
      return 'text-red-500'; // Price going up is bad for buyer
    case 'down':
      return 'text-green-500'; // Price going down is good for buyer
    case 'flat':
      return 'text-gray-500';
  }
}

/**
 * Get trend icon for UI display
 * @param trend - Price trend direction
 * @returns Icon symbol
 */
export function getTrendIcon(trend: 'up' | 'down' | 'flat'): string {
  switch (trend) {
    case 'up':
      return '↑';
    case 'down':
      return '↓';
    case 'flat':
      return '→';
  }
}

/**
 * Format price for display
 * @param price - Price value
 * @param currency - Currency symbol (default '$')
 * @returns Formatted price string
 */
export function formatPrice(price: number, currency: string = '$'): string {
  return `${currency}${price.toFixed(2)}`;
}

/**
 * Calculate price change percentage
 * @param originalPrice - Original price
 * @param currentPrice - Current price
 * @returns Percentage change (positive or negative)
 */
export function calculatePriceChangePercent(
  originalPrice: number,
  currentPrice: number
): number {
  if (originalPrice === 0) return 0;
  return ((currentPrice - originalPrice) / originalPrice) * 100;
}

/**
 * Format price change for display
 * @param originalPrice - Original price
 * @param currentPrice - Current price
 * @returns Formatted string like "+5.2%" or "-3.1%"
 */
export function formatPriceChange(
  originalPrice: number,
  currentPrice: number
): string {
  const percent = calculatePriceChangePercent(originalPrice, currentPrice);
  const sign = percent >= 0 ? '+' : '';
  return `${sign}${percent.toFixed(1)}%`;
}