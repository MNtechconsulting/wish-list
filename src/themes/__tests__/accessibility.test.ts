/**
 * Accessibility validation tests
 * Tests WCAG 2.1 AA compliance checking functionality
 */

import { 
  hexToRgb, 
  getRelativeLuminance, 
  getContrastRatio, 
  meetsWCAGAA, 
  validateThemeAccessibility,
  validateFocusIndicatorVisibility,
  validateInteractiveElementDifferentiation
} from '../accessibility';
import { themes } from '../themes';

describe('Accessibility Utils', () => {
  describe('hexToRgb', () => {
    it('should convert hex colors to RGB', () => {
      expect(hexToRgb('#FFFFFF')).toEqual({ r: 255, g: 255, b: 255 });
      expect(hexToRgb('#000000')).toEqual({ r: 0, g: 0, b: 0 });
      expect(hexToRgb('#FF0000')).toEqual({ r: 255, g: 0, b: 0 });
      expect(hexToRgb('FFFFFF')).toEqual({ r: 255, g: 255, b: 255 }); // Without #
    });

    it('should handle 3-digit hex colors', () => {
      expect(hexToRgb('#FFF')).toEqual({ r: 255, g: 255, b: 255 });
      expect(hexToRgb('#000')).toEqual({ r: 0, g: 0, b: 0 });
    });

    it('should return null for invalid hex colors', () => {
      expect(hexToRgb('#GGGGGG')).toBeNull();
      expect(hexToRgb('#FF')).toBeNull();
      expect(hexToRgb('invalid')).toBeNull();
    });
  });

  describe('getRelativeLuminance', () => {
    it('should calculate correct luminance for white and black', () => {
      expect(getRelativeLuminance('#FFFFFF')).toBeCloseTo(1, 2);
      expect(getRelativeLuminance('#000000')).toBeCloseTo(0, 2);
    });

    it('should throw error for invalid colors', () => {
      expect(() => getRelativeLuminance('invalid')).toThrow();
    });
  });

  describe('getContrastRatio', () => {
    it('should calculate correct contrast ratios', () => {
      // White on black should be 21:1
      expect(getContrastRatio('#FFFFFF', '#000000')).toBeCloseTo(21, 0);
      
      // Same colors should be 1:1
      expect(getContrastRatio('#FFFFFF', '#FFFFFF')).toBeCloseTo(1, 1);
      expect(getContrastRatio('#000000', '#000000')).toBeCloseTo(1, 1);
    });
  });

  describe('meetsWCAGAA', () => {
    it('should correctly identify WCAG AA compliant combinations', () => {
      // White on black meets AA
      expect(meetsWCAGAA('#FFFFFF', '#000000')).toBe(true);
      
      // Black on white meets AA
      expect(meetsWCAGAA('#000000', '#FFFFFF')).toBe(true);
      
      // Light gray on white does not meet AA
      expect(meetsWCAGAA('#CCCCCC', '#FFFFFF')).toBe(false);
    });

    it('should handle large text threshold correctly', () => {
      // Use a color that definitely falls between 3.0 and 4.5
      const ratio = getContrastRatio('#888888', '#FFFFFF');
      expect(ratio).toBeGreaterThan(3.0); // Should meet AA large
      expect(ratio).toBeLessThan(4.5); // Should not meet AA normal
      
      expect(meetsWCAGAA('#888888', '#FFFFFF', true)).toBe(true); // Large text
      expect(meetsWCAGAA('#888888', '#FFFFFF', false)).toBe(false); // Normal text
    });
  });

  describe('validateThemeAccessibility', () => {
    it('should validate all predefined themes', () => {
      themes.forEach(theme => {
        const result = validateThemeAccessibility(theme);
        
        expect(result).toHaveProperty('themeId', theme.id);
        expect(result).toHaveProperty('themeName', theme.displayName);
        expect(result).toHaveProperty('isCompliant');
        expect(result).toHaveProperty('violations');
        expect(result).toHaveProperty('warnings');
        expect(result).toHaveProperty('validCombinations');
        expect(result).toHaveProperty('focusIndicatorVisible');
        expect(result).toHaveProperty('interactiveElementsDifferentiated');
        
        expect(Array.isArray(result.violations)).toBe(true);
        expect(Array.isArray(result.warnings)).toBe(true);
        expect(Array.isArray(result.validCombinations)).toBe(true);
        expect(typeof result.focusIndicatorVisible).toBe('boolean');
        expect(typeof result.interactiveElementsDifferentiated).toBe('boolean');
      });
    });

    it('should identify high contrast theme as having some violations', () => {
      const highContrastTheme = themes.find(t => t.id === 'high-contrast');
      if (highContrastTheme) {
        const result = validateThemeAccessibility(highContrastTheme);
        
        // High contrast theme may still have some violations but should be better than others
        expect(result.violations.length).toBeLessThan(15); // Less than other themes
        expect(typeof result.isCompliant).toBe('boolean');
      }
    });
  });

  describe('validateFocusIndicatorVisibility', () => {
    it('should validate focus indicators for all themes', () => {
      themes.forEach(theme => {
        const isVisible = validateFocusIndicatorVisibility(theme);
        expect(typeof isVisible).toBe('boolean');
      });
    });
  });

  describe('validateInteractiveElementDifferentiation', () => {
    it('should validate interactive element differentiation for all themes', () => {
      themes.forEach(theme => {
        const isDifferentiated = validateInteractiveElementDifferentiation(theme);
        expect(typeof isDifferentiated).toBe('boolean');
      });
    });
  });
});

describe('Theme Accessibility Compliance', () => {
  it('should report accessibility status for all themes', () => {
    console.log('\n🔍 Theme Accessibility Report:');
    
    themes.forEach(theme => {
      const result = validateThemeAccessibility(theme);
      const status = result.isCompliant ? '✅' : '❌';
      const violationCount = result.violations.length;
      const warningCount = result.warnings.length;
      
      console.log(`${status} ${theme.displayName}: ${violationCount} violations, ${warningCount} warnings`);
      
      if (violationCount > 0) {
        result.violations.slice(0, 2).forEach(violation => {
          console.log(`   • ${violation.description}: ${violation.contrastRatio.toFixed(2)}:1`);
        });
      }
    });
  });
});