/**
 * ThemeSelector Component
 * Simplified for single earth theme - shows theme info and accessibility status
 */

import React, { useMemo } from 'react';
import { ThemeSelectorProps } from '../types';
import { useTheme } from '../hooks/useTheme';
import { validateThemeAccessibility } from '../themes/accessibility';

/**
 * Main ThemeSelector component - simplified for single theme
 */
export const ThemeSelector: React.FC<ThemeSelectorProps> = ({
  className = ''
}) => {
  const { currentTheme } = useTheme();
  
  // Memoize accessibility validation
  const accessibilityResult = useMemo(() => validateThemeAccessibility(currentTheme), [currentTheme]);
  const isAccessible = accessibilityResult.isCompliant;
  const hasViolations = accessibilityResult.violations.length > 0;
  
  const getAccessibilityIcon = () => {
    if (isAccessible) return '✅';
    if (hasViolations) return '⚠️';
    return '❓';
  };

  const getAccessibilityTitle = () => {
    if (isAccessible) return 'WCAG 2.1 AA Compliant';
    if (hasViolations) return `${accessibilityResult.violations.length} accessibility consideration${accessibilityResult.violations.length > 1 ? 's' : ''}`;
    return 'Accessibility status unknown';
  };

  return (
    <div className={`relative ${className}`}>
      <div className="flex items-center gap-3 px-4 py-2 bg-theme-surface rounded-xl border border-theme-border theme-transition">
        {/* Theme color indicators */}
        <div className="flex gap-1">
          <div 
            className="rounded-sm border border-gray-300 w-4 h-4"
            style={{ backgroundColor: currentTheme.colors.primary }}
            title="Primary color"
          />
          <div 
            className="rounded-sm border border-gray-300 w-4 h-4"
            style={{ backgroundColor: currentTheme.colors.secondary }}
            title="Secondary color"
          />
        </div>
        
        {/* Theme name */}
        <span className="font-medium text-theme-text-primary theme-transition">
          {currentTheme.displayName}
        </span>
        
        {/* Accessibility indicator */}
        <span 
          className="cursor-help text-sm"
          title={getAccessibilityTitle()}
        >
          {getAccessibilityIcon()}
        </span>
        
        {/* Theme description */}
        <span className="text-sm text-theme-text-muted theme-transition">
          {currentTheme.description}
        </span>
      </div>
    </div>
  );
};