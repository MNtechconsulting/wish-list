/**
 * Accessibility validation utilities for theme system
 * Provides WCAG 2.1 AA contrast ratio validation and accessibility compliance checking with caching
 */

import { ColorTheme } from '../types';
import { getCachedAccessibility, getCacheKey, accessibilityCache } from './cache';

/**
 * WCAG 2.1 AA contrast ratio requirements
 */
export const WCAG_AA_NORMAL = 4.5;
export const WCAG_AA_LARGE = 3.0;
export const WCAG_AAA_NORMAL = 7.0;
export const WCAG_AAA_LARGE = 4.5;

/**
 * Convert hex color to RGB values
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  // Remove # if present
  hex = hex.replace('#', '');
  
  // Handle 3-digit hex
  if (hex.length === 3) {
    hex = hex.split('').map(char => char + char).join('');
  }
  
  if (hex.length !== 6) {
    return null;
  }
  
  // Validate hex characters
  if (!/^[0-9A-Fa-f]{6}$/.test(hex)) {
    return null;
  }
  
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  
  // Check for NaN values
  if (isNaN(r) || isNaN(g) || isNaN(b)) {
    return null;
  }
  
  return { r, g, b };
}

/**
 * Calculate relative luminance of a color
 * Based on WCAG 2.1 specification
 */
export function getRelativeLuminance(color: string): number {
  const rgb = hexToRgb(color);
  if (!rgb) {
    throw new Error(`Invalid color format: ${color}`);
  }
  
  // Convert to sRGB
  const rsRGB = rgb.r / 255;
  const gsRGB = rgb.g / 255;
  const bsRGB = rgb.b / 255;
  
  // Apply gamma correction
  const rLinear = rsRGB <= 0.03928 ? rsRGB / 12.92 : Math.pow((rsRGB + 0.055) / 1.055, 2.4);
  const gLinear = gsRGB <= 0.03928 ? gsRGB / 12.92 : Math.pow((gsRGB + 0.055) / 1.055, 2.4);
  const bLinear = bsRGB <= 0.03928 ? bsRGB / 12.92 : Math.pow((bsRGB + 0.055) / 1.055, 2.4);
  
  // Calculate relative luminance
  return 0.2126 * rLinear + 0.7152 * gLinear + 0.0722 * bLinear;
}

/**
 * Calculate contrast ratio between two colors with caching
 * Returns a value between 1 and 21
 */
export function getContrastRatio(color1: string, color2: string): number {
  const cacheKey = getCacheKey.contrastRatio(color1, color2);
  
  let ratio = accessibilityCache.get(cacheKey);
  if (ratio === undefined) {
    const luminance1 = getRelativeLuminance(color1);
    const luminance2 = getRelativeLuminance(color2);
    
    const lighter = Math.max(luminance1, luminance2);
    const darker = Math.min(luminance1, luminance2);
    
    ratio = (lighter + 0.05) / (darker + 0.05);
    accessibilityCache.set(cacheKey, ratio);
  }
  
  return ratio;
}

/**
 * Check if contrast ratio meets WCAG AA standard
 */
export function meetsWCAGAA(foreground: string, background: string, isLargeText = false): boolean {
  const ratio = getContrastRatio(foreground, background);
  const threshold = isLargeText ? WCAG_AA_LARGE : WCAG_AA_NORMAL;
  return ratio >= threshold;
}

/**
 * Check if contrast ratio meets WCAG AAA standard
 */
export function meetsWCAGAAA(foreground: string, background: string, isLargeText = false): boolean {
  const ratio = getContrastRatio(foreground, background);
  const threshold = isLargeText ? WCAG_AAA_LARGE : WCAG_AAA_NORMAL;
  return ratio >= threshold;
}

/**
 * Accessibility validation result for a color combination
 */
export interface AccessibilityResult {
  foreground: string;
  background: string;
  contrastRatio: number;
  meetsAA: boolean;
  meetsAAA: boolean;
  meetsAALarge: boolean;
  meetsAAALarge: boolean;
  description: string;
}

/**
 * Validate contrast ratio for a color combination
 */
export function validateContrastRatio(
  foreground: string, 
  background: string, 
  description: string
): AccessibilityResult {
  const contrastRatio = getContrastRatio(foreground, background);
  
  return {
    foreground,
    background,
    contrastRatio,
    meetsAA: meetsWCAGAA(foreground, background, false),
    meetsAAA: meetsWCAGAAA(foreground, background, false),
    meetsAALarge: meetsWCAGAA(foreground, background, true),
    meetsAAALarge: meetsWCAGAAA(foreground, background, true),
    description
  };
}

/**
 * Theme accessibility validation result
 */
export interface ThemeAccessibilityResult {
  themeId: string;
  themeName: string;
  isCompliant: boolean;
  violations: AccessibilityResult[];
  warnings: AccessibilityResult[];
  validCombinations: AccessibilityResult[];
  focusIndicatorVisible: boolean;
  interactiveElementsDifferentiated: boolean;
}

/**
 * Validate all critical color combinations in a theme with caching
 */
export function validateThemeAccessibility(theme: ColorTheme): ThemeAccessibilityResult {
  return getCachedAccessibility(theme.id, () => computeThemeAccessibility(theme));
}

/**
 * Compute theme accessibility validation (cached computation)
 */
function computeThemeAccessibility(theme: ColorTheme): ThemeAccessibilityResult {
  const results: AccessibilityResult[] = [];
  
  // Critical text/background combinations
  const criticalCombinations = [
    { fg: theme.colors.text.primary, bg: theme.colors.background, desc: 'Primary text on background' },
    { fg: theme.colors.text.primary, bg: theme.colors.surface, desc: 'Primary text on surface' },
    { fg: theme.colors.text.secondary, bg: theme.colors.background, desc: 'Secondary text on background' },
    { fg: theme.colors.text.secondary, bg: theme.colors.surface, desc: 'Secondary text on surface' },
    { fg: theme.colors.text.muted, bg: theme.colors.background, desc: 'Muted text on background' },
    { fg: theme.colors.text.muted, bg: theme.colors.surface, desc: 'Muted text on surface' },
    
    // Interactive elements
    { fg: theme.colors.background, bg: theme.colors.primary, desc: 'Primary button text' },
    { fg: theme.colors.background, bg: theme.colors.secondary, desc: 'Secondary button text' },
    { fg: theme.colors.background, bg: theme.colors.accent, desc: 'Accent button text' },
    { fg: theme.colors.text.primary, bg: theme.colors.primary, desc: 'Primary button alternative text' },
    { fg: theme.colors.text.primary, bg: theme.colors.secondary, desc: 'Secondary button alternative text' },
    { fg: theme.colors.text.primary, bg: theme.colors.accent, desc: 'Accent button alternative text' },
    
    // Status colors
    { fg: theme.colors.background, bg: theme.colors.success, desc: 'Success message text' },
    { fg: theme.colors.background, bg: theme.colors.warning, desc: 'Warning message text' },
    { fg: theme.colors.background, bg: theme.colors.error, desc: 'Error message text' },
    { fg: theme.colors.background, bg: theme.colors.info, desc: 'Info message text' },
    { fg: theme.colors.text.primary, bg: theme.colors.success, desc: 'Success message alternative text' },
    { fg: theme.colors.text.primary, bg: theme.colors.warning, desc: 'Warning message alternative text' },
    { fg: theme.colors.text.primary, bg: theme.colors.error, desc: 'Error message alternative text' },
    { fg: theme.colors.text.primary, bg: theme.colors.info, desc: 'Info message alternative text' },
    
    // Border differentiation
    { fg: theme.colors.border, bg: theme.colors.background, desc: 'Border on background' },
    { fg: theme.colors.border, bg: theme.colors.surface, desc: 'Border on surface' }
  ];
  
  // Validate each combination
  criticalCombinations.forEach(combo => {
    try {
      const result = validateContrastRatio(combo.fg, combo.bg, combo.desc);
      results.push(result);
    } catch (error) {
      console.warn(`Failed to validate contrast for ${combo.desc}:`, error);
    }
  });
  
  // Categorize results
  const violations = results.filter(r => !r.meetsAA);
  const warnings = results.filter(r => r.meetsAA && !r.meetsAAA);
  const validCombinations = results.filter(r => r.meetsAAA);
  
  // Check focus indicator visibility (simplified check)
  const focusIndicatorVisible = validateFocusIndicatorVisibility(theme);
  
  // Check interactive element differentiation
  const interactiveElementsDifferentiated = validateInteractiveElementDifferentiation(theme);
  
  return {
    themeId: theme.id,
    themeName: theme.displayName,
    isCompliant: violations.length === 0 && focusIndicatorVisible && interactiveElementsDifferentiated,
    violations,
    warnings,
    validCombinations,
    focusIndicatorVisible,
    interactiveElementsDifferentiated
  };
}

/**
 * Validate that focus indicators are visible in the theme
 */
export function validateFocusIndicatorVisibility(theme: ColorTheme): boolean {
  // Check that primary color has sufficient contrast with background for focus rings
  const focusRingContrast = getContrastRatio(theme.colors.primary, theme.colors.background);
  const surfaceFocusContrast = getContrastRatio(theme.colors.primary, theme.colors.surface);
  
  // Focus indicators should have at least 3:1 contrast ratio (WCAG 2.1 AA for non-text)
  return focusRingContrast >= 3.0 && surfaceFocusContrast >= 3.0;
}

/**
 * Validate that interactive elements have sufficient color differentiation
 */
export function validateInteractiveElementDifferentiation(theme: ColorTheme): boolean {
  // Check that interactive colors are sufficiently different from each other
  const primarySecondaryContrast = getContrastRatio(theme.colors.primary, theme.colors.secondary);
  const primaryAccentContrast = getContrastRatio(theme.colors.primary, theme.colors.accent);
  const secondaryAccentContrast = getContrastRatio(theme.colors.secondary, theme.colors.accent);
  
  // Interactive elements should be distinguishable (at least 1.5:1 difference)
  return primarySecondaryContrast >= 1.5 && 
         primaryAccentContrast >= 1.5 && 
         secondaryAccentContrast >= 1.5;
}

/**
 * Generate accessibility report for all themes
 */
export function generateAccessibilityReport(themes: ColorTheme[]): ThemeAccessibilityResult[] {
  return themes.map(theme => validateThemeAccessibility(theme));
}

/**
 * Get accessibility summary for a theme
 */
export function getAccessibilitySummary(result: ThemeAccessibilityResult): string {
  if (result.isCompliant) {
    return `✅ ${result.themeName} is fully WCAG 2.1 AA compliant`;
  }
  
  const issues = [];
  if (result.violations.length > 0) {
    issues.push(`${result.violations.length} contrast violations`);
  }
  if (!result.focusIndicatorVisible) {
    issues.push('focus indicators not visible');
  }
  if (!result.interactiveElementsDifferentiated) {
    issues.push('interactive elements not sufficiently differentiated');
  }
  
  return `⚠️ ${result.themeName} has accessibility issues: ${issues.join(', ')}`;
}

/**
 * Suggest improvements for accessibility violations
 */
export function suggestAccessibilityImprovements(result: ThemeAccessibilityResult): string[] {
  const suggestions: string[] = [];
  
  if (result.violations.length > 0) {
    suggestions.push(`Improve contrast ratios for ${result.violations.length} color combinations`);
    
    // Specific suggestions for common violations
    const textViolations = result.violations.filter(v => v.description.includes('text'));
    if (textViolations.length > 0) {
      suggestions.push('Consider using darker text colors or lighter background colors');
    }
    
    const buttonViolations = result.violations.filter(v => v.description.includes('button'));
    if (buttonViolations.length > 0) {
      suggestions.push('Adjust button background colors or use alternative text colors');
    }
  }
  
  if (!result.focusIndicatorVisible) {
    suggestions.push('Use a more contrasting color for focus indicators (outline/ring)');
  }
  
  if (!result.interactiveElementsDifferentiated) {
    suggestions.push('Increase color differences between primary, secondary, and accent colors');
  }
  
  return suggestions;
}