import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from '../App';

/**
 * Basic routing integration tests
 * Tests that routes render correctly and navigation works
 * Requirements: 9.1, 9.3, 9.4
 */

// Helper function to render App with routing
const renderWithRouter = (initialEntries: string[] = ['/']) => {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <App />
    </MemoryRouter>
  );
};

describe('App Routing Integration', () => {
  it('renders landing page at root path', () => {
    renderWithRouter(['/']);
    
    // Check for landing page content
    expect(screen.getByText('Wishlist')).toBeInTheDocument();
    expect(screen.getByText('Tracker')).toBeInTheDocument();
    expect(screen.getByText('Get Started')).toBeInTheDocument();
  });

  it('renders dashboard at /dashboard path', () => {
    renderWithRouter(['/dashboard']);
    
    // Check for dashboard layout elements - use getAllByText to handle multiple instances
    const dashboardElements = screen.getAllByText('Dashboard');
    expect(dashboardElements.length).toBeGreaterThan(0);
    
    const wishlistElements = screen.getAllByText('My Wishlist');
    expect(wishlistElements.length).toBeGreaterThan(0);
    
    // Check for specific dashboard content
    expect(screen.getByText('Track products you want to buy and monitor their price changes')).toBeInTheDocument();
  });

  it('renders dashboard at /wishlist path (alias)', () => {
    renderWithRouter(['/wishlist']);
    
    // Check for dashboard layout elements - use getAllByText to handle multiple instances
    const dashboardElements = screen.getAllByText('Dashboard');
    expect(dashboardElements.length).toBeGreaterThan(0);
    
    const wishlistElements = screen.getAllByText('My Wishlist');
    expect(wishlistElements.length).toBeGreaterThan(0);
    
    // Check for specific dashboard content
    expect(screen.getByText('Track products you want to buy and monitor their price changes')).toBeInTheDocument();
  });

  it('renders item detail page with valid item ID', () => {
    // Use a mock item ID that should exist in default data
    renderWithRouter(['/item/1']);
    
    // Check for item detail layout
    const itemDetailElements = screen.getAllByText('Item Details');
    expect(itemDetailElements.length).toBeGreaterThan(0);
  });

  it('handles invalid item ID gracefully', () => {
    renderWithRouter(['/item/nonexistent']);
    
    // Should show item not found message
    expect(screen.getByText('Item Not Found')).toBeInTheDocument();
    expect(screen.getByText('Back to Dashboard')).toBeInTheDocument();
  });
});