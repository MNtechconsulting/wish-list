import React from 'react';
import { ButtonProps } from '../../types';

/**
 * Reusable Button component with pastel styling variants
 * Supports different sizes and variants with consistent design system
 * Enhanced with loading states and micro-interactions
 */
export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  children,
  onClick,
  disabled = false,
  type = 'button',
  className = '',
  loading = false,
  ...props
}) => {
  const baseClasses = 'font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95 relative overflow-hidden theme-transition';
  
  const variantClasses = {
    primary: 'bg-theme-primary hover:bg-theme-primary/90 text-white focus:ring-theme-primary/30 shadow-theme-small hover:shadow-theme-medium theme-transition',
    secondary: 'bg-theme-surface hover:bg-theme-surface/90 text-theme-text-primary focus:ring-theme-primary/30 border border-theme-border hover:border-theme-primary theme-transition',
    accent: 'bg-theme-accent hover:bg-theme-accent/90 text-white focus:ring-theme-accent/30 shadow-theme-small hover:shadow-theme-medium theme-transition'
  };
  
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  };
  
  const classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`.trim();
  
  const isDisabled = disabled || loading;
  
  return (
    <button
      type={type}
      className={classes}
      onClick={onClick}
      disabled={isDisabled}
      {...props}
    >
      {/* Loading spinner overlay */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-inherit">
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin opacity-75"></div>
        </div>
      )}
      
      {/* Button content */}
      <span className={loading ? 'opacity-0' : 'opacity-100'}>
        {children}
      </span>
    </button>
  );
};