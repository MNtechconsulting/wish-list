/**
 * Predefined theme definitions
 * Simplified to use a single earth tone palette with excellent accessibility
 */

import { ColorTheme } from '../types';

export const themes: ColorTheme[] = [
  {
    id: 'earth',
    name: 'earth',
    displayName: 'Earth',
    description: 'Tonos tierra cálidos con beige claro y café',
    colors: {
      primary: '#8B6F47',   // Café - botones
      secondary: '#CBBFAE', // Arena - acentos
      accent: '#6B5B73',    // Muted purple for variety
      background: '#F4EFEA', // Beige claro - fondo principal
      surface: '#FFFFFF',   // Blanco puro - cards
      text: {
        primary: '#3F3F3F',   // Texto principal
        secondary: '#5A5A5A', // Medium gray
        muted: '#7A7A7A'      // Texto suave
      },
      border: '#E0D5C7',     // Subtle earth tone border
      success: '#6B8E23',    // Olive green
      warning: '#CD853F',    // Peru/sandy brown
      error: '#A0522D',      // Sienna brown
      info: '#708090'        // Slate gray
    },
    shadows: {
      small: '0 1px 3px 0 rgba(63, 63, 63, 0.1), 0 1px 2px 0 rgba(63, 63, 63, 0.06)',
      medium: '0 4px 6px -1px rgba(63, 63, 63, 0.1), 0 2px 4px -1px rgba(63, 63, 63, 0.06)',
      large: '0 10px 15px -3px rgba(63, 63, 63, 0.1), 0 4px 6px -2px rgba(63, 63, 63, 0.05)'
    }
  }
];

/**
 * Get a theme by its ID
 */
export const getThemeById = (id: string): ColorTheme | undefined => {
  return themes.find(theme => theme.id === id);
};

/**
 * Get the default theme (earth)
 */
export const getDefaultTheme = (): ColorTheme => {
  return themes[0]; // Earth theme
};