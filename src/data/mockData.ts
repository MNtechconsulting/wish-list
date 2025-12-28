/**
 * Mock data generators for development and testing
 * Creates sample wishlist items with realistic price histories
 */

import { WishlistItem, PricePoint } from '../types';
import { generatePriceHistory, calculateTrend, calculateDaysTracked } from '../utils/priceCalculations';

/**
 * Sample product names for generating mock data
 */
const SAMPLE_PRODUCTS = [
  'iPhone 15 Pro',
  'MacBook Air M2',
  'Sony WH-1000XM5 Headphones',
  'Nintendo Switch OLED',
  'iPad Pro 12.9"',
  'AirPods Pro 2nd Gen',
  'Samsung Galaxy S24 Ultra',
  'Dell XPS 13 Laptop',
  'Apple Watch Series 9',
  'Bose QuietComfort Earbuds',
  'Microsoft Surface Pro 9',
  'Canon EOS R6 Mark II',
  'Tesla Model 3',
  'DJI Mini 3 Pro Drone',
  'Dyson V15 Detect Vacuum',
  'KitchenAid Stand Mixer',
  'Instant Pot Duo 7-in-1',
  'Fitbit Charge 5',
  'Roku Ultra 4K Streaming',
  'Sonos One Smart Speaker'
];

/**
 * Sample product URLs for mock data
 */
const SAMPLE_URLS = [
  'https://www.apple.com/iphone-15-pro/',
  'https://www.apple.com/macbook-air/',
  'https://www.sony.com/headphones/wh-1000xm5',
  'https://www.nintendo.com/switch/',
  'https://www.apple.com/ipad-pro/',
  'https://www.apple.com/airpods-pro/',
  'https://www.samsung.com/galaxy-s24-ultra/',
  'https://www.dell.com/xps-13',
  'https://www.apple.com/apple-watch-series-9/',
  'https://www.bose.com/quietcomfort-earbuds'
];

/**
 * Generate a random price within a realistic range
 * @param min - Minimum price
 * @param max - Maximum price
 * @returns Random price rounded to 2 decimal places
 */
function generateRandomPrice(min: number = 10, max: number = 2000): number {
  const price = Math.random() * (max - min) + min;
  return Math.round(price * 100) / 100;
}

/**
 * Generate a random date within the last N days
 * @param maxDaysAgo - Maximum days in the past
 * @returns Random date
 */
function generateRandomDate(maxDaysAgo: number = 90): Date {
  const now = new Date();
  const daysAgo = Math.floor(Math.random() * maxDaysAgo);
  const date = new Date(now);
  date.setDate(date.getDate() - daysAgo);
  return date;
}

/**
 * Generate a unique ID for wishlist items
 * @returns Unique string ID
 */
function generateId(): string {
  return `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Generate a single mock wishlist item
 * @param overrides - Optional properties to override defaults
 * @returns Mock wishlist item
 */
export function generateMockWishlistItem(
  overrides: Partial<WishlistItem> = {}
): WishlistItem {
  const name = SAMPLE_PRODUCTS[Math.floor(Math.random() * SAMPLE_PRODUCTS.length)];
  const originalPrice = generateRandomPrice(50, 1500);
  const dateAdded = generateRandomDate(60); // Up to 60 days ago
  const daysTracked = calculateDaysTracked(dateAdded);
  
  // Generate price history for the number of days tracked
  const priceHistory = generatePriceHistory(
    originalPrice,
    Math.min(daysTracked, 30), // Limit to 30 days of history
    0.15 // 15% volatility
  );
  
  const currentPrice = priceHistory.length > 0
    ? priceHistory[priceHistory.length - 1].price
    : originalPrice;
  
  const trend = calculateTrend(priceHistory);
  
  const productUrl = SAMPLE_URLS[Math.floor(Math.random() * SAMPLE_URLS.length)];

  const baseItem: WishlistItem = {
    id: generateId(),
    name,
    currentPrice,
    originalPrice,
    priceHistory,
    trend,
    dateAdded,
    daysTracked,
    productUrl,
    imageUrl: `https://picsum.photos/300/200?random=${Math.floor(Math.random() * 1000)}`,
    collectionId: 'default-collection', // Default collection for mock data
  };

  return { ...baseItem, ...overrides };
}

/**
 * Generate multiple mock wishlist items
 * @param count - Number of items to generate
 * @returns Array of mock wishlist items
 */
export function generateMockWishlistItems(count: number = 5): WishlistItem[] {
  return Array.from({ length: count }, () => generateMockWishlistItem());
}

/**
 * Generate mock wishlist items with specific trends
 * @param upCount - Number of items with upward trend
 * @param downCount - Number of items with downward trend
 * @param flatCount - Number of items with flat trend
 * @returns Array of mock wishlist items with specified trends
 */
export function generateMockItemsWithTrends(
  upCount: number = 2,
  downCount: number = 2,
  flatCount: number = 1
): WishlistItem[] {
  const items: WishlistItem[] = [];

  // Generate items with upward trend (price increasing)
  for (let i = 0; i < upCount; i++) {
    const originalPrice = generateRandomPrice(100, 800);
    const dateAdded = generateRandomDate(30);
    const daysTracked = calculateDaysTracked(dateAdded);
    
    // Create price history with upward trend
    const priceHistory: PricePoint[] = [];
    let currentPrice = originalPrice;
    const now = new Date();
    
    for (let day = 0; day < Math.min(daysTracked, 20); day++) {
      const date = new Date(now);
      date.setDate(date.getDate() - (Math.min(daysTracked, 20) - day - 1));
      
      // Gradually increase price
      currentPrice += (Math.random() * 0.05 + 0.02) * originalPrice; // 2-7% increase per period
      
      priceHistory.push({
        date,
        price: Math.round(currentPrice * 100) / 100,
      });
    }

    items.push(generateMockWishlistItem({
      originalPrice,
      currentPrice,
      priceHistory,
      trend: 'up',
      dateAdded,
      daysTracked,
    }));
  }

  // Generate items with downward trend (price decreasing)
  for (let i = 0; i < downCount; i++) {
    const originalPrice = generateRandomPrice(100, 800);
    const dateAdded = generateRandomDate(30);
    const daysTracked = calculateDaysTracked(dateAdded);
    
    // Create price history with downward trend
    const priceHistory: PricePoint[] = [];
    let currentPrice = originalPrice;
    const now = new Date();
    
    for (let day = 0; day < Math.min(daysTracked, 20); day++) {
      const date = new Date(now);
      date.setDate(date.getDate() - (Math.min(daysTracked, 20) - day - 1));
      
      // Gradually decrease price
      currentPrice -= (Math.random() * 0.05 + 0.02) * originalPrice; // 2-7% decrease per period
      currentPrice = Math.max(currentPrice, originalPrice * 0.5); // Don't go below 50% of original
      
      priceHistory.push({
        date,
        price: Math.round(currentPrice * 100) / 100,
      });
    }

    items.push(generateMockWishlistItem({
      originalPrice,
      currentPrice,
      priceHistory,
      trend: 'down',
      dateAdded,
      daysTracked,
    }));
  }

  // Generate items with flat trend (stable price)
  for (let i = 0; i < flatCount; i++) {
    const originalPrice = generateRandomPrice(100, 800);
    const dateAdded = generateRandomDate(30);
    const daysTracked = calculateDaysTracked(dateAdded);
    
    // Create price history with minimal variation
    const priceHistory: PricePoint[] = [];
    let currentPrice = originalPrice;
    const now = new Date();
    
    for (let day = 0; day < Math.min(daysTracked, 20); day++) {
      const date = new Date(now);
      date.setDate(date.getDate() - (Math.min(daysTracked, 20) - day - 1));
      
      // Very small random variations (±1%)
      const variation = (Math.random() - 0.5) * 0.02 * originalPrice;
      currentPrice = originalPrice + variation;
      
      priceHistory.push({
        date,
        price: Math.round(currentPrice * 100) / 100,
      });
    }

    items.push(generateMockWishlistItem({
      originalPrice,
      currentPrice,
      priceHistory,
      trend: 'flat',
      dateAdded,
      daysTracked,
    }));
  }

  return items;
}

/**
 * Get default sample wishlist items for initial app state
 * @returns Array of sample wishlist items
 */
export function getDefaultWishlistItems(): WishlistItem[] {
  return generateMockItemsWithTrends(2, 2, 1);
}

/**
 * Generate mock price point for testing
 * @param overrides - Optional properties to override
 * @returns Mock price point
 */
export function generateMockPricePoint(
  overrides: Partial<PricePoint> = {}
): PricePoint {
  return {
    date: generateRandomDate(30),
    price: generateRandomPrice(10, 1000),
    ...overrides,
  };
}

/**
 * Generate array of mock price points
 * @param count - Number of price points to generate
 * @param basePrice - Starting price for the series
 * @param days - Number of days to span
 * @returns Array of mock price points
 */
export function generateMockPricePoints(
  count: number = 10,
  basePrice: number = 100,
  _days: number = 30
): PricePoint[] {
  return generatePriceHistory(basePrice, count, 0.1);
}