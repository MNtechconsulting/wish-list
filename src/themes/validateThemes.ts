/**
 * Theme validation utility
 * Validates all themes for WCAG 2.1 AA compliance and generates reports
 */

import { themes } from './themes';
import { 
  generateAccessibilityReport, 
  getAccessibilitySummary, 
  suggestAccessibilityImprovements,
  ThemeAccessibilityResult 
} from './accessibility';

/**
 * Validate all themes and log results
 */
export function validateAllThemes(): ThemeAccessibilityResult[] {
  console.log('🔍 Validating theme accessibility compliance...\n');
  
  const results = generateAccessibilityReport(themes);
  
  results.forEach(result => {
    console.log(`\n📋 ${result.themeName} Theme Report:`);
    console.log(`   ${getAccessibilitySummary(result)}`);
    
    if (result.violations.length > 0) {
      console.log(`   ❌ Violations (${result.violations.length}):`);
      result.violations.forEach(violation => {
        console.log(`      • ${violation.description}: ${violation.contrastRatio.toFixed(2)}:1 (needs ${violation.meetsAALarge ? '3.0' : '4.5'}:1)`);
      });
    }
    
    if (result.warnings.length > 0) {
      console.log(`   ⚠️  Warnings (${result.warnings.length}):`);
      result.warnings.forEach(warning => {
        console.log(`      • ${warning.description}: ${warning.contrastRatio.toFixed(2)}:1 (meets AA, not AAA)`);
      });
    }
    
    if (!result.focusIndicatorVisible) {
      console.log(`   🎯 Focus indicators may not be visible enough`);
    }
    
    if (!result.interactiveElementsDifferentiated) {
      console.log(`   🔘 Interactive elements may not be sufficiently differentiated`);
    }
    
    const suggestions = suggestAccessibilityImprovements(result);
    if (suggestions.length > 0) {
      console.log(`   💡 Suggestions:`);
      suggestions.forEach(suggestion => {
        console.log(`      • ${suggestion}`);
      });
    }
  });
  
  const compliantThemes = results.filter(r => r.isCompliant);
  const nonCompliantThemes = results.filter(r => !r.isCompliant);
  
  console.log(`\n📊 Summary:`);
  console.log(`   ✅ Compliant themes: ${compliantThemes.length}/${results.length}`);
  console.log(`   ❌ Non-compliant themes: ${nonCompliantThemes.length}/${results.length}`);
  
  if (compliantThemes.length > 0) {
    console.log(`   Compliant: ${compliantThemes.map(t => t.themeName).join(', ')}`);
  }
  
  if (nonCompliantThemes.length > 0) {
    console.log(`   Need fixes: ${nonCompliantThemes.map(t => t.themeName).join(', ')}`);
  }
  
  return results;
}

/**
 * Get a quick compliance status for all themes
 */
export function getThemeComplianceStatus(): { [themeId: string]: boolean } {
  const results = generateAccessibilityReport(themes);
  const status: { [themeId: string]: boolean } = {};
  
  results.forEach(result => {
    status[result.themeId] = result.isCompliant;
  });
  
  return status;
}

/**
 * Check if a specific theme is compliant
 */
export function isThemeCompliant(themeId: string): boolean {
  const theme = themes.find(t => t.id === themeId);
  if (!theme) {
    console.warn(`Theme not found: ${themeId}`);
    return false;
  }
  
  const results = generateAccessibilityReport([theme]);
  return results[0]?.isCompliant || false;
}

/**
 * Get detailed report for a specific theme
 */
export function getThemeReport(themeId: string): ThemeAccessibilityResult | null {
  const theme = themes.find(t => t.id === themeId);
  if (!theme) {
    console.warn(`Theme not found: ${themeId}`);
    return null;
  }
  
  const results = generateAccessibilityReport([theme]);
  return results[0] || null;
}

// Run validation if this file is executed directly
if (typeof window === 'undefined' && require.main === module) {
  validateAllThemes();
}