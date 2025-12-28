/**
 * Utilities module exports
 * Centralized exports for all utility functions
 */

export {
  calculateTrend,
  calculateDaysTracked,
  generatePriceHistory,
  updateItemPriceData,
  getTrendColor,
  getTrendIcon,
  formatPrice,
  calculatePriceChangePercent,
  formatPriceChange,
} from './priceCalculations';

export {
  generateItemId,
  createWishlistItem,
  validateWishlistItem,
  areItemsEqual,
  sanitizeItemName,
  formatItemForStorage,
  parseItemFromStorage,
} from './itemUtils';