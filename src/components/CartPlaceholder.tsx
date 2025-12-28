import React from 'react';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';

interface CartPlaceholderProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Placeholder cart interface component
 * Displays a "coming soon" message for future shopping cart functionality
 * Requirements: 11.3, 11.4
 */
export const CartPlaceholder: React.FC<CartPlaceholderProps> = ({ isOpen, onClose }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Shopping Cart">
      <div className="text-center py-8">
        <div className="mb-4">
          <div className="w-16 h-16 mx-auto bg-theme-accent/10 rounded-full flex items-center justify-center mb-4 theme-transition">
            <svg className="w-8 h-8 text-theme-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.293 2.293A1 1 0 005 16h12M7 13v4a2 2 0 002 2h6a2 2 0 002-2v-4m-8 5a1 1 0 11-2 0 1 1 0 012 0zm8 0a1 1 0 11-2 0 1 1 0 012 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-theme-text-primary mb-2 theme-transition">Shopping Cart Coming Soon</h3>
          <p className="text-theme-text-secondary mb-6 theme-transition">
            Shopping cart functionality and purchase management features are currently in development. 
            Soon you'll be able to move items from your wishlist to your cart!
          </p>
        </div>
        <Button
          onClick={onClose}
          variant="accent"
        >
          Got it
        </Button>
      </div>
    </Modal>
  );
};