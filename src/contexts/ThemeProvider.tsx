/**
 * Theme Provider Component
 * Manages theme state, persistence, and CSS variable application with performance optimizations
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { ThemeContext } from './ThemeContext';
import { ThemeProviderProps, ColorTheme } from '../types';
import { 
  themes, 
  getThemeById, 
  getDefaultTheme
} from '../themes/themes';
import { 
  applyCSSVariables,
  initializeCSSVariables
} from '../themes/cssVariables';
import {
  saveThemePreference,
  loadThemePreference,
  isStorageAvailable,
  DEFAULT_STORAGE_KEY
} from '../themes/storage';
import {
  detectSystemTheme,
  createSystemThemeListener,
  getSystemBasedDefaultTheme
} from '../themes/systemTheme';
import {
  applyFocusStyles,
  removeFocusStyles
} from '../themes/focusStyles';
import { preloadThemeCache } from '../themes/cache';
import type { SystemTheme } from '../themes/systemTheme';

/**
 * ThemeProvider Component
 * Provides theme context to all child components with performance optimizations
 */
export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  defaultTheme = 'earth',
  storageKey = DEFAULT_STORAGE_KEY
}) => {
  // System theme detection state
  const [systemTheme, setSystemTheme] = useState<SystemTheme>(null);
  const [isSystemThemeDetected, setIsSystemThemeDetected] = useState(false);
  
  // Current theme state
  const [currentTheme, setCurrentTheme] = useState<ColorTheme>(() => {
    // Initialize with default theme, will be updated in useEffect
    return getDefaultTheme();
  });

  // Preload theme cache on mount
  useEffect(() => {
    preloadThemeCache(themes);
  }, []);

  /**
   * Initialize theme on component mount
   */
  useEffect(() => {
    // Detect system theme
    const detectedSystemTheme = detectSystemTheme();
    setSystemTheme(detectedSystemTheme);
    setIsSystemThemeDetected(detectedSystemTheme !== null);

    // Load saved theme preference or use system-based default
    let initialThemeId: string;
    
    if (isStorageAvailable()) {
      const savedThemeResult = loadThemePreference(storageKey);
      const savedTheme = savedThemeResult.success ? savedThemeResult.data : null;
      
      if (savedTheme && getThemeById(savedTheme)) {
        initialThemeId = savedTheme;
      } else {
        // No saved preference, use system-based default
        initialThemeId = detectedSystemTheme ? getSystemBasedDefaultTheme() : defaultTheme;
      }
    } else {
      // Storage not available, use system-based default
      initialThemeId = detectedSystemTheme ? getSystemBasedDefaultTheme() : defaultTheme;
    }

    // Apply initial theme
    const initialTheme = getThemeById(initialThemeId) || getDefaultTheme();
    setCurrentTheme(initialTheme);
    initializeCSSVariables(initialTheme);
    
    // Apply focus styles for accessibility
    applyFocusStyles(initialTheme);
  }, [defaultTheme, storageKey]);

  /**
   * Set up system theme change listener
   */
  useEffect(() => {
    const cleanup = createSystemThemeListener((newSystemTheme) => {
      setSystemTheme(newSystemTheme);
      setIsSystemThemeDetected(newSystemTheme !== null);
      
      // Only auto-switch if no user preference is saved
      if (isStorageAvailable()) {
        const savedThemeResult = loadThemePreference(storageKey);
        const savedTheme = savedThemeResult.success ? savedThemeResult.data : null;
        
        if (!savedTheme && newSystemTheme) {
          const systemBasedTheme = getSystemBasedDefaultTheme();
          const theme = getThemeById(systemBasedTheme);
          if (theme) {
            setCurrentTheme(theme);
            applyCSSVariables(theme);
            applyFocusStyles(theme);
          }
        }
      }
    });

    return cleanup;
  }, [storageKey]);

  /**
   * Optimized set theme function with caching
   */
  const setTheme = useCallback((themeId: string) => {
    const theme = getThemeById(themeId);
    
    if (!theme) {
      console.warn(`Theme with id "${themeId}" not found`);
      return;
    }

    // Prevent unnecessary updates
    if (currentTheme.id === themeId) {
      return;
    }

    // Remove old focus styles
    removeFocusStyles(currentTheme.id);

    // Update state
    setCurrentTheme(theme);
    
    // Apply CSS variables (now cached and batched)
    applyCSSVariables(theme);
    
    // Apply focus styles for accessibility (now cached)
    applyFocusStyles(theme);
    
    // Save preference to storage
    if (isStorageAvailable()) {
      saveThemePreference(themeId, storageKey);
    }
  }, [storageKey, currentTheme.id]);

  /**
   * Memoized context value to prevent unnecessary re-renders
   */
  const contextValue = useMemo(() => ({
    currentTheme,
    availableThemes: themes,
    setTheme,
    systemTheme,
    isSystemThemeDetected
  }), [currentTheme, setTheme, systemTheme, isSystemThemeDetected]);

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};