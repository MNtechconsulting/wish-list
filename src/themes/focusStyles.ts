/**
 * Focus styles utilities for accessibility compliance
 * Ensures focus indicators are visible across all themes with caching
 */

import { ColorTheme } from '../types';
import { getContrastRatio } from './accessibility';
import { getCachedFocusStyles } from './cache';

/**
 * Generate accessible focus ring styles for a theme (cached computation)
 */
const computeFocusStyles = (theme: ColorTheme): string => {
  const { colors } = theme;
  
  // Determine the best focus ring color based on contrast
  const getFocusRingColor = (backgroundColor: string): string => {
    // Try primary color first
    if (getContrastRatio(colors.primary, backgroundColor) >= 3.0) {
      return colors.primary;
    }
    
    // Try accent color
    if (getContrastRatio(colors.accent, backgroundColor) >= 3.0) {
      return colors.accent;
    }
    
    // Try secondary color
    if (getContrastRatio(colors.secondary, backgroundColor) >= 3.0) {
      return colors.secondary;
    }
    
    // Fallback to high contrast colors
    if (backgroundColor === colors.background || backgroundColor === colors.surface) {
      // For light backgrounds, use dark ring
      return colors.text.primary;
    } else {
      // For dark backgrounds, use light ring
      return colors.background;
    }
  };
  
  const backgroundFocusColor = getFocusRingColor(colors.background);
  const surfaceFocusColor = getFocusRingColor(colors.surface);
  
  return `
    /* Focus styles for theme: ${theme.id} */
    .theme-${theme.id} *:focus {
      outline: 2px solid ${backgroundFocusColor};
      outline-offset: 2px;
    }
    
    .theme-${theme.id} *:focus:not(:focus-visible) {
      outline: none;
    }
    
    .theme-${theme.id} *:focus-visible {
      outline: 2px solid ${backgroundFocusColor};
      outline-offset: 2px;
    }
    
    /* Button focus styles */
    .theme-${theme.id} button:focus-visible,
    .theme-${theme.id} [role="button"]:focus-visible {
      outline: 2px solid ${backgroundFocusColor};
      outline-offset: 2px;
    }
    
    /* Input focus styles */
    .theme-${theme.id} input:focus-visible,
    .theme-${theme.id} textarea:focus-visible,
    .theme-${theme.id} select:focus-visible {
      outline: 2px solid ${backgroundFocusColor};
      outline-offset: 2px;
      border-color: ${colors.primary};
    }
    
    /* Link focus styles */
    .theme-${theme.id} a:focus-visible {
      outline: 2px solid ${backgroundFocusColor};
      outline-offset: 2px;
      text-decoration: underline;
    }
    
    /* Surface element focus styles */
    .theme-${theme.id} [data-surface="true"] *:focus-visible {
      outline-color: ${surfaceFocusColor};
    }
    
    /* High contrast mode adjustments */
    @media (prefers-contrast: high) {
      .theme-${theme.id} *:focus-visible {
        outline-width: 3px;
        outline-style: solid;
      }
    }
    
    /* Reduced motion adjustments */
    @media (prefers-reduced-motion: reduce) {
      .theme-${theme.id} *:focus-visible {
        transition: none;
      }
    }
  `;
};

/**
 * Generate accessible focus ring styles for a theme with caching
 */
export function generateFocusStyles(theme: ColorTheme): string {
  return getCachedFocusStyles(theme.id, () => computeFocusStyles(theme));
}

/**
 * Generate all focus styles for all themes
 */
export function generateAllFocusStyles(themes: ColorTheme[]): string {
  return themes.map(theme => generateFocusStyles(theme)).join('\n\n');
}

/**
 * Apply focus styles to the document
 */
export function applyFocusStyles(theme: ColorTheme): void {
  const styleId = `focus-styles-${theme.id}`;
  
  // Remove existing focus styles
  const existingStyle = document.getElementById(styleId);
  if (existingStyle) {
    existingStyle.remove();
  }
  
  // Create new style element
  const styleElement = document.createElement('style');
  styleElement.id = styleId;
  styleElement.textContent = generateFocusStyles(theme);
  
  // Add to document head
  document.head.appendChild(styleElement);
}

/**
 * Remove focus styles for a theme
 */
export function removeFocusStyles(themeId: string): void {
  const styleId = `focus-styles-${themeId}`;
  const existingStyle = document.getElementById(styleId);
  if (existingStyle) {
    existingStyle.remove();
  }
}

/**
 * Validate that focus styles provide sufficient contrast
 */
export function validateFocusStyles(theme: ColorTheme): {
  isValid: boolean;
  issues: string[];
  recommendations: string[];
} {
  const issues: string[] = [];
  const recommendations: string[] = [];
  
  // Check focus ring contrast against background
  const backgroundContrast = getContrastRatio(theme.colors.primary, theme.colors.background);
  if (backgroundContrast < 3.0) {
    issues.push(`Focus ring on background has insufficient contrast: ${backgroundContrast.toFixed(2)}:1`);
    recommendations.push('Use a darker or lighter color for focus rings on background elements');
  }
  
  // Check focus ring contrast against surface
  const surfaceContrast = getContrastRatio(theme.colors.primary, theme.colors.surface);
  if (surfaceContrast < 3.0) {
    issues.push(`Focus ring on surface has insufficient contrast: ${surfaceContrast.toFixed(2)}:1`);
    recommendations.push('Use a darker or lighter color for focus rings on surface elements');
  }
  
  // Check that interactive colors are distinguishable
  const primarySecondaryContrast = getContrastRatio(theme.colors.primary, theme.colors.secondary);
  if (primarySecondaryContrast < 1.5) {
    issues.push(`Primary and secondary colors are too similar: ${primarySecondaryContrast.toFixed(2)}:1`);
    recommendations.push('Increase the difference between primary and secondary colors');
  }
  
  return {
    isValid: issues.length === 0,
    issues,
    recommendations
  };
}

/**
 * CSS class names for focus management
 */
export const FOCUS_CLASSES = {
  FOCUSABLE: 'focusable',
  FOCUS_VISIBLE: 'focus-visible',
  FOCUS_WITHIN: 'focus-within',
  SKIP_LINK: 'skip-link'
} as const;

/**
 * Generate skip link styles for accessibility
 */
export function generateSkipLinkStyles(theme: ColorTheme): string {
  return `
    .${FOCUS_CLASSES.SKIP_LINK} {
      position: absolute;
      top: -40px;
      left: 6px;
      background: ${theme.colors.primary};
      color: ${theme.colors.background};
      padding: 8px;
      text-decoration: none;
      border-radius: 4px;
      z-index: 1000;
      transition: top 0.3s;
    }
    
    .${FOCUS_CLASSES.SKIP_LINK}:focus {
      top: 6px;
      outline: 2px solid ${theme.colors.accent};
      outline-offset: 2px;
    }
  `;
}