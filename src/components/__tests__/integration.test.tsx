import { render, screen } from '@testing-library/react';
import { WishlistGrid } from '../WishlistGrid';
import { generateMockWishlistItems } from '../../data/mockData';

describe('Wishlist Components Integration', () => {
  it('renders WishlistGrid with WishlistCard components correctly', () => {
    const mockItems = generateMockWishlistItems(2);
    
    render(<WishlistGrid items={mockItems} />);
    
    // Check that the grid header is rendered
    expect(screen.getByText('Your Wishlist')).toBeInTheDocument();
    expect(screen.getByText('2 items tracked')).toBeInTheDocument();
    
    // Check that both items are rendered
    mockItems.forEach(item => {
      expect(screen.getByText(item.name)).toBeInTheDocument();
    });
  });

  it('handles empty state correctly', () => {
    render(<WishlistGrid items={[]} />);
    
    expect(screen.getByText('Your wishlist is empty')).toBeInTheDocument();
    expect(screen.getByText(/Start tracking products/)).toBeInTheDocument();
  });
});