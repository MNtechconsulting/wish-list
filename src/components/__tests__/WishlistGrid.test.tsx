import { render, screen, fireEvent } from '@testing-library/react';
import { WishlistGrid } from '../WishlistGrid';
import { generateMockWishlistItems } from '../../data/mockData';

describe('WishlistGrid', () => {
  it('displays empty state when no items exist', () => {
    const mockOnAddItem = jest.fn();
    render(<WishlistGrid items={[]} onAddItemClick={mockOnAddItem} />);
    
    expect(screen.getByText('Your wishlist is empty')).toBeInTheDocument();
    expect(screen.getByText('Add Your First Item')).toBeInTheDocument();
  });

  it('displays items in grid layout', () => {
    const mockItems = generateMockWishlistItems(3);
    render(<WishlistGrid items={mockItems} />);
    
    expect(screen.getByText('Your Wishlist')).toBeInTheDocument();
    expect(screen.getByText('3 items tracked')).toBeInTheDocument();
    
    // Should render the correct number of cards
    const cards = screen.getAllByRole('heading', { level: 3 });
    expect(cards).toHaveLength(3);
  });

  it('calls onAddItemClick when add button is clicked', () => {
    const mockOnAddItem = jest.fn();
    const mockItems = generateMockWishlistItems(2);
    
    render(<WishlistGrid items={mockItems} onAddItemClick={mockOnAddItem} />);
    
    fireEvent.click(screen.getByText('Add Item'));
    expect(mockOnAddItem).toHaveBeenCalled();
  });

  it('calls onItemClick when item is clicked', () => {
    const mockOnItemClick = jest.fn();
    const mockItems = generateMockWishlistItems(1);
    
    render(<WishlistGrid items={mockItems} onItemClick={mockOnItemClick} />);
    
    // Click on the item card
    const itemCard = screen.getByText(mockItems[0].name).closest('div');
    if (itemCard) {
      fireEvent.click(itemCard);
      expect(mockOnItemClick).toHaveBeenCalledWith(mockItems[0].id);
    }
  });

  it('displays correct singular/plural text for item count', () => {
    const singleItem = generateMockWishlistItems(1);
    const { rerender } = render(<WishlistGrid items={singleItem} />);
    
    expect(screen.getByText('1 item tracked')).toBeInTheDocument();
    
    const multipleItems = generateMockWishlistItems(3);
    rerender(<WishlistGrid items={multipleItems} />);
    
    expect(screen.getByText('3 items tracked')).toBeInTheDocument();
  });
});