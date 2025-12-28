/**
 * Theme cache utility tests
 * Validates caching functionality for performance optimization
 */

import {
  themeDataCache,
  accessibilityCache,
  cssVariablesCache,
  focusStylesCache,
  getCacheKey,
  getCachedTheme,
  getCachedAccessibility,
  getCachedCSSVariables,
  getCachedFocusStyles,
  clearAllCaches,
  getCacheStats,
  preloadThemeCache
} from '../cache';
import { getDefaultTheme, themes } from '../themes';

describe('Theme Cache Utilities', () => {
  beforeEach(() => {
    clearAllCaches();
  });

  describe('LRU Cache', () => {
    it('should store and retrieve values', () => {
      const key = 'test-key';
      const value = getDefaultTheme();
      
      themeDataCache.set(key, value);
      expect(themeDataCache.get(key)).toBe(value);
      expect(themeDataCache.has(key)).toBe(true);
    });

    it('should return undefined for non-existent keys', () => {
      expect(themeDataCache.get('non-existent')).toBeUndefined();
      expect(themeDataCache.has('non-existent')).toBe(false);
    });

    it('should clear all values', () => {
      const theme1 = getDefaultTheme();
      const theme2 = { ...getDefaultTheme(), id: 'test-theme-2' };
      
      themeDataCache.set('key1', theme1);
      themeDataCache.set('key2', theme2);
      
      expect(themeDataCache.size()).toBe(2);
      
      themeDataCache.clear();
      expect(themeDataCache.size()).toBe(0);
      expect(themeDataCache.has('key1')).toBe(false);
      expect(themeDataCache.has('key2')).toBe(false);
    });
  });

  describe('Cache Key Generation', () => {
    it('should generate consistent cache keys', () => {
      expect(getCacheKey.theme('pastel')).toBe('theme:pastel');
      expect(getCacheKey.accessibility('dark')).toBe('accessibility:dark');
      expect(getCacheKey.cssVariables('light')).toBe('css:light');
      expect(getCacheKey.focusStyles('high-contrast')).toBe('focus:high-contrast');
      expect(getCacheKey.contrastRatio('#000000', '#FFFFFF')).toBe('contrast:#000000:#FFFFFF');
      expect(getCacheKey.systemTheme()).toBe('system:theme');
    });
  });

  describe('Cached Theme Data', () => {
    it('should cache and retrieve theme data', () => {
      const theme = getDefaultTheme();
      const computeFn = jest.fn(() => theme);
      
      // First call should execute compute function
      const result1 = getCachedTheme('pastel', computeFn);
      expect(result1).toBe(theme);
      expect(computeFn).toHaveBeenCalledTimes(1);
      
      // Second call should use cache
      const result2 = getCachedTheme('pastel', computeFn);
      expect(result2).toBe(theme);
      expect(computeFn).toHaveBeenCalledTimes(1); // Still only called once
    });
  });

  describe('Cached Accessibility Validation', () => {
    it('should cache and retrieve accessibility results', () => {
      const accessibilityResult = { isCompliant: true, violations: [], warnings: [] };
      const computeFn = jest.fn(() => accessibilityResult);
      
      // First call should execute compute function
      const result1 = getCachedAccessibility('pastel', computeFn);
      expect(result1).toBe(accessibilityResult);
      expect(computeFn).toHaveBeenCalledTimes(1);
      
      // Second call should use cache
      const result2 = getCachedAccessibility('pastel', computeFn);
      expect(result2).toBe(accessibilityResult);
      expect(computeFn).toHaveBeenCalledTimes(1); // Still only called once
    });
  });

  describe('Cached CSS Variables', () => {
    it('should cache and retrieve CSS variables', () => {
      const cssVariables = { '--color-primary': '#E6E6FA' };
      const computeFn = jest.fn(() => cssVariables);
      
      // First call should execute compute function
      const result1 = getCachedCSSVariables('pastel', computeFn);
      expect(result1).toBe(cssVariables);
      expect(computeFn).toHaveBeenCalledTimes(1);
      
      // Second call should use cache
      const result2 = getCachedCSSVariables('pastel', computeFn);
      expect(result2).toBe(cssVariables);
      expect(computeFn).toHaveBeenCalledTimes(1); // Still only called once
    });
  });

  describe('Cached Focus Styles', () => {
    it('should cache and retrieve focus styles', () => {
      const focusStyles = '.theme-pastel *:focus { outline: 2px solid #E6E6FA; }';
      const computeFn = jest.fn(() => focusStyles);
      
      // First call should execute compute function
      const result1 = getCachedFocusStyles('pastel', computeFn);
      expect(result1).toBe(focusStyles);
      expect(computeFn).toHaveBeenCalledTimes(1);
      
      // Second call should use cache
      const result2 = getCachedFocusStyles('pastel', computeFn);
      expect(result2).toBe(focusStyles);
      expect(computeFn).toHaveBeenCalledTimes(1); // Still only called once
    });
  });

  describe('Cache Statistics', () => {
    it('should provide cache statistics', () => {
      // Add some data to caches
      themeDataCache.set('theme1', getDefaultTheme());
      accessibilityCache.set('acc1', { isCompliant: true });
      cssVariablesCache.set('css1', { '--color-primary': '#000' });
      focusStylesCache.set('focus1', 'styles');
      
      const stats = getCacheStats();
      
      expect(stats.themeData.size).toBe(1);
      expect(stats.themeData.maxSize).toBe(20);
      expect(stats.accessibility.size).toBe(1);
      expect(stats.accessibility.maxSize).toBe(50);
      expect(stats.cssVariables.size).toBe(1);
      expect(stats.cssVariables.maxSize).toBe(20);
      expect(stats.focusStyles.size).toBe(1);
      expect(stats.focusStyles.maxSize).toBe(20);
    });
  });

  describe('Preload Theme Cache', () => {
    it('should preload all themes into cache', () => {
      expect(themeDataCache.size()).toBe(0);
      
      preloadThemeCache(themes);
      
      expect(themeDataCache.size()).toBe(themes.length);
      
      // Verify each theme is cached
      themes.forEach(theme => {
        const cacheKey = getCacheKey.theme(theme.id);
        expect(themeDataCache.has(cacheKey)).toBe(true);
        expect(themeDataCache.get(cacheKey)).toBe(theme);
      });
    });

    it('should not overwrite existing cache entries', () => {
      const customTheme = { ...getDefaultTheme(), id: 'custom' };
      const cacheKey = getCacheKey.theme('pastel');
      
      // Pre-populate cache with custom theme
      themeDataCache.set(cacheKey, customTheme);
      
      preloadThemeCache(themes);
      
      // Should not overwrite existing entry
      expect(themeDataCache.get(cacheKey)).toBe(customTheme);
    });
  });

  describe('Clear All Caches', () => {
    it('should clear all cache instances', () => {
      // Populate all caches
      themeDataCache.set('theme1', getDefaultTheme());
      accessibilityCache.set('acc1', { isCompliant: true });
      cssVariablesCache.set('css1', { '--color-primary': '#000' });
      focusStylesCache.set('focus1', 'styles');
      
      // Verify caches have data
      expect(themeDataCache.size()).toBeGreaterThan(0);
      expect(accessibilityCache.size()).toBeGreaterThan(0);
      expect(cssVariablesCache.size()).toBeGreaterThan(0);
      expect(focusStylesCache.size()).toBeGreaterThan(0);
      
      clearAllCaches();
      
      // Verify all caches are empty
      expect(themeDataCache.size()).toBe(0);
      expect(accessibilityCache.size()).toBe(0);
      expect(cssVariablesCache.size()).toBe(0);
      expect(focusStylesCache.size()).toBe(0);
    });
  });
});