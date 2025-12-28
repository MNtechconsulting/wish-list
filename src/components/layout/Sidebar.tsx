import React from 'react';
import { Link } from 'react-router-dom';
import { NavigationItem } from '../../types';
import { ThemeSelector } from '../ThemeSelector';
import { Logo } from '../Logo';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  currentPath: string;
  navigationItems: NavigationItem[];
}

/**
 * Responsive Sidebar component with navigation
 * Adapts to mobile with toggle functionality and active states
 * Uses React Router Link for proper client-side navigation
 * Requirements: 9.2, 9.5
 */
export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onToggle,
  currentPath,
  navigationItems
}) => {
  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        fixed top-0 left-0 h-full theme-surface shadow-theme-large z-50 transition-transform duration-300 ease-in-out theme-transition
        lg:relative lg:translate-x-0 lg:shadow-none lg:border-r theme-border
        w-64 lg:w-64
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b theme-border theme-transition">
          <Link 
            to="/dashboard"
            className="hover:opacity-80 transition-opacity theme-transition"
          >
            <Logo size="small" showText={true} />
          </Link>
          <button
            onClick={onToggle}
            className="lg:hidden p-2 rounded-lg hover:bg-theme-background transition-colors theme-transition"
            aria-label="Close sidebar"
          >
            <svg className="w-5 h-5 text-theme-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* Navigation */}
        <nav className="p-4 space-y-2">
          {navigationItems.map((item) => {
            const isActive = currentPath === item.path;
            
            // Handle placeholder items with onClick handlers
            if (item.isPlaceholder && item.onClick) {
              return (
                <button
                  key={item.path}
                  onClick={item.onClick}
                  className={`
                    w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 text-left theme-transition
                    text-theme-text-muted hover:bg-theme-background hover:text-theme-text-primary
                  `}
                >
                  {item.icon && (
                    <item.icon className="w-5 h-5 text-theme-text-muted" />
                  )}
                  <span className="font-medium">{item.label}</span>
                </button>
              );
            }
            
            // Handle regular navigation items
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`
                  flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 theme-transition
                  ${isActive 
                    ? 'bg-theme-primary/10 text-theme-primary border border-theme-primary/20' 
                    : 'text-theme-text-muted hover:bg-theme-background hover:text-theme-text-primary'
                  }
                `}
                onClick={onToggle} // Close sidebar on mobile when navigating
              >
                {item.icon && (
                  <item.icon className={`w-5 h-5 ${isActive ? 'text-theme-primary' : 'text-theme-text-muted'} theme-transition`} />
                )}
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>
        
        {/* Theme Selector for mobile - at bottom of sidebar */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t theme-border sm:hidden">
          <div className="text-xs text-theme-text-muted mb-2 font-medium">Theme</div>
          <ThemeSelector 
            variant="dropdown" 
            showPreview={true}
            className="w-full"
          />
        </div>
      </div>
    </>
  );
};