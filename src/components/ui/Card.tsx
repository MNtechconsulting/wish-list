import React from 'react';
import { CardProps } from '../../types';

/**
 * Reusable Card component with pastel styling
 * Provides consistent rounded corners, shadows, and hover effects
 */
export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  onClick,
  ...props
}) => {
  const baseClasses = 'theme-surface rounded-2xl shadow-theme-small border theme-border transition-all duration-200 theme-transition';
  const interactiveClasses = onClick ? 'cursor-pointer hover:shadow-theme-medium hover:scale-[1.02] active:scale-[0.98]' : '';
  
  const classes = `${baseClasses} ${interactiveClasses} ${className}`.trim();
  
  return (
    <div
      className={classes}
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  );
};