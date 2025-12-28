import { render, screen, fireEvent } from '@testing-library/react';
import { WishlistCard } from '../WishlistCard';
import { generateMockWishlistItem } from '../../data/mockData';

describe('WishlistCard', () => {
  const mockItem = generateMockWishlistItem({
    name: 'Test Product',
    currentPrice: 99.99,
    originalPrice: 120.00,
    trend: 'down',
    daysTracked: 5
  });

  it('displays product name, current price, and days tracked', () => {
    render(<WishlistCard item={mockItem} />);
    
    expect(screen.getByText('Test Product')).toBeInTheDocument();
    expect(screen.getByText('$99.99')).toBeInTheDocument();
    // Check for the specific paragraph element with the tracking info
    expect(screen.getByText((_content, element) => {
      return element?.tagName === 'P' && element?.textContent === 'Tracked for 5 days';
    })).toBeInTheDocument();
  });

  it('shows correct trend indicator for downward trend', () => {
    render(<WishlistCard item={mockItem} />);
    
    expect(screen.getByText('Price Down')).toBeInTheDocument();
  });

  it('calls onClick handler when clicked', () => {
    const mockOnClick = jest.fn();
    render(<WishlistCard item={mockItem} onClick={mockOnClick} />);
    
    // Click on the card div (not looking for button role since it's a div with onClick)
    const cardElement = screen.getByText('Test Product').closest('div');
    fireEvent.click(cardElement!);
    expect(mockOnClick).toHaveBeenCalledWith(mockItem.id);
  });

  it('displays original price when different from current price', () => {
    render(<WishlistCard item={mockItem} />);
    
    expect(screen.getByText('Original: $120.00')).toBeInTheDocument();
  });
});