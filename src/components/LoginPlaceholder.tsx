import React from 'react';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';

interface LoginPlaceholderProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Placeholder login interface component
 * Displays a "coming soon" message for future login functionality
 * Requirements: 10.3, 10.4
 */
export const LoginPlaceholder: React.FC<LoginPlaceholderProps> = ({ isOpen, onClose }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Login">
      <div className="text-center py-8">
        <div className="mb-4">
          <div className="w-16 h-16 mx-auto bg-theme-primary/10 rounded-full flex items-center justify-center mb-4 theme-transition">
            <svg className="w-8 h-8 text-theme-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-theme-text-primary mb-2 theme-transition">Login Coming Soon</h3>
          <p className="text-theme-text-secondary mb-6 theme-transition">
            User authentication and account management features are currently in development. 
            Stay tuned for personalized wishlist management!
          </p>
        </div>
        <Button
          onClick={onClose}
          variant="primary"
        >
          Got it
        </Button>
      </div>
    </Modal>
  );
};