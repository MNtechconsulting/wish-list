/**
 * Theme Context
 * Provides theme data and functionality throughout the application
 */

import { createContext } from 'react';
import { ThemeContextType } from '../types';
import { getDefaultTheme } from '../themes/themes';

/**
 * Default context value with fallback theme
 */
const defaultContextValue: ThemeContextType = {
  currentTheme: getDefaultTheme(),
  availableThemes: [],
  setTheme: () => {
    console.warn('ThemeContext: setTheme called outside of ThemeProvider');
  },
  systemTheme: null,
  isSystemThemeDetected: false,
};

/**
 * Theme Context
 * Provides theme state and actions to all components
 */
export const ThemeContext = createContext<ThemeContextType>(defaultContextValue);