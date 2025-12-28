/**
 * CSS Variables utility tests
 * Validates CSS custom properties functionality
 */

import { applyCSSVariables, getCSSVariable, supportsCSSVariables } from '../cssVariables';
import { getDefaultTheme } from '../themes';

// Mock document.documentElement for testing
const mockSetProperty = jest.fn();
const mockGetComputedStyle = jest.fn();

Object.defineProperty(document, 'documentElement', {
  value: {
    style: {
      setProperty: mockSetProperty
    }
  },
  writable: true
});

Object.defineProperty(window, 'getComputedStyle', {
  value: mockGetComputedStyle,
  writable: true
});

Object.defineProperty(window, 'CSS', {
  value: {
    supports: jest.fn()
  },
  writable: true
});

describe('CSS Variables Utilities', () => {
  beforeEach(() => {
    mockSetProperty.mockClear();
    mockGetComputedStyle.mockClear();
    (window.CSS.supports as jest.Mock).mockClear();
  });

  describe('applyCSSVariables', () => {
    it('should apply all theme colors to CSS variables', async () => {
      const theme = getDefaultTheme();
      applyCSSVariables(theme);

      // Wait for requestAnimationFrame to complete
      await new Promise(resolve => requestAnimationFrame(resolve));

      // Verify primary color variables are set
      expect(mockSetProperty).toHaveBeenCalledWith('--color-primary', theme.colors.primary);
      expect(mockSetProperty).toHaveBeenCalledWith('--color-secondary', theme.colors.secondary);
      expect(mockSetProperty).toHaveBeenCalledWith('--color-accent', theme.colors.accent);
      
      // Verify background variables are set
      expect(mockSetProperty).toHaveBeenCalledWith('--color-background', theme.colors.background);
      expect(mockSetProperty).toHaveBeenCalledWith('--color-surface', theme.colors.surface);
      
      // Verify text variables are set
      expect(mockSetProperty).toHaveBeenCalledWith('--color-text-primary', theme.colors.text.primary);
      expect(mockSetProperty).toHaveBeenCalledWith('--color-text-secondary', theme.colors.text.secondary);
      expect(mockSetProperty).toHaveBeenCalledWith('--color-text-muted', theme.colors.text.muted);
      
      // Verify utility variables are set
      expect(mockSetProperty).toHaveBeenCalledWith('--color-border', theme.colors.border);
      expect(mockSetProperty).toHaveBeenCalledWith('--color-success', theme.colors.success);
      expect(mockSetProperty).toHaveBeenCalledWith('--color-warning', theme.colors.warning);
      expect(mockSetProperty).toHaveBeenCalledWith('--color-error', theme.colors.error);
      expect(mockSetProperty).toHaveBeenCalledWith('--color-info', theme.colors.info);
      
      // Verify shadow variables are set
      expect(mockSetProperty).toHaveBeenCalledWith('--shadow-small', theme.shadows.small);
      expect(mockSetProperty).toHaveBeenCalledWith('--shadow-medium', theme.shadows.medium);
      expect(mockSetProperty).toHaveBeenCalledWith('--shadow-large', theme.shadows.large);
    });
  });

  describe('getCSSVariable', () => {
    it('should get CSS variable value', () => {
      const mockValue = '#E6E6FA';
      mockGetComputedStyle.mockReturnValue({
        getPropertyValue: jest.fn().mockReturnValue(`  ${mockValue}  `)
      });

      const result = getCSSVariable('--color-primary');
      expect(result).toBe(mockValue);
      expect(mockGetComputedStyle).toHaveBeenCalledWith(document.documentElement);
    });
  });

  describe('supportsCSSVariables', () => {
    it('should return true when CSS variables are supported', () => {
      (window.CSS.supports as jest.Mock).mockReturnValue(true);
      
      const result = supportsCSSVariables();
      expect(result).toBe(true);
      expect(window.CSS.supports).toHaveBeenCalledWith('color', 'var(--test)');
    });

    it('should return false when CSS variables are not supported', () => {
      (window.CSS.supports as jest.Mock).mockReturnValue(false);
      
      const result = supportsCSSVariables();
      expect(result).toBe(false);
    });

    it('should return false when CSS.supports is not available', () => {
      Object.defineProperty(window, 'CSS', {
        value: undefined,
        writable: true
      });
      
      const result = supportsCSSVariables();
      expect(result).toBe(false);
    });
  });
});