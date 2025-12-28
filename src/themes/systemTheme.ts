/**
 * System theme detection utilities
 * Handles detection of user's system color scheme preference
 */

export type SystemTheme = 'light' | 'dark' | null;

/**
 * Detect the user's system color scheme preference
 */
export const detectSystemTheme = (): SystemTheme => {
  if (typeof window === 'undefined' || !window.matchMedia) {
    return null;
  }

  try {
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    if (window.matchMedia('(prefers-color-scheme: light)').matches) {
      return 'light';
    }
    return null;
  } catch (error) {
    console.warn('Failed to detect system theme:', error);
    return null;
  }
};

/**
 * Create a listener for system theme changes
 */
export const createSystemThemeListener = (callback: (theme: SystemTheme) => void): (() => void) => {
  if (typeof window === 'undefined' || !window.matchMedia) {
    return () => {}; // No-op cleanup function
  }

  const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
  const lightModeQuery = window.matchMedia('(prefers-color-scheme: light)');

  const handleChange = () => {
    callback(detectSystemTheme());
  };

  try {
    darkModeQuery.addEventListener('change', handleChange);
    lightModeQuery.addEventListener('change', handleChange);

    // Return cleanup function
    return () => {
      darkModeQuery.removeEventListener('change', handleChange);
      lightModeQuery.removeEventListener('change', handleChange);
    };
  } catch (error) {
    console.warn('Failed to create system theme listener:', error);
    return () => {}; // No-op cleanup function
  }
};

/**
 * Get the default theme ID based on system preference
 */
export const getSystemBasedDefaultTheme = (): string => {
  const systemTheme = detectSystemTheme();
  
  switch (systemTheme) {
    case 'dark':
      return 'dark';
    case 'light':
      return 'light';
    default:
      return 'pastel'; // Fallback to pastel theme
  }
};