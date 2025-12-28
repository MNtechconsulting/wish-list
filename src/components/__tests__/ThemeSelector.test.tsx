/**
 * ThemeSelector Component Tests
 * Tests for simplified single earth theme display component
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeSelector } from '../ThemeSelector';
import { ThemeProvider } from '../../contexts/ThemeProvider';

// Mock theme context for testing
const renderWithTheme = (component: React.ReactElement) => {
  return render(
    <ThemeProvider defaultTheme="earth">
      {component}
    </ThemeProvider>
  );
};

describe('ThemeSelector', () => {
  describe('Basic rendering', () => {
    it('should render earth theme information', () => {
      renderWithTheme(<ThemeSelector />);

      // Should display the earth theme name
      expect(screen.getByText('Earth')).toBeInTheDocument();
      
      // Should display the theme description
      expect(screen.getByText('Tonos tierra cálidos con beige claro y café')).toBeInTheDocument();
    });

    it('should display color swatches', () => {
      renderWithTheme(<ThemeSelector />);

      // Should have primary and secondary color swatches
      const primaryColorSwatch = screen.getByTitle('Primary color');
      const secondaryColorSwatch = screen.getByTitle('Secondary color');
      
      expect(primaryColorSwatch).toBeInTheDocument();
      expect(secondaryColorSwatch).toBeInTheDocument();
    });

    it('should show accessibility indicator', () => {
      renderWithTheme(<ThemeSelector />);

      // Should have accessibility indicator (warning or check)
      const accessibilityIndicator = screen.getByTitle(/accessibility/i);
      expect(accessibilityIndicator).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should provide color tooltips for accessibility', () => {
      renderWithTheme(<ThemeSelector showPreview={true} />);

      // Color swatches should have title attributes for tooltips
      const primaryColorSwatch = screen.getByTitle('Primary color');
      const secondaryColorSwatch = screen.getByTitle('Secondary color');
      
      expect(primaryColorSwatch).toBeInTheDocument();
      expect(secondaryColorSwatch).toBeInTheDocument();
    });

    it('should have accessibility status tooltip', () => {
      renderWithTheme(<ThemeSelector />);

      // Should have accessibility status tooltip
      const accessibilityIndicator = screen.getByTitle(/accessibility/i);
      expect(accessibilityIndicator).toBeInTheDocument();
    });
  });

  describe('Variants', () => {
    it('should render with dropdown variant', () => {
      renderWithTheme(<ThemeSelector variant="dropdown" />);
      expect(screen.getByText('Earth')).toBeInTheDocument();
    });

    it('should render with modal variant', () => {
      renderWithTheme(<ThemeSelector variant="modal" />);
      expect(screen.getByText('Earth')).toBeInTheDocument();
    });

    it('should render with inline variant', () => {
      renderWithTheme(<ThemeSelector variant="inline" />);
      expect(screen.getByText('Earth')).toBeInTheDocument();
    });
  });

  describe('Props', () => {
    it('should apply custom className', () => {
      const { container } = renderWithTheme(
        <ThemeSelector className="custom-class" />
      );
      
      expect(container.firstChild).toHaveClass('custom-class');
    });

    it('should handle showPreview prop', () => {
      renderWithTheme(<ThemeSelector showPreview={false} />);
      
      // Component should still render normally
      expect(screen.getByText('Earth')).toBeInTheDocument();
    });
  });

  describe('Mobile responsiveness', () => {
    beforeEach(() => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });
      Object.defineProperty(window, 'innerHeight', {
        writable: true,
        configurable: true,
        value: 667,
      });
    });

    it('should render properly on mobile viewport', () => {
      renderWithTheme(<ThemeSelector />);
      
      // Component should render without errors on mobile
      expect(screen.getByText('Earth')).toBeInTheDocument();
      expect(screen.getByText('Tonos tierra cálidos con beige claro y café')).toBeInTheDocument();
    });

    it('should handle orientation changes', () => {
      renderWithTheme(<ThemeSelector />);
      
      // Simulate orientation change
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 667,
      });
      Object.defineProperty(window, 'innerHeight', {
        writable: true,
        configurable: true,
        value: 375,
      });
      
      fireEvent(window, new Event('resize'));
      
      // Component should still be functional
      expect(screen.getByText('Earth')).toBeInTheDocument();
    });
  });
});