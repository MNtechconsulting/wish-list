/**
 * CSS Custom Properties (Variables) utilities
 * Manages the application of theme colors to CSS variables with caching
 */

import { ColorTheme } from '../types';
import { getCachedCSSVariables, scheduleCleanup } from './cache';

/**
 * Compute CSS variables from theme (cached)
 */
const computeCSSVariables = (theme: ColorTheme): Record<string, string> => {
  return {
    '--color-primary': theme.colors.primary,
    '--color-secondary': theme.colors.secondary,
    '--color-accent': theme.colors.accent,
    '--color-background': theme.colors.background,
    '--color-surface': theme.colors.surface,
    '--color-text-primary': theme.colors.text.primary,
    '--color-text-secondary': theme.colors.text.secondary,
    '--color-text-muted': theme.colors.text.muted,
    '--color-border': theme.colors.border,
    '--color-success': theme.colors.success,
    '--color-warning': theme.colors.warning,
    '--color-error': theme.colors.error,
    '--color-info': theme.colors.info,
    '--shadow-small': theme.shadows.small,
    '--shadow-medium': theme.shadows.medium,
    '--shadow-large': theme.shadows.large,
  };
};

/**
 * Apply theme colors to CSS custom properties with caching and batching
 */
export const applyCSSVariables = (theme: ColorTheme): void => {
  // Get cached CSS variables
  const variables = getCachedCSSVariables(theme.id, () => computeCSSVariables(theme));
  
  // Batch DOM updates for better performance
  const root = document.documentElement;
  
  // Use requestAnimationFrame to batch DOM updates
  requestAnimationFrame(() => {
    // Apply all variables in a single batch
    Object.entries(variables).forEach(([property, value]) => {
      root.style.setProperty(property, value);
    });
    
    // Schedule cache cleanup
    scheduleCleanup();
  });
};

/**
 * Initialize CSS variables with default theme
 */
export const initializeCSSVariables = (theme: ColorTheme): void => {
  applyCSSVariables(theme);
};

/**
 * Get current CSS variable value
 */
export const getCSSVariable = (variableName: string): string => {
  return getComputedStyle(document.documentElement)
    .getPropertyValue(variableName)
    .trim();
};

/**
 * Check if CSS custom properties are supported
 */
export const supportsCSSVariables = (): boolean => {
  try {
    return !!(window.CSS && CSS.supports && CSS.supports('color', 'var(--test)'));
  } catch {
    return false;
  }
};