/**
 * Theme system foundation tests
 * Validates theme data structures and basic functionality for single earth theme
 */

import { themes, getThemeById, getDefaultTheme } from '../themes';
import { ColorTheme } from '../../types';

describe('Theme System Foundation', () => {
  describe('Theme Data Structure', () => {
    it('should have exactly 1 predefined theme (earth)', () => {
      expect(themes).toHaveLength(1);
    });

    it('should include the earth theme ID', () => {
      const themeIds = themes.map(theme => theme.id);
      expect(themeIds).toContain('earth');
    });

    it('should have complete color properties for the earth theme', () => {
      themes.forEach((theme: ColorTheme) => {
        // Basic theme properties
        expect(theme.id).toBeDefined();
        expect(theme.name).toBeDefined();
        expect(theme.displayName).toBeDefined();
        expect(theme.description).toBeDefined();

        // Color properties
        expect(theme.colors.primary).toBeDefined();
        expect(theme.colors.secondary).toBeDefined();
        expect(theme.colors.accent).toBeDefined();
        expect(theme.colors.background).toBeDefined();
        expect(theme.colors.surface).toBeDefined();
        expect(theme.colors.border).toBeDefined();
        expect(theme.colors.success).toBeDefined();
        expect(theme.colors.warning).toBeDefined();
        expect(theme.colors.error).toBeDefined();
        expect(theme.colors.info).toBeDefined();

        // Text colors
        expect(theme.colors.text.primary).toBeDefined();
        expect(theme.colors.text.secondary).toBeDefined();
        expect(theme.colors.text.muted).toBeDefined();

        // Shadow properties
        expect(theme.shadows.small).toBeDefined();
        expect(theme.shadows.medium).toBeDefined();
        expect(theme.shadows.large).toBeDefined();
      });
    });
  });

  describe('Theme Utilities', () => {
    it('should get earth theme by ID correctly', () => {
      const earthTheme = getThemeById('earth');
      expect(earthTheme).toBeDefined();
      expect(earthTheme?.id).toBe('earth');
      expect(earthTheme?.displayName).toBe('Earth');

      const nonExistentTheme = getThemeById('non-existent');
      expect(nonExistentTheme).toBeUndefined();
    });

    it('should return default theme (earth)', () => {
      const defaultTheme = getDefaultTheme();
      expect(defaultTheme.id).toBe('earth');
      expect(defaultTheme.displayName).toBe('Earth');
    });
  });

  describe('Theme Color Values', () => {
    it('should have valid hex color values', () => {
      const hexColorRegex = /^#[0-9A-Fa-f]{6}$/;
      
      themes.forEach((theme: ColorTheme) => {
        expect(theme.colors.primary).toMatch(hexColorRegex);
        expect(theme.colors.secondary).toMatch(hexColorRegex);
        expect(theme.colors.accent).toMatch(hexColorRegex);
        expect(theme.colors.background).toMatch(hexColorRegex);
        expect(theme.colors.surface).toMatch(hexColorRegex);
        expect(theme.colors.text.primary).toMatch(hexColorRegex);
        expect(theme.colors.text.secondary).toMatch(hexColorRegex);
        expect(theme.colors.text.muted).toMatch(hexColorRegex);
        expect(theme.colors.border).toMatch(hexColorRegex);
        expect(theme.colors.success).toMatch(hexColorRegex);
        expect(theme.colors.warning).toMatch(hexColorRegex);
        expect(theme.colors.error).toMatch(hexColorRegex);
        expect(theme.colors.info).toMatch(hexColorRegex);
      });
    });

    it('should have earth tone colors matching the specified palette', () => {
      const earthTheme = getThemeById('earth');
      expect(earthTheme).toBeDefined();
      
      if (earthTheme) {
        // Verify specific earth tone colors
        expect(earthTheme.colors.background).toBe('#F4EFEA'); // Beige claro
        expect(earthTheme.colors.surface).toBe('#FFFFFF');    // Cards
        expect(earthTheme.colors.primary).toBe('#8B6F47');    // Café - botones
        expect(earthTheme.colors.secondary).toBe('#CBBFAE');  // Arena - acentos
        expect(earthTheme.colors.text.primary).toBe('#3F3F3F'); // Texto principal
        expect(earthTheme.colors.text.muted).toBe('#7A7A7A');   // Texto suave
      }
    });
  });
});