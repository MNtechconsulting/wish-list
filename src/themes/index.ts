/**
 * Theme system exports
 * Central export point for all theme-related functionality
 */

export { themes, getThemeById, getDefaultTheme } from './themes';
export { applyCSSVariables, initializeCSSVariables, getCSSVariable, supportsCSSVariables } from './cssVariables';
export { 
  saveThemePreference, 
  loadThemePreference, 
  clearThemePreference, 
  isStorageAvailable, 
  validateThemePreference,
  getStorageStatus,
  DEFAULT_STORAGE_KEY,
  StorageError
} from './storage';
export type { StorageResult } from './storage';
export { detectSystemTheme, createSystemThemeListener, getSystemBasedDefaultTheme } from './systemTheme';
export type { SystemTheme } from './systemTheme';
export { 
  hexToRgb, 
  getRelativeLuminance, 
  getContrastRatio, 
  meetsWCAGAA, 
  meetsWCAGAAA, 
  validateContrastRatio, 
  validateThemeAccessibility, 
  validateFocusIndicatorVisibility, 
  validateInteractiveElementDifferentiation, 
  generateAccessibilityReport, 
  getAccessibilitySummary, 
  suggestAccessibilityImprovements,
  WCAG_AA_NORMAL,
  WCAG_AA_LARGE,
  WCAG_AAA_NORMAL,
  WCAG_AAA_LARGE
} from './accessibility';
export type { AccessibilityResult, ThemeAccessibilityResult } from './accessibility';
export { 
  generateFocusStyles, 
  generateAllFocusStyles, 
  applyFocusStyles, 
  removeFocusStyles, 
  validateFocusStyles, 
  generateSkipLinkStyles,
  FOCUS_CLASSES
} from './focusStyles';
export type { ColorTheme, ThemeContextType, ThemeProviderProps, ThemeSelectorProps } from '../types';