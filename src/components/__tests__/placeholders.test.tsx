import { render, screen, fireEvent } from '@testing-library/react';
import { LoginPlaceholder } from '../LoginPlaceholder';
import { CartPlaceholder } from '../CartPlaceholder';

/**
 * Tests for placeholder components
 * Verifies that login and cart placeholders display correctly and handle interactions
 * Requirements: 10.3, 10.4, 11.3, 11.4
 */

describe('LoginPlaceholder', () => {
  it('displays login coming soon message when open', () => {
    const mockOnClose = jest.fn();
    
    render(<LoginPlaceholder isOpen={true} onClose={mockOnClose} />);
    
    expect(screen.getByText('Login Coming Soon')).toBeInTheDocument();
    expect(screen.getByText(/User authentication and account management features/)).toBeInTheDocument();
    expect(screen.getByText('Got it')).toBeInTheDocument();
  });

  it('calls onClose when Got it button is clicked', () => {
    const mockOnClose = jest.fn();
    
    render(<LoginPlaceholder isOpen={true} onClose={mockOnClose} />);
    
    const gotItButton = screen.getByText('Got it');
    fireEvent.click(gotItButton);
    
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('does not render when isOpen is false', () => {
    const mockOnClose = jest.fn();
    
    render(<LoginPlaceholder isOpen={false} onClose={mockOnClose} />);
    
    expect(screen.queryByText('Login Coming Soon')).not.toBeInTheDocument();
  });
});

describe('CartPlaceholder', () => {
  it('displays cart coming soon message when open', () => {
    const mockOnClose = jest.fn();
    
    render(<CartPlaceholder isOpen={true} onClose={mockOnClose} />);
    
    expect(screen.getByText('Shopping Cart Coming Soon')).toBeInTheDocument();
    expect(screen.getByText(/Shopping cart functionality and purchase management/)).toBeInTheDocument();
    expect(screen.getByText('Got it')).toBeInTheDocument();
  });

  it('calls onClose when Got it button is clicked', () => {
    const mockOnClose = jest.fn();
    
    render(<CartPlaceholder isOpen={true} onClose={mockOnClose} />);
    
    const gotItButton = screen.getByText('Got it');
    fireEvent.click(gotItButton);
    
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('does not render when isOpen is false', () => {
    const mockOnClose = jest.fn();
    
    render(<CartPlaceholder isOpen={false} onClose={mockOnClose} />);
    
    expect(screen.queryByText('Shopping Cart Coming Soon')).not.toBeInTheDocument();
  });
});