/**
 * Utility functions for wishlist item management
 * Handles item creation, ID generation, and data transformations
 */

import { WishlistItem, PricePoint } from '../types';

/**
 * Generate a unique ID for wishlist items
 * @returns Unique string ID
 */
export function generateItemId(): string {
  return `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Create a new wishlist item with default values
 * @param itemData - Partial item data from form
 * @returns Complete WishlistItem with generated fields
 */
export function createWishlistItem(
  itemData: Omit<WishlistItem, 'id' | 'priceHistory' | 'trend' | 'dateAdded' | 'daysTracked'>
): WishlistItem {
  const now = new Date();
  
  // Create initial price history entry
  const initialPricePoint: PricePoint = {
    date: now,
    price: itemData.currentPrice
  };

  return {
    id: generateItemId(),
    name: itemData.name,
    currentPrice: itemData.currentPrice,
    originalPrice: itemData.originalPrice,
    priceHistory: [initialPricePoint],
    trend: 'flat', // New items start with flat trend
    dateAdded: now,
    daysTracked: 0, // New items have 0 days tracked
    productUrl: itemData.productUrl,
    imageUrl: itemData.imageUrl,
    collectionId: itemData.collectionId
  };
}

/**
 * Validate wishlist item data
 * @param itemData - Item data to validate
 * @returns Array of validation error messages
 */
export function validateWishlistItem(
  itemData: Partial<WishlistItem>
): string[] {
  const errors: string[] = [];

  // Validate name
  if (!itemData.name || typeof itemData.name !== 'string') {
    errors.push('Product name is required');
  } else if (itemData.name.trim().length < 2) {
    errors.push('Product name must be at least 2 characters');
  } else if (itemData.name.trim().length > 100) {
    errors.push('Product name must be less than 100 characters');
  }

  // Validate current price
  if (itemData.currentPrice === undefined || itemData.currentPrice === null) {
    errors.push('Current price is required');
  } else if (typeof itemData.currentPrice !== 'number' || isNaN(itemData.currentPrice)) {
    errors.push('Current price must be a valid number');
  } else if (itemData.currentPrice <= 0) {
    errors.push('Current price must be greater than 0');
  } else if (itemData.currentPrice > 999999) {
    errors.push('Current price must be less than $999,999');
  }

  // Validate original price
  if (itemData.originalPrice === undefined || itemData.originalPrice === null) {
    errors.push('Original price is required');
  } else if (typeof itemData.originalPrice !== 'number' || isNaN(itemData.originalPrice)) {
    errors.push('Original price must be a valid number');
  } else if (itemData.originalPrice <= 0) {
    errors.push('Original price must be greater than 0');
  } else if (itemData.originalPrice > 999999) {
    errors.push('Original price must be less than $999,999');
  }

  return errors;
}

/**
 * Check if two wishlist items are equal (for testing purposes)
 * @param item1 - First item
 * @param item2 - Second item
 * @returns True if items are equal
 */
export function areItemsEqual(item1: WishlistItem, item2: WishlistItem): boolean {
  return (
    item1.id === item2.id &&
    item1.name === item2.name &&
    item1.currentPrice === item2.currentPrice &&
    item1.originalPrice === item2.originalPrice &&
    item1.trend === item2.trend &&
    item1.dateAdded.getTime() === item2.dateAdded.getTime() &&
    item1.daysTracked === item2.daysTracked &&
    item1.productUrl === item2.productUrl &&
    item1.imageUrl === item2.imageUrl &&
    item1.collectionId === item2.collectionId &&
    item1.priceHistory.length === item2.priceHistory.length
  );
}

/**
 * Sanitize item name for safe storage and display
 * @param name - Raw item name
 * @returns Sanitized item name
 */
export function sanitizeItemName(name: string): string {
  return name.trim().replace(/\s+/g, ' ');
}

/**
 * Format item for storage (convert dates to ISO strings)
 * @param item - WishlistItem to format
 * @returns Item formatted for JSON storage
 */
export function formatItemForStorage(item: WishlistItem): any {
  return {
    ...item,
    dateAdded: item.dateAdded.toISOString(),
    priceHistory: item.priceHistory.map(point => ({
      ...point,
      date: point.date.toISOString()
    }))
  };
}

/**
 * Parse item from storage (convert ISO strings back to dates)
 * @param storedItem - Item data from storage
 * @returns WishlistItem with proper Date objects
 */
export function parseItemFromStorage(storedItem: any): WishlistItem {
  return {
    ...storedItem,
    dateAdded: new Date(storedItem.dateAdded),
    priceHistory: storedItem.priceHistory.map((point: any) => ({
      ...point,
      date: new Date(point.date)
    }))
  };
}