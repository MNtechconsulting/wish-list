/**
 * useTheme Custom Hook
 * Provides comprehensive theme management functionality including
 * theme switching and preview capabilities with performance optimizations
 */

import { useContext, useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { ThemeContext } from '../contexts/ThemeContext';
import { ColorTheme, ThemeContextType } from '../types';
import { applyCSSVariables } from '../themes/cssVariables';

/**
 * Extended theme context type with preview functionality
 */
export interface UseThemeReturn extends ThemeContextType {
  // Theme switching
  switchTheme: (themeId: string) => void;
  
  // Theme preview functionality
  previewTheme: (themeId: string) => void;
  clearPreview: () => void;
  isPreviewActive: boolean;
  previewedTheme: ColorTheme | null;
  
  // Utility functions
  getThemeById: (themeId: string) => ColorTheme | undefined;
  isThemeActive: (themeId: string) => boolean;
}

/**
 * Custom hook for comprehensive theme management with performance optimizations
 * 
 * Provides access to theme context with additional functionality:
 * - Theme switching with persistence
 * - Theme preview without persistence
 * - Utility functions for theme management
 * - Memoized functions to prevent unnecessary re-renders
 * 
 * @throws {Error} If used outside of ThemeProvider
 * @returns {UseThemeReturn} Extended theme context with preview functionality
 */
export const useTheme = (): UseThemeReturn => {
  const context = useContext(ThemeContext);
  
  // Check if we're actually inside a ThemeProvider by checking if availableThemes is populated
  if (!context || context.availableThemes.length === 0) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  
  // Preview state
  const [isPreviewActive, setIsPreviewActive] = useState(false);
  const [previewedTheme, setPreviewedTheme] = useState<ColorTheme | null>(null);
  
  // Store original theme for preview restoration
  const originalThemeRef = useRef<ColorTheme | null>(null);
  
  /**
   * Memoized available themes map for faster lookups
   */
  const themesMap = useMemo(() => {
    const map = new Map<string, ColorTheme>();
    context.availableThemes.forEach(theme => {
      map.set(theme.id, theme);
    });
    return map;
  }, [context.availableThemes]);

  /**
   * Switch theme permanently (with persistence) - memoized to prevent re-renders
   * This is the main theme switching function that saves the preference
   */
  const switchTheme = useCallback((themeId: string) => {
    // Clear any active preview first
    if (isPreviewActive) {
      clearPreview();
    }
    
    // Use the context's setTheme function which handles persistence
    context.setTheme(themeId);
  }, [context.setTheme, isPreviewActive]);
  
  /**
   * Preview theme temporarily without persistence - memoized to prevent re-renders
   * Allows users to see how a theme looks before committing to it
   */
  const previewTheme = useCallback((themeId: string) => {
    const theme = themesMap.get(themeId);
    
    if (!theme) {
      console.warn(`Theme with id "${themeId}" not found for preview`);
      return;
    }
    
    // Store original theme if not already previewing
    if (!isPreviewActive) {
      originalThemeRef.current = context.currentTheme;
    }
    
    // Set preview state
    setIsPreviewActive(true);
    setPreviewedTheme(theme);
    
    // Apply CSS variables for preview
    applyCSSVariables(theme);
  }, [themesMap, context.currentTheme, isPreviewActive]);
  
  /**
   * Clear theme preview and restore original theme - memoized to prevent re-renders
   * Returns to the actual selected theme
   */
  const clearPreview = useCallback(() => {
    if (!isPreviewActive || !originalThemeRef.current) {
      return;
    }
    
    // Restore original theme CSS variables
    applyCSSVariables(originalThemeRef.current);
    
    // Clear preview state
    setIsPreviewActive(false);
    setPreviewedTheme(null);
    originalThemeRef.current = null;
  }, [isPreviewActive]);
  
  /**
   * Get theme by ID from available themes - memoized with Map lookup for performance
   */
  const getThemeById = useCallback((themeId: string): ColorTheme | undefined => {
    return themesMap.get(themeId);
  }, [themesMap]);
  
  /**
   * Check if a theme is currently active (either as current or preview) - memoized
   */
  const isThemeActive = useCallback((themeId: string): boolean => {
    if (isPreviewActive && previewedTheme) {
      return previewedTheme.id === themeId;
    }
    return context.currentTheme.id === themeId;
  }, [context.currentTheme.id, isPreviewActive, previewedTheme]);
  
  /**
   * Clean up preview on unmount
   */
  useEffect(() => {
    return () => {
      if (isPreviewActive && originalThemeRef.current) {
        applyCSSVariables(originalThemeRef.current);
      }
    };
  }, [isPreviewActive]);
  
  /**
   * Memoized return value to prevent unnecessary re-renders
   */
  return useMemo(() => ({
    // Original context properties
    ...context,
    
    // Enhanced theme switching
    switchTheme,
    
    // Preview functionality
    previewTheme,
    clearPreview,
    isPreviewActive,
    previewedTheme,
    
    // Utility functions
    getThemeById,
    isThemeActive,
  }), [
    context,
    switchTheme,
    previewTheme,
    clearPreview,
    isPreviewActive,
    previewedTheme,
    getThemeById,
    isThemeActive,
  ]);
};

/**
 * Optional hook that returns null if used outside ThemeProvider
 * Useful for components that may or may not have theme context available
 */
export const useThemeOptional = (): UseThemeReturn | null => {
  const context = useContext(ThemeContext);
  
  if (!context) {
    return null;
  }
  
  // Use the main useTheme hook since context is available
  return useTheme();
};