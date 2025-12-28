import React, { useEffect, useState } from 'react';
import { ModalProps } from '../../types';

/**
 * Reusable Modal component with backdrop and pastel styling
 * Handles focus management and escape key functionality
 * Enhanced with smooth transitions and animations
 */
export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  ...props
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);

  // Handle modal visibility with smooth transitions
  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      // Small delay to allow DOM to update before showing animation
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 10);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
      // Wait for animation to complete before removing from DOM
      const timer = setTimeout(() => {
        setShouldRender(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Handle escape key press
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);
  
  if (!shouldRender) return null;
  
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };
  
  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      {...props}
    >
      {/* Backdrop with fade transition */}
      <div 
        className={`absolute inset-0 bg-black transition-opacity duration-300 ease-in-out ${
          isVisible ? 'bg-opacity-50' : 'bg-opacity-0'
        }`}
        onClick={handleBackdropClick}
      />
      
      {/* Modal Content with scale and fade transition */}
      <div className={`relative theme-surface rounded-2xl shadow-theme-large w-full max-h-[90vh] overflow-y-auto transition-all duration-300 ease-in-out theme-transition ${
        isVisible 
          ? 'opacity-100 scale-100 translate-y-0' 
          : 'opacity-0 scale-95 translate-y-4'
      } max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl`}>
        {/* Header */}
        {title && (
          <div className="flex items-center justify-between p-6 border-b theme-border">
            <h2 className="text-xl font-semibold text-theme-text-primary">
              {title}
            </h2>
            <button
              onClick={onClose}
              className="text-theme-text-muted hover:text-theme-text-primary transition-colors duration-200 p-2 rounded-lg hover:bg-theme-background transform hover:scale-110 min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label="Close modal"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
        
        {/* Body */}
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
};