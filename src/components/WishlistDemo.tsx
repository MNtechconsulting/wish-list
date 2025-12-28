import React, { useState } from 'react';
import { WishlistGrid } from './WishlistGrid';
import { generateMockWishlistItems } from '../data/mockData';
import { WishlistItem } from '../types';
import { Button } from './ui/Button';

/**
 * Demo component to showcase WishlistGrid and WishlistCard functionality
 * This can be used for testing and development purposes
 */
export const WishlistDemo: React.FC = () => {
  const [items, setItems] = useState<WishlistItem[]>(() => generateMockWishlistItems(3));

  const handleItemClick = (id: string) => {
    console.log('Item clicked:', id);
    // In a real app, this would navigate to the item detail page
    alert(`Navigating to item: ${items.find(item => item.id === id)?.name}`);
  };

  const handleAddItem = () => {
    console.log('Add item clicked');
    // In a real app, this would open the add item modal/form
    alert('Add item functionality would open here');
  };

  const handleClearItems = () => {
    setItems([]);
  };

  const handleResetItems = () => {
    setItems(generateMockWishlistItems(3));
  };

  return (
    <div className="min-h-screen bg-theme-background p-6 theme-transition">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-theme-text-primary mb-4 theme-transition">
            Wishlist Components Demo
          </h1>
          <div className="flex gap-4">
            <Button
              onClick={handleClearItems}
              variant="secondary"
            >
              Clear Items (Test Empty State)
            </Button>
            <Button
              onClick={handleResetItems}
              variant="accent"
            >
              Reset Items
            </Button>
          </div>
        </div>

        <WishlistGrid
          items={items}
          onItemClick={handleItemClick}
          onAddItemClick={handleAddItem}
        />
      </div>
    </div>
  );
};