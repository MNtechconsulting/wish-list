import React from 'react';
import { ThemeSelector } from '../ThemeSelector';

interface HeaderProps {
  title: string;
  onMenuToggle: () => void;
  showMenuButton?: boolean;
  userEmail?: string;
}

/**
 * Header component with branding and mobile menu toggle
 * Provides consistent top navigation across all pages
 */
export const Header: React.FC<HeaderProps> = ({
  title,
  onMenuToggle,
  showMenuButton = true,
  userEmail
}) => {
  return (
    <header className="theme-surface border-b theme-border px-4 py-4 lg:px-6 theme-transition">
      <div className="flex items-center justify-between">
        {/* Mobile menu button */}
        {showMenuButton && (
          <button
            onClick={onMenuToggle}
            className="lg:hidden p-2 rounded-lg hover:bg-theme-background transition-colors theme-transition"
            aria-label="Open sidebar"
          >
            <svg className="w-6 h-6 text-theme-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        )}
        
        {/* Page title */}
        <h1 className="text-xl font-semibold text-theme-text-primary lg:text-2xl theme-transition">
          {title}
        </h1>
        
        {/* Right side - user info and theme selector */}
        <div className="flex items-center space-x-4">
          {/* Theme Selector */}
          <ThemeSelector 
            variant="dropdown" 
            showPreview={true}
            className="hidden sm:block"
          />
          
          {userEmail && (
            <div className="hidden md:block text-sm text-theme-text-muted theme-transition">
              Welcome, {userEmail}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};