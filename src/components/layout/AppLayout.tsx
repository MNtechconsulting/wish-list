import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { NavigationItem } from '../../types';

interface AppLayoutProps {
  children: React.ReactNode;
  currentPath: string;
  pageTitle: string;
  navigationItems: NavigationItem[];
  userEmail?: string;
}

/**
 * Main application layout wrapper
 * Manages sidebar state and provides consistent layout structure
 */
export const AppLayout: React.FC<AppLayoutProps> = ({
  children,
  currentPath,
  pageTitle,
  navigationItems,
  userEmail
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-theme-background via-theme-surface to-theme-primary/5 theme-transition">
      <div className="flex h-screen">
        {/* Sidebar */}
        <Sidebar
          isOpen={sidebarOpen}
          onToggle={toggleSidebar}
          currentPath={currentPath}
          navigationItems={navigationItems}
        />
        
        {/* Main content area */}
        <div className="flex-1 flex flex-col overflow-hidden lg:ml-0">
          {/* Header */}
          <Header
            title={pageTitle}
            onMenuToggle={toggleSidebar}
            userEmail={userEmail}
          />
          
          {/* Page content */}
          <main className="flex-1 overflow-y-auto p-4 lg:p-6">
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};