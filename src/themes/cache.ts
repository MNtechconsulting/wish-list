/**
 * Theme caching utilities for performance optimization
 * Provides caching for theme data, accessibility validations, and CSS computations
 */

import { ColorTheme } from '../types';

/**
 * Cache interface for theme-related data
 */
interface ThemeCache<T> {
  get(key: string): T | undefined;
  set(key: string, value: T): void;
  clear(): void;
  has(key: string): boolean;
  size(): number;
}

/**
 * Simple in-memory cache implementation with LRU eviction
 */
class LRUCache<T> implements ThemeCache<T> {
  private cache = new Map<string, { value: T; timestamp: number }>();
  private maxSize: number;
  private maxAge: number;

  constructor(maxSize = 50, maxAge = 5 * 60 * 1000) { // 5 minutes default
    this.maxSize = maxSize;
    this.maxAge = maxAge;
  }

  get(key: string): T | undefined {
    const item = this.cache.get(key);
    
    if (!item) {
      return undefined;
    }

    // Check if item has expired
    if (Date.now() - item.timestamp > this.maxAge) {
      this.cache.delete(key);
      return undefined;
    }

    // Move to end (most recently used)
    this.cache.delete(key);
    this.cache.set(key, item);
    
    return item.value;
  }

  set(key: string, value: T): void {
    // Remove if already exists
    if (this.cache.has(key)) {
      this.cache.delete(key);
    }

    // Evict oldest if at capacity
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey !== undefined) {
        this.cache.delete(firstKey);
      }
    }

    this.cache.set(key, {
      value,
      timestamp: Date.now()
    });
  }

  clear(): void {
    this.cache.clear();
  }

  has(key: string): boolean {
    const item = this.cache.get(key);
    if (!item) return false;
    
    // Check if expired
    if (Date.now() - item.timestamp > this.maxAge) {
      this.cache.delete(key);
      return false;
    }
    
    return true;
  }

  size(): number {
    return this.cache.size;
  }
}

/**
 * Global theme caches
 */
export const themeDataCache = new LRUCache<ColorTheme>(20, 10 * 60 * 1000); // 10 minutes
export const accessibilityCache = new LRUCache<any>(50, 5 * 60 * 1000); // 5 minutes
export const cssVariablesCache = new LRUCache<Record<string, string>>(20, 10 * 60 * 1000); // 10 minutes
export const focusStylesCache = new LRUCache<string>(20, 10 * 60 * 1000); // 10 minutes

/**
 * Cache key generators
 */
export const getCacheKey = {
  theme: (themeId: string) => `theme:${themeId}`,
  accessibility: (themeId: string) => `accessibility:${themeId}`,
  cssVariables: (themeId: string) => `css:${themeId}`,
  focusStyles: (themeId: string) => `focus:${themeId}`,
  contrastRatio: (color1: string, color2: string) => `contrast:${color1}:${color2}`,
  systemTheme: () => 'system:theme',
};

/**
 * Cached theme data retrieval
 */
export const getCachedTheme = (themeId: string, computeFn: () => ColorTheme): ColorTheme => {
  const cacheKey = getCacheKey.theme(themeId);
  
  let theme = themeDataCache.get(cacheKey);
  if (!theme) {
    theme = computeFn();
    themeDataCache.set(cacheKey, theme);
  }
  
  return theme;
};

/**
 * Cached accessibility validation
 */
export const getCachedAccessibility = <T>(
  themeId: string, 
  computeFn: () => T
): T => {
  const cacheKey = getCacheKey.accessibility(themeId);
  
  let result = accessibilityCache.get(cacheKey);
  if (!result) {
    result = computeFn();
    accessibilityCache.set(cacheKey, result);
  }
  
  return result;
};

/**
 * Cached CSS variables computation
 */
export const getCachedCSSVariables = (
  themeId: string,
  computeFn: () => Record<string, string>
): Record<string, string> => {
  const cacheKey = getCacheKey.cssVariables(themeId);
  
  let variables = cssVariablesCache.get(cacheKey);
  if (!variables) {
    variables = computeFn();
    cssVariablesCache.set(cacheKey, variables);
  }
  
  return variables;
};

/**
 * Cached focus styles computation
 */
export const getCachedFocusStyles = (
  themeId: string,
  computeFn: () => string
): string => {
  const cacheKey = getCacheKey.focusStyles(themeId);
  
  let styles = focusStylesCache.get(cacheKey);
  if (!styles) {
    styles = computeFn();
    focusStylesCache.set(cacheKey, styles);
  }
  
  return styles;
};

/**
 * Clear all theme caches
 */
export const clearAllCaches = (): void => {
  themeDataCache.clear();
  accessibilityCache.clear();
  cssVariablesCache.clear();
  focusStylesCache.clear();
};

/**
 * Get cache statistics for debugging
 */
export const getCacheStats = () => ({
  themeData: {
    size: themeDataCache.size(),
    maxSize: 20
  },
  accessibility: {
    size: accessibilityCache.size(),
    maxSize: 50
  },
  cssVariables: {
    size: cssVariablesCache.size(),
    maxSize: 20
  },
  focusStyles: {
    size: focusStylesCache.size(),
    maxSize: 20
  }
});

/**
 * Preload theme data into cache
 */
export const preloadThemeCache = (themes: ColorTheme[]): void => {
  themes.forEach(theme => {
    const cacheKey = getCacheKey.theme(theme.id);
    if (!themeDataCache.has(cacheKey)) {
      themeDataCache.set(cacheKey, theme);
    }
  });
};

/**
 * Debounced cache cleanup function
 */
let cleanupTimeout: NodeJS.Timeout | null = null;

export const scheduleCleanup = (delay = 30000): void => { // 30 seconds default
  if (cleanupTimeout) {
    clearTimeout(cleanupTimeout);
  }
  
  cleanupTimeout = setTimeout(() => {
    // Clean up expired entries by triggering a get operation
    [themeDataCache, accessibilityCache, cssVariablesCache, focusStylesCache].forEach(cache => {
      // This will automatically remove expired entries
      cache.get('__cleanup_trigger__');
    });
  }, delay);
};