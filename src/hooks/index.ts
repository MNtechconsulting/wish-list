/**
 * Hooks module exports
 * Centralized exports for all custom hooks
 */

export { 
  useLocalStorage, 
  isLocalStorageAvailable, 
  getLocalStorageItem, 
  setLocalStorageItem, 
  removeLocalStorageItem 
} from './useLocalStorage';

export { useAsyncError, useAsyncState } from './useAsyncError';

export { useTheme, useThemeOptional } from './useTheme';
export type { UseThemeReturn } from './useTheme';

export { useAccessibility, useContrastValidation, useAccessibilityWarnings } from './useAccessibility';