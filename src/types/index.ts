/**
 * Core TypeScript interfaces for the Wishlist App
 * Defines data structures for wishlist items, price tracking, and application state
 */

import * as React from 'react';

export interface PricePoint {
  date: Date;
  price: number;
}

export interface WishlistItem {
  id: string;
  name: string;
  currentPrice: number;
  originalPrice: number;
  priceHistory: PricePoint[];
  trend: 'up' | 'down' | 'flat';
  dateAdded: Date;
  daysTracked: number;
  productUrl?: string;
  imageUrl?: string;
  collectionId: string;
}

export interface WishlistCollection {
  id: string;
  name: string;
  description?: string;
  color?: string;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
  itemCount: number;
  items?: WishlistItem[];
}

// Theme system interfaces
export interface ColorTheme {
  id: string;
  name: string;
  displayName: string;
  description: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: {
      primary: string;
      secondary: string;
      muted: string;
    };
    border: string;
    success: string;
    warning: string;
    error: string;
    info: string;
  };
  shadows: {
    small: string;
    medium: string;
    large: string;
  };
}

export interface ThemeContextType {
  currentTheme: ColorTheme;
  availableThemes: ColorTheme[];
  setTheme: (themeId: string) => void;
  systemTheme: 'light' | 'dark' | null;
  isSystemThemeDetected: boolean;
}

export interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: string;
  storageKey?: string;
}

export interface ThemeSelectorProps {
  variant?: 'dropdown' | 'modal' | 'inline';
  showPreview?: boolean;
  className?: string;
}

// Legacy interface for backward compatibility
export interface AppTheme {
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
  };
}

export interface UserPreferences {
  theme: 'light' | 'dark';
  currency: string;
}

export interface AppMetadata {
  version: string;
  lastUpdated: Date;
}

export interface StorageSchema {
  wishlistCollections: WishlistCollection[];
  wishlistItems: WishlistItem[];
  userPreferences: UserPreferences;
  appMetadata: AppMetadata;
}

// Form-related types
export interface AddItemFormData {
  name: string;
  price: string;
  productUrl?: string;
  collectionId: string;
}

export interface CreateCollectionFormData {
  name: string;
  description?: string;
  color?: string;
  isDefault?: boolean;
}

export interface FormValidationErrors {
  name?: string;
  price?: string;
  productUrl?: string;
  collectionId?: string;
  description?: string;
  color?: string;
}

// UI Component prop types
export interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'accent';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  onClick?: (e?: React.MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
  loading?: boolean;
}

export interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export interface InputProps {
  type?: 'text' | 'number' | 'email' | 'url';
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  error?: string;
  label?: string;
  required?: boolean;
  step?: string;
  min?: string;
}

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

// Chart-related types
export interface ChartDataPoint {
  x: number | Date;
  y: number;
  label?: string;
}

export interface ChartProps {
  data: ChartDataPoint[];
  width?: number;
  height?: number;
  color?: string;
}

// Navigation and routing types
export interface RouteConfig {
  path: string;
  element: React.ComponentType;
  title: string;
}

export interface NavigationItem {
  path: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  onClick?: () => void; // For placeholder functionality
  isPlaceholder?: boolean; // To distinguish placeholder items from regular navigation
}