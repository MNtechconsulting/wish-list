/**
 * Example usage of the useTheme hook
 * This file demonstrates how to use the comprehensive theme management hook
 */

import React from 'react';
import { useTheme } from './useTheme';

/**
 * Example component showing basic theme usage
 */
export const BasicThemeExample: React.FC = () => {
  const { currentTheme, switchTheme, availableThemes } = useTheme();

  return (
    <div>
      <h2>Current Theme: {currentTheme.displayName}</h2>
      <div>
        {availableThemes.map((theme) => (
          <button
            key={theme.id}
            onClick={() => switchTheme(theme.id)}
            style={{
              backgroundColor: theme.colors.primary,
              color: theme.colors.text.primary,
              margin: '4px',
              padding: '8px 16px',
              border: 'none',
              borderRadius: '4px',
            }}
          >
            {theme.displayName}
          </button>
        ))}
      </div>
    </div>
  );
};

/**
 * Example component showing theme preview functionality
 */
export const ThemePreviewExample: React.FC = () => {
  const {
    currentTheme,
    switchTheme,
    previewTheme,
    clearPreview,
    isPreviewActive,
    previewedTheme,
    availableThemes,
    isThemeActive,
  } = useTheme();

  return (
    <div>
      <h2>Theme Preview Demo</h2>
      
      <div>
        <strong>Current Theme:</strong> {currentTheme.displayName}
        {isPreviewActive && previewedTheme && (
          <span> (Previewing: {previewedTheme.displayName})</span>
        )}
      </div>

      <div style={{ margin: '16px 0' }}>
        {availableThemes.map((theme) => (
          <div key={theme.id} style={{ margin: '8px 0' }}>
            <button
              onClick={() => previewTheme(theme.id)}
              style={{
                backgroundColor: theme.colors.primary,
                color: theme.colors.text.primary,
                margin: '4px',
                padding: '8px 16px',
                border: isThemeActive(theme.id) ? '2px solid black' : 'none',
                borderRadius: '4px',
              }}
            >
              Preview {theme.displayName}
            </button>
            
            <button
              onClick={() => switchTheme(theme.id)}
              style={{
                backgroundColor: theme.colors.secondary,
                color: theme.colors.text.primary,
                margin: '4px',
                padding: '8px 16px',
                border: 'none',
                borderRadius: '4px',
              }}
            >
              Select {theme.displayName}
            </button>
          </div>
        ))}
      </div>

      {isPreviewActive && (
        <button
          onClick={clearPreview}
          style={{
            backgroundColor: '#ff6b6b',
            color: 'white',
            padding: '8px 16px',
            border: 'none',
            borderRadius: '4px',
            margin: '8px 0',
          }}
        >
          Clear Preview
        </button>
      )}
    </div>
  );
};

/**
 * Example component showing utility functions
 */
export const ThemeUtilsExample: React.FC = () => {
  const { getThemeById, isThemeActive, currentTheme } = useTheme();

  const darkTheme = getThemeById('dark');
  const lightTheme = getThemeById('light');

  return (
    <div>
      <h2>Theme Utilities Demo</h2>
      
      <div>
        <strong>Current Theme ID:</strong> {currentTheme.id}
      </div>
      
      <div>
        <strong>Dark Theme Available:</strong> {darkTheme ? 'Yes' : 'No'}
        {darkTheme && (
          <span> - {darkTheme.displayName} ({darkTheme.description})</span>
        )}
      </div>
      
      <div>
        <strong>Light Theme Available:</strong> {lightTheme ? 'Yes' : 'No'}
        {lightTheme && (
          <span> - {lightTheme.displayName} ({lightTheme.description})</span>
        )}
      </div>
      
      <div>
        <strong>Is Dark Theme Active:</strong> {isThemeActive('dark') ? 'Yes' : 'No'}
      </div>
      
      <div>
        <strong>Is Light Theme Active:</strong> {isThemeActive('light') ? 'Yes' : 'No'}
      </div>
    </div>
  );
};