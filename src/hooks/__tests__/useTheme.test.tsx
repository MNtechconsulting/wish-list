/**
 * useTheme Hook Tests
 * Tests for the simplified single earth theme management hook
 */

import { renderHook, act } from '@testing-library/react';
import { useTheme } from '../useTheme';
import { ThemeProvider } from '../../contexts/ThemeProvider';
import { themes } from '../../themes/themes';
import * as cssVariables from '../../themes/cssVariables';

// Mock CSS variables module
jest.mock('../../themes/cssVariables', () => ({
  applyCSSVariables: jest.fn(),
  initializeCSSVariables: jest.fn(),
}));

// Mock storage module
jest.mock('../../themes/storage', () => ({
  saveThemePreference: jest.fn(),
  loadThemePreference: jest.fn(() => ({ success: false })),
  isStorageAvailable: jest.fn(() => true),
  DEFAULT_STORAGE_KEY: 'test-theme',
}));

// Mock system theme module
jest.mock('../../themes/systemTheme', () => ({
  detectSystemTheme: jest.fn(() => null),
  createSystemThemeListener: jest.fn(() => () => {}),
  getSystemBasedDefaultTheme: jest.fn(() => 'earth'),
}));

const mockApplyCSSVariables = cssVariables.applyCSSVariables as jest.MockedFunction<typeof cssVariables.applyCSSVariables>;

describe('useTheme Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <ThemeProvider>{children}</ThemeProvider>
  );

  it('should throw error when used outside ThemeProvider', () => {
    // Suppress console.error for this test
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    
    expect(() => {
      renderHook(() => useTheme());
    }).toThrow('useTheme must be used within a ThemeProvider');
    
    consoleSpy.mockRestore();
  });

  it('should provide theme context when used within ThemeProvider', () => {
    const { result } = renderHook(() => useTheme(), { wrapper });
    
    expect(result.current.currentTheme).toBeDefined();
    expect(result.current.currentTheme.id).toBe('earth');
    expect(result.current.availableThemes).toEqual(themes);
    expect(result.current.switchTheme).toBeInstanceOf(Function);
    expect(result.current.previewTheme).toBeInstanceOf(Function);
    expect(result.current.clearPreview).toBeInstanceOf(Function);
    expect(result.current.isPreviewActive).toBe(false);
    expect(result.current.previewedTheme).toBe(null);
  });

  it('should handle switching to earth theme (no-op since it is the only theme)', () => {
    const { result } = renderHook(() => useTheme(), { wrapper });
    
    act(() => {
      result.current.switchTheme('earth');
    });
    
    expect(result.current.currentTheme.id).toBe('earth');
  });

  it('should handle preview of earth theme', () => {
    const { result } = renderHook(() => useTheme(), { wrapper });
    
    const originalTheme = result.current.currentTheme;
    
    act(() => {
      result.current.previewTheme('earth');
    });
    
    expect(result.current.isPreviewActive).toBe(true);
    expect(result.current.previewedTheme?.id).toBe('earth');
    expect(result.current.currentTheme).toBe(originalTheme); // Original theme unchanged
    expect(mockApplyCSSVariables).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'earth' })
    );
  });

  it('should clear preview and restore original theme', () => {
    const { result } = renderHook(() => useTheme(), { wrapper });
    
    const originalTheme = result.current.currentTheme;
    
    // Start preview
    act(() => {
      result.current.previewTheme('earth');
    });
    
    expect(result.current.isPreviewActive).toBe(true);
    
    // Clear preview
    act(() => {
      result.current.clearPreview();
    });
    
    expect(result.current.isPreviewActive).toBe(false);
    expect(result.current.previewedTheme).toBe(null);
    expect(mockApplyCSSVariables).toHaveBeenCalledWith(originalTheme);
  });

  it('should provide utility functions', () => {
    const { result } = renderHook(() => useTheme(), { wrapper });
    
    // Test getThemeById
    const earthTheme = result.current.getThemeById('earth');
    expect(earthTheme?.id).toBe('earth');
    
    const nonExistentTheme = result.current.getThemeById('nonexistent');
    expect(nonExistentTheme).toBeUndefined();
    
    // Test isThemeActive
    expect(result.current.isThemeActive(result.current.currentTheme.id)).toBe(true);
    expect(result.current.isThemeActive('nonexistent')).toBe(false);
  });

  it('should handle preview of non-existent theme gracefully', () => {
    const { result } = renderHook(() => useTheme(), { wrapper });
    
    const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
    
    act(() => {
      result.current.previewTheme('nonexistent');
    });
    
    expect(result.current.isPreviewActive).toBe(false);
    expect(consoleSpy).toHaveBeenCalledWith(
      'Theme with id "nonexistent" not found for preview'
    );
    
    consoleSpy.mockRestore();
  });

  it('should handle switching to non-existent theme gracefully', () => {
    const { result } = renderHook(() => useTheme(), { wrapper });
    
    const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
    const originalTheme = result.current.currentTheme;
    
    act(() => {
      result.current.switchTheme('nonexistent');
    });
    
    // Theme should remain unchanged
    expect(result.current.currentTheme).toBe(originalTheme);
    expect(consoleSpy).toHaveBeenCalledWith(
      'Theme with id "nonexistent" not found'
    );
    
    consoleSpy.mockRestore();
  });

  it('should track active theme correctly during preview', () => {
    const { result } = renderHook(() => useTheme(), { wrapper });
    
    const originalThemeId = result.current.currentTheme.id;
    
    // Initially, current theme is active
    expect(result.current.isThemeActive(originalThemeId)).toBe(true);
    expect(result.current.isThemeActive('nonexistent')).toBe(false);
    
    // During preview, previewed theme is considered active
    act(() => {
      result.current.previewTheme('earth');
    });
    
    expect(result.current.isThemeActive('earth')).toBe(true);
    
    // After clearing preview, original theme is active again
    act(() => {
      result.current.clearPreview();
    });
    
    expect(result.current.isThemeActive(originalThemeId)).toBe(true);
  });
});