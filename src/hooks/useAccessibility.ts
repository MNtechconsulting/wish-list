/**
 * Accessibility hook for theme system
 * Provides accessibility validation and compliance checking for components
 */

import { useMemo } from 'react';
import { useTheme } from './useTheme';
import { 
  validateThemeAccessibility, 
  getAccessibilitySummary, 
  suggestAccessibilityImprovements,
  validateContrastRatio,
  AccessibilityResult
} from '../themes/accessibility';

/**
 * Hook for accessing theme accessibility information
 */
export function useAccessibility() {
  const { currentTheme } = useTheme();
  
  // Validate current theme accessibility
  const accessibilityResult = useMemo(() => {
    return validateThemeAccessibility(currentTheme);
  }, [currentTheme]);
  
  // Get summary and suggestions
  const summary = useMemo(() => {
    return getAccessibilitySummary(accessibilityResult);
  }, [accessibilityResult]);
  
  const suggestions = useMemo(() => {
    return suggestAccessibilityImprovements(accessibilityResult);
  }, [accessibilityResult]);
  
  // Helper function to validate custom color combinations
  const validateColors = (foreground: string, background: string, description: string): AccessibilityResult => {
    return validateContrastRatio(foreground, background, description);
  };
  
  // Check if current theme is compliant
  const isCompliant = accessibilityResult.isCompliant;
  
  // Get violations and warnings
  const violations = accessibilityResult.violations;
  const warnings = accessibilityResult.warnings;
  
  // Helper to check if a specific color combination is accessible
  const isAccessible = (foreground: string, background: string): boolean => {
    try {
      const result = validateContrastRatio(foreground, background, 'Custom validation');
      return result.meetsAA;
    } catch {
      return false;
    }
  };
  
  // Get theme-specific accessible color combinations
  const getAccessibleTextColor = (backgroundColor: string): string => {
    const { colors } = currentTheme;
    
    // Try different text colors and return the first accessible one
    const textOptions = [
      colors.text.primary,
      colors.text.secondary,
      colors.background,
      colors.surface
    ];
    
    for (const textColor of textOptions) {
      if (isAccessible(textColor, backgroundColor)) {
        return textColor;
      }
    }
    
    // Fallback to primary text color
    return colors.text.primary;
  };
  
  // Get accessible button text color for a given button background
  const getAccessibleButtonTextColor = (buttonColor: string): string => {
    return getAccessibleTextColor(buttonColor);
  };
  
  // Check if focus indicators are visible
  const hasFocusIndicators = accessibilityResult.focusIndicatorVisible;
  
  // Check if interactive elements are differentiated
  const hasInteractiveDifferentiation = accessibilityResult.interactiveElementsDifferentiated;
  
  return {
    // Validation results
    result: accessibilityResult,
    isCompliant,
    violations,
    warnings,
    summary,
    suggestions,
    
    // Focus and interaction checks
    hasFocusIndicators,
    hasInteractiveDifferentiation,
    
    // Helper functions
    validateColors,
    isAccessible,
    getAccessibleTextColor,
    getAccessibleButtonTextColor,
    
    // Theme-specific accessibility info
    themeId: currentTheme.id,
    themeName: currentTheme.displayName
  };
}

/**
 * Hook for validating a specific color combination
 */
export function useContrastValidation(foreground: string, background: string, description = 'Color combination') {
  const validation = useMemo(() => {
    try {
      return validateContrastRatio(foreground, background, description);
    } catch (error) {
      console.warn(`Failed to validate contrast for ${description}:`, error);
      return null;
    }
  }, [foreground, background, description]);
  
  return {
    validation,
    isAccessible: validation?.meetsAA || false,
    contrastRatio: validation?.contrastRatio || 0,
    meetsAA: validation?.meetsAA || false,
    meetsAAA: validation?.meetsAAA || false
  };
}

/**
 * Hook for getting accessibility warnings for the current theme
 */
export function useAccessibilityWarnings() {
  const { violations, warnings, isCompliant, suggestions } = useAccessibility();
  
  // Combine violations and warnings into actionable items
  const allIssues = [
    ...violations.map(v => ({
      type: 'violation' as const,
      severity: 'high' as const,
      message: `${v.description}: ${v.contrastRatio.toFixed(2)}:1 contrast ratio is too low`,
      suggestion: `Needs at least ${v.meetsAALarge ? '3.0' : '4.5'}:1 for WCAG AA compliance`
    })),
    ...warnings.map(w => ({
      type: 'warning' as const,
      severity: 'medium' as const,
      message: `${w.description}: ${w.contrastRatio.toFixed(2)}:1 meets AA but not AAA`,
      suggestion: `Consider improving to ${w.meetsAAALarge ? '4.5' : '7.0'}:1 for AAA compliance`
    }))
  ];
  
  return {
    hasIssues: !isCompliant,
    issues: allIssues,
    suggestions,
    violationCount: violations.length,
    warningCount: warnings.length
  };
}